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
