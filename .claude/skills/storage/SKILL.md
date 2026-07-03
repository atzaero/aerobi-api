---
name: storage
description: Padrão canônico de object storage (MinIO/S3) do aerobi-api ao ligar arquivos a uma entidade. Use quando for adicionar/alterar upload de imagem/arquivo/documento (avatar, imagem de grupo/aeródromo, fotos de visita, anexos), criar um novo docType, ou mexer em key de storage/bucket/presigned. Garante que a sessão monte a key certa (espelhando o banco), guarde a key e não a URL, e use buildStorageKey em vez de string à mão.
---

# Storage (MinIO/S3) — skill (aerobi-api)

## Acionar

Ao adicionar/alterar storage de arquivos numa entidade: "avatar do usuário",
"imagem do aeródromo", "fotos da visita", "anexo", "novo tipo de documento",
"subir no MinIO", "presigned URL", "bucket".

## Fonte

Guia completo e passo-a-passo: [`src/modules/storage/README.md`](../../../src/modules/storage/README.md). Esta skill é o resumo operacional.

## Gramática da key (espelha o banco)

```
{entidade}/{itemId}/{docType}/{fileId}[-{slug}].{ext}
```

- **entidade** = tabela **dona** do arquivo (coleção usa a entidade-**raiz**, nunca a avó). Ex.: `users`, `groups`, `aerodromes`, `technical-visits`, `movements`.
- **docType** = tipo (`avatar`, `image`, `kml`, `plan_ordinance`, ou a `section`). snake_case, **sempre presente**.
- **fileId** = `uuid` opaco. Nome original em coluna de metadado, **nunca** na key.
- Ambiente **é o bucket** (`aerobi-{dev,staging,prod}`), não prefixo.

## Checklist (1 PR)

1. **Schema** — 1-ativa: coluna `xxxKey String? @db.Text` + tabela estilo `GroupImage` (`imageKey, originalFilename, mimeType, sizeBytes, uploadedBy, deletedAt`, FK `onDelete: Restrict`). Coleção N-por-item: só a tabela. Migration + `prisma generate`.
2. **Key** — helper de domínio fino que delega a `buildStorageKey` (`@/modules/storage/keys`): `buildUuidLeaf(randomUUID(), resolveKeyExtension({ mimetype }))` (arquivo único) ou `buildUniqueLeaf(uuid, originalFilename)` (múltiplos). Registre `docType` novo em `keys/storage-doc-type.ts`.
3. **Controller** — `FileInterceptor('image', { limits: { fileSize } })` (Multer memory) + guards do domínio.
4. **Service** — validar mimetype (allowlist **+ magic bytes**, rejeita 0-byte) → `storage.upload(file, key)` → persistir a key → **compensar** órfão (`storage.delete`) se o INSERT falhar. Se a key precisa do id da própria linha (1:1), **pré-gere o uuid** no service (molde `movements`).
5. **Leitura** — `resolveBestEffortPresignedUrl(storage, key)` (falha → `null`).
6. **DTO** — expõe `xxxUrl: string | null` presigned; em listas resolve por item em paralelo.
7. Testes por camada + docs Swagger.

## Do / Don't

- ✅ `buildStorageKey`. ❌ montar a string da key à mão.
- ✅ guardar `*_key`. ❌ guardar a URL no banco.
- ✅ presigned on-read (buckets privados). ❌ URL pública/fixa.
- ✅ upload → persist → compensação. ❌ persistir antes do upload.
- ✅ objeto imutável (novo uuid). ❌ sobrescrever a mesma key.

## Moldes

- **Coleção 1-imagem-ativa**: `src/modules/groups/` (`utils/group-image.ts`, `repositories/group-image.repository.ts`).
- **1:1 na linha, id pré-gerado**: `src/modules/movements/` (`utils/reading-image.ts`, `services/create-movement.service.ts`).
