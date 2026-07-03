# Storage (MinIO/S3) — guia canônico

Como qualquer entidade do `aerobi-api` guarda arquivos (imagens, documentos) no
object storage. **Fonte única** — ao adicionar storage a um módulo, siga este
documento; não invente convenção de key nem cliente S3 próprio.

## Princípio: o storage espelha o banco

A key de um objeto tem sempre a forma:

```
{entidade}/{itemId}/{docType}/{fileId}[-{slug}].{ext}
```

- **`entidade`** — a tabela **dona** do arquivo (o id pelo qual se consulta). Para
  chave 1:1 na linha (`Movement.imageKey`, `Group.imageKey`) é a própria entidade;
  para **coleção** (N por item, ex. `technical_visit_images`) é a entidade-**raiz**
  (a visita), **nunca** a avó (o aeródromo). Valor = nome do módulo/rota (inglês).
- **`docType`** — o tipo de arquivo (`image`, `kml`, `plan_ordinance`, ou a
  `section` de uma visita). **snake_case**, sempre presente.
- **`fileId`** — `uuid` opaco. Nome original **nunca** vai na key (vai em coluna de
  metadado). `-{slug}` opcional para pastas de múltiplos arquivos.

| Tabela dona da key | Prefixo |
|---|---|
| `groups` (`Group.imageKey`) | `groups/{groupId}/images/…` |
| `aerodromes` (`Aerodrome.imageKey`) | `aerodromes/{aerodromeId}/image/…` |
| `technical_visit_images` (raiz `technical_visits`) | `technical-visits/{visitId}/{section}/…` |
| `movements` (`Movement.imageKey`) | `movements/{movementId}/image/…` |

Ambiente **é o bucket** (`aerobi-dev` / `aerobi-staging` / `aerobi-prod`), não um
prefixo. Um bucket por app; outras apps na mesma instância usam `<app>-<env>`.

## Regras invioláveis

1. **Guardar a KEY no banco, nunca a URL.** Coluna `*_key` (`@db.Text`); o DTO
   expõe `*Url` **presigned** (transitório, TTL 1h) resolvido on-read.
2. **Nome de arquivo opaco** (`uuid`); nome original em coluna de metadado.
3. **Objetos imutáveis** — novo upload = novo `uuid` + ponteiro; nunca sobrescreve.
4. **Buckets privados; só a API escreve** (multipart → controller → `StorageService`).
   Clientes nunca escrevem direto no MinIO.
5. **`entidade`/`docType` são tipados** (`StorageDomain` + `STORAGE_DOC_TYPES`), não
   string solta. Tipo novo? Registre em `keys/storage-doc-type.ts`.

## Como adicionar storage a uma entidade

1. **Schema** (`prisma/schema.prisma`):
   - 1 arquivo ativo por entidade → coluna `xxxKey String? @map("xxx_key") @db.Text`
     na entidade **+** tabela dedicada estilo `GroupImage`
     (`imageKey`, `originalFilename`, `mimeType`, `sizeBytes`, `uploadedBy`,
     `deletedAt`) com FK `onDelete: Restrict`. Migration + `prisma generate`.
   - Coleção (N por item) → só a tabela dedicada (ver `TechnicalVisitImage`), sem
     `*_key` desnormalizado.
2. **Key** — um helper de domínio fino que delega a `buildStorageKey`:
   ```ts
   import {
     StorageDomain, buildStorageKey, buildUuidLeaf, resolveKeyExtension,
   } from '@/modules/storage/keys';

   export function buildXxxImageKey(itemId: string, mimetype: string): string {
     return buildStorageKey({
       domain: StorageDomain.XXX,
       itemId,
       docType: 'image',
       leaf: buildUuidLeaf(randomUUID(), resolveKeyExtension({ mimetype })),
     });
   }
   ```
   Para múltiplos arquivos com nome preservado, use `buildUniqueLeaf(uuid, originalFilename)`.
3. **Controller** — multipart com Multer em memória:
   `@UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX } }))` +
   `@UploadedFile()`. Guards conforme o domínio (`JwtAuthGuard` + escopo).
4. **Service** — valida (mimetype na allowlist **+ magic bytes**, rejeita 0-byte),
   monta a key, `storage.upload(file, key)`, persiste a key na tx, e **compensa**
   removendo o objeto órfão (`storage.delete`) se o INSERT falhar. Se a key precisa
   do id do item (1:1 na própria linha), **pré-gere o `uuid`** no service e persista-o
   explicitamente (ver `movements`).
5. **Leitura** — `resolveBestEffortPresignedUrl(storage, key)` (falha de assinatura
   → `null`, não derruba a consulta). Nunca persistir/retornar a URL crua.
6. **DTO/mapper** — expõe `xxxUrl: string | null` (presigned). Em listas, resolver
   por item em paralelo (`Promise.all`).
7. **Testes** por camada + docs Swagger.

## Do / Don't

- ✅ `buildStorageKey` (ou helper de domínio que delega a ele). ❌ montar a string à mão.
- ✅ guardar `*_key`. ❌ guardar `https://…` no banco.
- ✅ presigned on-read best-effort. ❌ URL fixa/pública (buckets são privados).
- ✅ upload → persist → compensação de órfão. ❌ persistir antes do upload.
- ✅ objeto imutável (novo uuid). ❌ sobrescrever a mesma key.

## Config

- Envs: `MINIO_ENDPOINT` (interno), `MINIO_PUBLIC_ENDPOINT` (assinatura),
  `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` (canônico;
  `MINIO_BUCKET_READINGS` é fallback deprecado), `MINIO_REGION`.
- Resolução de bucket/region: `storage.config.ts` (compartilhado com os seeds).
- Provisionamento do bucket: `aerobi-ansible` (`roles/minio`) + `aerobi-local-infra`.

## Error codes

`ErrorCode.STORAGE_UPLOAD_FAILED` / `STORAGE_DELETE_FAILED` /
`STORAGE_GET_PRESIGNED_URL_FAILED` / `STORAGE_DOWNLOAD_FAILED` — via
`CustomHttpException` + `ErrorMessageService`.

## Referências no código

- Gramática/builders: [`keys/`](./keys/) (`build-storage-key.ts`,
  `storage-domain.enum.ts`, `storage-doc-type.ts`, `filename.util.ts`).
- Fachada: [`services/storage.service.ts`](./services/storage.service.ts);
  provider: [`providers/minio-storage.provider.ts`](./providers/minio-storage.provider.ts).
- Leitura presigned: [`utils/resolve-presigned-url.ts`](./utils/resolve-presigned-url.ts).
- **Molde (coleção 1-ativa)**: `src/modules/groups/` (`utils/group-image.ts`,
  `repositories/group-image.repository.ts`, `utils/group-response.ts`).
- **Molde (1:1 com id pré-gerado)**: `src/modules/movements/` (`utils/reading-image.ts`,
  `services/create-movement.service.ts`).
