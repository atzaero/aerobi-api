# [2.6.0-beta.5](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.4...v2.6.0-beta.5) (2026-06-08)


### Features

* **readings:** GET /readings (paginado), GET/:id e DELETE/:id ([#186](https://github.com/atzaero/aerobi-api/issues/186)) ([#195](https://github.com/atzaero/aerobi-api/issues/195)) ([dcb5e7b](https://github.com/atzaero/aerobi-api/commit/dcb5e7bcd6e3843c9082bd5e26bb1f348d00c1d3)), closes [#183](https://github.com/atzaero/aerobi-api/issues/183)
* **readings:** model AircraftReading + migration ([#183](https://github.com/atzaero/aerobi-api/issues/183)) ([#191](https://github.com/atzaero/aerobi-api/issues/191)) ([6e3ea77](https://github.com/atzaero/aerobi-api/commit/6e3ea77a35e2c025b0e517b075a051290783889f))
* **readings:** POST /readings — ingestão single compatível com o Python ([#184](https://github.com/atzaero/aerobi-api/issues/184)) ([#193](https://github.com/atzaero/aerobi-api/issues/193)) ([7c284a2](https://github.com/atzaero/aerobi-api/commit/7c284a2f98bb768269d72b35e888ef9057354d59)), closes [#187](https://github.com/atzaero/aerobi-api/issues/187) [#182](https://github.com/atzaero/aerobi-api/issues/182) [#183](https://github.com/atzaero/aerobi-api/issues/183)
* **readings:** POST /readings/batch — ingestão em lote ([#185](https://github.com/atzaero/aerobi-api/issues/185)) ([#197](https://github.com/atzaero/aerobi-api/issues/197)) ([ae5da1e](https://github.com/atzaero/aerobi-api/commit/ae5da1ed3122a483b6944b47c677633ae6148781)), closes [#184](https://github.com/atzaero/aerobi-api/issues/184)
* **storage:** módulo MinIO/S3 com presigned URLs ([#182](https://github.com/atzaero/aerobi-api/issues/182)) ([#190](https://github.com/atzaero/aerobi-api/issues/190)) ([63d8c30](https://github.com/atzaero/aerobi-api/commit/63d8c30f52e238e3e71177606aab89c0ace7227b))

# [2.6.0-beta.4](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.3...v2.6.0-beta.4) (2026-06-02)


### Bug Fixes

* **deploy:** usa project_name aerobi-api-staging para isolar staging do frontend ([#169](https://github.com/atzaero/aerobi-api/issues/169)) ([98448c8](https://github.com/atzaero/aerobi-api/commit/98448c8fa94271e2b4baa912b187d089e09977ac))

# [2.6.0-beta.3](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.2...v2.6.0-beta.3) (2026-06-02)


### Features

* adiciona /babysit-pr e integra no complete-flow ([f634a2f](https://github.com/atzaero/aerobi-api/commit/f634a2f31c73b7654508d6fd15f9920af26ae155))

# [2.6.0-beta.2](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.1...v2.6.0-beta.2) (2026-06-01)


### Bug Fixes

* **ci:** gera .env de deploy a partir de todos os secrets do Environment ([1978ee8](https://github.com/atzaero/aerobi-api/commit/1978ee8a653de1fe4ec0fa2e9760533be0ce2fd5))

# [2.6.0-beta.1](https://github.com/atzaero/aerobi-api/compare/v2.5.0...v2.6.0-beta.1) (2026-06-01)


### Bug Fixes

* **deps:** lockfile compatível com npm 10 (CI) e override fast-uri ([13e88ff](https://github.com/atzaero/aerobi-api/commit/13e88ff52377798a02bba6e4003a2da4102f0db9)), closes [#96](https://github.com/atzaero/aerobi-api/issues/96)
* **deps:** remover override npm do package.json ([#97](https://github.com/atzaero/aerobi-api/issues/97)) ([0d75112](https://github.com/atzaero/aerobi-api/commit/0d75112f033de483e38157c86cd077276a231012))
* **seeds:** RUN_SEEDS_ON_BOOT default true em dev / false em prod ([#121](https://github.com/atzaero/aerobi-api/issues/121)) ([ddd4631](https://github.com/atzaero/aerobi-api/commit/ddd4631dc5cc6a0b1cc6f2ccbbe7b5092fb346e9))
* **swagger:** reescreve descrição evitando bold+inline-code adjacente ([f80a6ff](https://github.com/atzaero/aerobi-api/commit/f80a6ff14660d13b75175555afb0f0dbd5f6f780)), closes [#124](https://github.com/atzaero/aerobi-api/issues/124)
* **swagger:** registrar Bearer JWT no DocumentBuilder ([#124](https://github.com/atzaero/aerobi-api/issues/124)) ([113a8ff](https://github.com/atzaero/aerobi-api/commit/113a8ffc011198d55f1a41665d7be12f2b460387))
* **users,auth:** DI por classe direta + validator IsStrongPassword decorator ([08934ec](https://github.com/atzaero/aerobi-api/commit/08934eccd096baa34d26b5e8c2aa8428a53b41af)), closes [#117](https://github.com/atzaero/aerobi-api/issues/117)


### Features

* **auth:** módulo auth com JWT RS256 + refresh token rotacionado ([#113](https://github.com/atzaero/aerobi-api/issues/113)) ([a02b02c](https://github.com/atzaero/aerobi-api/commit/a02b02c0460f094a9254e6640704c4645e031391))
* **aviascan:** adiciona proxy paginado de leituras de matrículas ([e7da543](https://github.com/atzaero/aerobi-api/commit/e7da5439097a3f7e3d34e219ac1089734e1616ee)), closes [#154](https://github.com/atzaero/aerobi-api/issues/154)
* **aviascan:** cache in-memory das leituras paginadas ([ad6dc18](https://github.com/atzaero/aerobi-api/commit/ad6dc188e59cd46b67d026fc1d24bc9994cd2239)), closes [#156](https://github.com/atzaero/aerobi-api/issues/156)
* **ci:** adiciona caminho de deploy staging via semantic-release prerelease ([6f76fc3](https://github.com/atzaero/aerobi-api/commit/6f76fc39a0286bd2c10b3605773ba3f645d43fd6))
* **users,auth:** tabela users + RefreshToken + TokenType.INVITE + seed bootstrap ([#111](https://github.com/atzaero/aerobi-api/issues/111)) ([75b951f](https://github.com/atzaero/aerobi-api/commit/75b951f5b0e89b853bf110d6edb41374d7c6b314))
* **users:** módulo users com CRUD + invite/accept + password-reset ([#117](https://github.com/atzaero/aerobi-api/issues/117)) ([5426d4c](https://github.com/atzaero/aerobi-api/commit/5426d4cc3748302b1c81f9e76d72d9303ef2bace)), closes [#111](https://github.com/atzaero/aerobi-api/issues/111) [#114](https://github.com/atzaero/aerobi-api/issues/114) [#116](https://github.com/atzaero/aerobi-api/issues/116)

# [2.5.0](https://github.com/atzaero/aerobi-api/compare/v2.4.0...v2.5.0) (2026-05-08)


### Bug Fixes

* **atualiza dependências:** sincroniza package.json com develop e adiciona dependências ANAC ([aade069](https://github.com/atzaero/aerobi-api/commit/aade0695c8f5832060337ea29946015df2bbb74d))
* **ci:** lockfile pós npm audit e Prettier no módulo ANAC ([83d39e7](https://github.com/atzaero/aerobi-api/commit/83d39e7c36f4facb3cd6eda224927291c95fe973))
* **ci:** regenerar package-lock.json para npm ci no GitHub Actions ([f1500a4](https://github.com/atzaero/aerobi-api/commit/f1500a41a7b97dbc5318445192956eb67b5ae0ef))
* **dependências:** resolve conflitos com develop atualizada ([130c3f4](https://github.com/atzaero/aerobi-api/commit/130c3f449711c31384a20683d08f343d336c9b5e))
* **dependências:** resolve conflitos e regenera package-lock.json ([b9417a6](https://github.com/atzaero/aerobi-api/commit/b9417a6b1aa2474f2cc988e07b1934e199541c3e))
* **lint:** resolve ESLint issues for CI gate ([bbbfe69](https://github.com/atzaero/aerobi-api/commit/bbbfe69c2e3a600995878a2ae4a7448b40d7a103))
* **test:** fake timers nos testes ANAC (rate limit + cache TTL) ([f1ab567](https://github.com/atzaero/aerobi-api/commit/f1ab567113c9a9912b18381cba865d18c8fdd534))
* **tokens:** align token metadata type with Prisma InputJsonValue ([93beb13](https://github.com/atzaero/aerobi-api/commit/93beb132b43ba2a2adadb44494101e5f49f0b5a9))


### Features

* **anac:** módulo para consulta de licenças de piloto via ANAC ([b91f066](https://github.com/atzaero/aerobi-api/commit/b91f0664c794726d4e5a041d6fbf772e0248592e))
* **common:** adiciona CustomHttpException com errorCode no payload ([6d23ba2](https://github.com/atzaero/aerobi-api/commit/6d23ba2df362bcb1432b8ce2516833683c38e92a)), closes [#42](https://github.com/atzaero/aerobi-api/issues/42)
* **common:** adiciona EmailService com templates e Ethereal em dev ([5de503e](https://github.com/atzaero/aerobi-api/commit/5de503e4e994bbd9536fee01d0c0062c37178bdc))
* **common:** adiciona EncryptionService (AES-256-GCM) ([213cc47](https://github.com/atzaero/aerobi-api/commit/213cc47641a80a7731691232985c9c462ae82279)), closes [#43](https://github.com/atzaero/aerobi-api/issues/43)
* **common:** adiciona enum ErrorCode e centralizador de mensagens ([d047185](https://github.com/atzaero/aerobi-api/commit/d0471855b42b1dc0ce4984489b2a749b23b5f688)), closes [#42](https://github.com/atzaero/aerobi-api/issues/42)
* **common:** estende AllExceptionsFilter para expor errorCode ([12764b8](https://github.com/atzaero/aerobi-api/commit/12764b8e33ec1986346baf2b0c30fbb6fecc7910)), closes [#42](https://github.com/atzaero/aerobi-api/issues/42)
* **health:** retorna diagnósticos de DB, memória, uptime, env e versão ([06bb0c5](https://github.com/atzaero/aerobi-api/commit/06bb0c541510c4bf29da7578191671431dca36cb)), closes [#45](https://github.com/atzaero/aerobi-api/issues/45)
* **tokens:** adiciona EmailVerificationTokenService e PasswordResetTokenService ([5da2978](https://github.com/atzaero/aerobi-api/commit/5da297834b7847d6dd35f84d2a595768a5773e2f))
* **tokens:** adiciona TokenGenerationService (plain + bcrypt) ([ace3de6](https://github.com/atzaero/aerobi-api/commit/ace3de68061297396560f9ff3a61e63b035804d1))
* **tokens:** adiciona TokenRepository com busca/invalidação/soft-delete ([ea8c92b](https://github.com/atzaero/aerobi-api/commit/ea8c92b850f8a90e4986af040003f1f3e3be34f6))
* **tokens:** adiciona TokenValidationService com CustomHttpException ([bc57d10](https://github.com/atzaero/aerobi-api/commit/bc57d1096536b064778682f6c4259b999cb1e168))
* **tokens:** registra TokensModule no AppModule ([2fec184](https://github.com/atzaero/aerobi-api/commit/2fec18463abab7abc489fc906673d0397d87ca4a))

# [2.4.0](https://github.com/atzaero/aerobi-api/compare/v2.3.2...v2.4.0) (2026-04-20)


### Features

* **prisma:** domínio operacional ex-Firestore ([#36](https://github.com/atzaero/aerobi-api/issues/36)) ([#37](https://github.com/atzaero/aerobi-api/issues/37)) ([e162ec8](https://github.com/atzaero/aerobi-api/commit/e162ec82b263a6e6df1078cf6ca2505b39ff68a9))

## [2.3.2](https://github.com/atzaero/aerobi-api/compare/v2.3.1...v2.3.2) (2026-04-14)


### Bug Fixes

* **core:** habilitar shutdown hooks para graceful shutdown ([d2fa510](https://github.com/atzaero/aerobi-api/commit/d2fa510df7ace61254311aa182a68be956d8c058))

## [2.3.1](https://github.com/atzaero/aerobi-api/compare/v2.3.0...v2.3.1) (2026-04-14)


### Bug Fixes

* **plugfield:** alinhar query params e docs Swagger com spec Plugfield ([cb58286](https://github.com/atzaero/aerobi-api/commit/cb582860cfb6ebb21fbdcac92323abbd1d323f9c)), closes [#186](https://github.com/atzaero/aerobi-api/issues/186)
* **plugfield:** remover prefixo Bearer do header Authorization ([d2069f9](https://github.com/atzaero/aerobi-api/commit/d2069f906df30e232aaf61978c82a3dd1709362a))

# [2.3.0](https://github.com/atzaero/aerobi-api/compare/v2.2.0...v2.3.0) (2026-04-07)


### Features

* **aisweb:** módulo AISWEB — proxy NOTAM, ROTAER, SOL e Infotemp ([#25](https://github.com/atzaero/aerobi-api/issues/25)) ([734634b](https://github.com/atzaero/aerobi-api/commit/734634b7d03ff2752073d0181c562b57a66cca87)), closes [#24](https://github.com/atzaero/aerobi-api/issues/24)

# [2.2.0](https://github.com/atzaero/aerobi-api/compare/v2.1.0...v2.2.0) (2026-04-06)


### Features

* **public-aerodromes:** extração e API de aeródromos públicos (ANAC CSV) ([#22](https://github.com/atzaero/aerobi-api/issues/22)) ([e3c4f79](https://github.com/atzaero/aerobi-api/commit/e3c4f79bf43c279a751c4b58647428e5511e0c2b))

# [2.1.0](https://github.com/atzaero/aerobi-api/compare/v2.0.2...v2.1.0) (2026-04-06)


### Features

* **private-aerodromes:** adicionar GET /private-aerodromes paginado e GET /latest-period ([#19](https://github.com/atzaero/aerobi-api/issues/19)) ([fa5375b](https://github.com/atzaero/aerobi-api/commit/fa5375b7b2512f6b763d17895d681874114d06bb)), closes [#18](https://github.com/atzaero/aerobi-api/issues/18)

## [2.0.2](https://github.com/atzaero/aerobi-api/compare/v2.0.1...v2.0.2) (2026-04-05)


### Bug Fixes

* **ci:** consolidar deploy em release.yml após build da imagem Docker ([#16](https://github.com/atzaero/aerobi-api/issues/16)) ([86d3966](https://github.com/atzaero/aerobi-api/commit/86d3966d1ffc6d3b7316f23db2761993dacd54e5)), closes [#15](https://github.com/atzaero/aerobi-api/issues/15)

## [2.0.1](https://github.com/atzaero/aerobi-api/compare/v2.0.0...v2.0.1) (2026-04-05)


### Bug Fixes

* **ci:** pull antes do down no deploy e checkout da tag no build Docker ([#13](https://github.com/atzaero/aerobi-api/issues/13)) ([2b198fd](https://github.com/atzaero/aerobi-api/commit/2b198fdc6bbdb11368083edda4d67c605232e484)), closes [#12](https://github.com/atzaero/aerobi-api/issues/12)

# [2.0.0](https://github.com/atzaero/aerobi-api/compare/v1.3.0...v2.0.0) (2026-04-05)


* feat(auth)!: AerobiApiKeyGuard, Plugfield credenciais no servidor ([c370977](https://github.com/atzaero/aerobi-api/commit/c370977e2b54ef4d5e0924b8f8b9075f12c09407)), closes [#9](https://github.com/atzaero/aerobi-api/issues/9)


### Features

* **plugfield:** adiciona módulo proxy para API Plugfield ([625fc86](https://github.com/atzaero/aerobi-api/commit/625fc8656240a853bd63eaa00a306e45af06b7bd)), closes [#9](https://github.com/atzaero/aerobi-api/issues/9)


### BREAKING CHANGES

* substitui RAB_SYNC_API_KEY, PRIVATE_AERODROMES_SYNC_API_KEY e PLUGFIELD_SYNC_API_KEY;
PLUGFIELD_VENDOR_* passa a PLUGFIELD_API_KEY / PLUGFIELD_TOKEN.

## Unreleased

### BREAKING CHANGES

* **auth:** uma única API key para o cliente — `AEROBI_API_KEY` + `AEROBI_REQUIRE_AUTH` substituem `RAB_SYNC_API_KEY`, `PRIVATE_AERODROMES_SYNC_API_KEY`, `PLUGFIELD_SYNC_API_KEY` e os respetivos `*_REQUIRE_AUTH`. Guard unificado: `AerobiApiKeyGuard`.
* **plugfield:** credenciais vendor só no servidor — `PLUGFIELD_API_KEY` e `PLUGFIELD_TOKEN` substituem `PLUGFIELD_VENDOR_API_KEY` e `PLUGFIELD_VENDOR_AUTHORIZATION`; deixa de se repassar `Authorization` do cliente. Removido `POST /plugfield/login` na Aerobi.

# [1.3.0](https://github.com/atzaero/aerobi-api/compare/v1.2.0...v1.3.0) (2026-04-02)


### Features

* **private-aerodromes:** add ANAC private aerodromes sync pipeline ([5794689](https://github.com/atzaero/aerobi-api/commit/57946896462508153d4c10b987de1048feb36e73))

# [1.2.0](https://github.com/atzaero/aerobi-api/compare/v1.1.0...v1.2.0) (2026-03-31)


### Features

* **rab:** lista paginada e resposta data/meta ([78bce11](https://github.com/atzaero/aerobi-api/commit/78bce11665293a2637e43c7e95424e7b3ec70365))

# [1.1.0](https://github.com/atzaero/aerobi-api/compare/v1.0.0...v1.1.0) (2026-03-29)


### Features

* **auth:** guard on RAB sync, dev bypass, docs, Docker watch, unit tests ([281b693](https://github.com/atzaero/aerobi-api/commit/281b6936772b16ec64b89e736a89907361bd56f9))
* **docker:** compose prod/local, CI release/deploy, fix Nest dist path ([478dae7](https://github.com/atzaero/aerobi-api/commit/478dae7446d129d2b141debd6f56a90fd06af3e1))
* **rab:** autenticação RAB só com X-API-Key (RabApiKeyGuard) ([c834345](https://github.com/atzaero/aerobi-api/commit/c834345cad4e12416d08d3c69ea78c10a85de47e))
* **rab:** CSV encoding from Content-Type and synced_at timestamptz ([8b5a738](https://github.com/atzaero/aerobi-api/commit/8b5a738d08d946e0daeda48540592e11b524ade3))

# 1.0.0 (2026-03-29)


### Features

* initial production setup — RAB sync, auth guard, Docker prod stack ([#1](https://github.com/atzaero/aerobi-api/issues/1)) ([dc21784](https://github.com/atzaero/aerobi-api/commit/dc2178407305989a57c73cb9a183a0cdbbbc2325))
