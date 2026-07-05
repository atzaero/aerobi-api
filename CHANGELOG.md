# [2.6.0-beta.45](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.44...v2.6.0-beta.45) (2026-07-05)


### Features

* **landing-requests:** paridade Firebase→API ([#377](https://github.com/atzaero/aerobi-api/issues/377)) ([8a7056f](https://github.com/atzaero/aerobi-api/commit/8a7056f14b21a0a71e7d74671bd766e60d673c94))

# [2.6.0-beta.44](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.43...v2.6.0-beta.44) (2026-07-03)


### Features

* **audit:** instrumenta groups (create/update/delete) com AuditRecorderService — [#367](https://github.com/atzaero/aerobi-api/issues/367) ([3fb77ca](https://github.com/atzaero/aerobi-api/commit/3fb77ca4a186205d6c11a8bd782ac67fa273c1d5))
* **audit:** instrumenta users (create/update/delete/reset) com AuditRecorderService — [#367](https://github.com/atzaero/aerobi-api/issues/367) ([db3ed2f](https://github.com/atzaero/aerobi-api/commit/db3ed2fb4c35eca0a853721d1963151d2383501e))
* **audit:** módulo AuditLog na API — fundação de gravação/leitura — [#367](https://github.com/atzaero/aerobi-api/issues/367) ([8bc0015](https://github.com/atzaero/aerobi-api/commit/8bc0015d4d84e1ddf1373b4b4e196b86ebd77c70)), closes [#353](https://github.com/atzaero/aerobi-api/issues/353)

# [2.6.0-beta.43](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.42...v2.6.0-beta.43) (2026-07-03)


### Features

* **cameras:** módulo CRUD interno de câmeras (metadados no Postgres) — [#372](https://github.com/atzaero/aerobi-api/issues/372) ([bb4a3ac](https://github.com/atzaero/aerobi-api/commit/bb4a3ac1e3cc4c4dfd64deb447c5de6d2f0694b6)), closes [#473](https://github.com/atzaero/aerobi-api/issues/473) [#474](https://github.com/atzaero/aerobi-api/issues/474) [#475](https://github.com/atzaero/aerobi-api/issues/475) [#476](https://github.com/atzaero/aerobi-api/issues/476)

# [2.6.0-beta.42](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.41...v2.6.0-beta.42) (2026-07-03)


### Features

* **storage:** fundação de key builders + MINIO_BUCKET ([93d3d5b](https://github.com/atzaero/aerobi-api/commit/93d3d5b447aaacf1afd6adbd9552c37b8bfea5c1)), closes [#369](https://github.com/atzaero/aerobi-api/issues/369) [#444](https://github.com/atzaero/aerobi-api/issues/444) [#445](https://github.com/atzaero/aerobi-api/issues/445)

# [2.6.0-beta.41](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.40...v2.6.0-beta.41) (2026-07-02)


### Features

* **contact:** add Fale Conosco module with public create and admin moderation ([#443](https://github.com/atzaero/aerobi-api/issues/443)) ([ff01355](https://github.com/atzaero/aerobi-api/commit/ff01355a0c43c31fd45af3b0882655a4c92fffdf)), closes [#375](https://github.com/atzaero/aerobi-api/issues/375)

# [2.6.0-beta.40](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.39...v2.6.0-beta.40) (2026-07-01)


### Features

* **aerodrome-feedbacks:** paridade com aerobi-web — separa público da moderação interna ([9f873c2](https://github.com/atzaero/aerobi-api/commit/9f873c272a9d4a0d23d7c02865c457a3555795cc)), closes [#370](https://github.com/atzaero/aerobi-api/issues/370)

# [2.6.0-beta.39](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.38...v2.6.0-beta.39) (2026-07-01)


### Features

* **aerodromes:** auth JWT + escopo, paridade CRUD, set-status e observação ([#368](https://github.com/atzaero/aerobi-api/issues/368)) ([012add9](https://github.com/atzaero/aerobi-api/commit/012add9e42ccf7d6e16b29d1446b838563f1df0a)), closes [#353](https://github.com/atzaero/aerobi-api/issues/353) [#269](https://github.com/atzaero/aerobi-api/issues/269)
* **aerodromes:** PR2/2 — export CSV ([#368](https://github.com/atzaero/aerobi-api/issues/368)) ([77061b5](https://github.com/atzaero/aerobi-api/commit/77061b51f36d18bb75a10127b191724e655926fd))

# [2.6.0-beta.38](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.37...v2.6.0-beta.38) (2026-06-30)


### Features

* **users:** paridade com aerobi-web — E.164, edição admin, senha e export CSV ([fab2dc4](https://github.com/atzaero/aerobi-api/commit/fab2dc4a7b24869177e61a90c7d97227ebcfeb01)), closes [#353](https://github.com/atzaero/aerobi-api/issues/353) [#111](https://github.com/atzaero/aerobi-api/issues/111) [#371](https://github.com/atzaero/aerobi-api/issues/371)

# [2.6.0-beta.37](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.36...v2.6.0-beta.37) (2026-06-27)


### Bug Fixes

* **aerodrome-groups:** aplica findings do code-review do Bloco 3 ([#386](https://github.com/atzaero/aerobi-api/issues/386), [#392](https://github.com/atzaero/aerobi-api/issues/392)) ([c6f7715](https://github.com/atzaero/aerobi-api/commit/c6f771531c679e38c262e0bebe0a18feaf9ad3f7))
* **deps:** override linkify-it para 5.0.1 (corrige ReDoS high transitivo) ([95775ca](https://github.com/atzaero/aerobi-api/commit/95775ca67ba0123a7bb79fdb2e0260a11c22f5c9)), closes [#401](https://github.com/atzaero/aerobi-api/issues/401)

# [2.6.0-beta.36](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.35...v2.6.0-beta.36) (2026-06-26)


### Features

* **seeds:** bootstrap declarativo de grupos por estado, bandeiras e usuários por função ([1704ec6](https://github.com/atzaero/aerobi-api/commit/1704ec6ffd35d55df7395578d18decd815ecf853)), closes [#413](https://github.com/atzaero/aerobi-api/issues/413) [#227](https://github.com/atzaero/aerobi-api/issues/227)

# [2.6.0-beta.35](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.34...v2.6.0-beta.35) (2026-06-26)


### Bug Fixes

* **aerodrome-groups:** retenta P2034 no upload e mapeia conflito para 409 ([81a0a14](https://github.com/atzaero/aerobi-api/commit/81a0a143337361f447ce6f37a3576d7e785a9eaa)), closes [#397](https://github.com/atzaero/aerobi-api/issues/397)
* **aerodrome-groups:** seta headers do /export dentro do handler (só no sucesso) ([2db31b5](https://github.com/atzaero/aerobi-api/commit/2db31b596d053da495fe7f6d11c1c797ce944ba0)), closes [#391](https://github.com/atzaero/aerobi-api/issues/391)
* **aerodrome-groups:** valida magic bytes e rejeita imagem de 0 bytes no upload ([b1ae9c4](https://github.com/atzaero/aerobi-api/commit/b1ae9c491ed5390784bb011a8d28d899c11c27e6)), closes [#396](https://github.com/atzaero/aerobi-api/issues/396)
* **auth:** GroupScopeGuard responde 404 uniforme fora do escopo ([#387](https://github.com/atzaero/aerobi-api/issues/387)) ([a2758a5](https://github.com/atzaero/aerobi-api/commit/a2758a5eca971d4a1e323573c1eb7c0072c055ca))
* **auth:** GroupScopeGuard retorna 401 ACCOUNT_DELETED para conta removida ([#385](https://github.com/atzaero/aerobi-api/issues/385)) ([3d7ea03](https://github.com/atzaero/aerobi-api/commit/3d7ea0305310b2e5727ebdad9aed11ff8fcc2a31)), closes [#387](https://github.com/atzaero/aerobi-api/issues/387)

# [2.6.0-beta.34](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.33...v2.6.0-beta.34) (2026-06-25)


### Bug Fixes

* **common:** neutraliza formula/CSV injection no escapeCell ([271744e](https://github.com/atzaero/aerobi-api/commit/271744e28482a0d4d8e7a7b8fc83ca106012a153)), closes [#390](https://github.com/atzaero/aerobi-api/issues/390)

# [2.6.0-beta.33](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.32...v2.6.0-beta.33) (2026-06-25)


### Features

* **aerodrome-groups:** PR3/3 — imagem do grupo via MinIO ([#350](https://github.com/atzaero/aerobi-api/issues/350)) ([e42e83c](https://github.com/atzaero/aerobi-api/commit/e42e83c37c0b7a251bcb3ac1e13b812ddef41634))

# [2.6.0-beta.32](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.31...v2.6.0-beta.32) (2026-06-25)


### Features

* **aerodrome-groups:** PR2/3 — export CSV ([#350](https://github.com/atzaero/aerobi-api/issues/350)) ([15a2282](https://github.com/atzaero/aerobi-api/commit/15a2282be629a39b5406b3f87a49337f70d6e565))

# [2.6.0-beta.31](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.30...v2.6.0-beta.31) (2026-06-25)


### Features

* **aerodrome-groups:** PR1/3 — auth real, escopo e paridade de CRUD ([#350](https://github.com/atzaero/aerobi-api/issues/350)) ([18f748f](https://github.com/atzaero/aerobi-api/commit/18f748fdcea11cdabce0dd0f17684161810620da))

# [2.6.0-beta.30](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.29...v2.6.0-beta.30) (2026-06-24)


### Bug Fixes

* **deps:** remove semantic-release das devDeps para zerar o npm audit ([31e6638](https://github.com/atzaero/aerobi-api/commit/31e663880caa1d938824ef0761c169dcb7c5bcbe))

# [2.6.0-beta.29](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.28...v2.6.0-beta.29) (2026-06-24)


### Bug Fixes

* **deps:** elimina cascata js-yaml do npm audit (23 -> 1, prod -> 0) ([27905b8](https://github.com/atzaero/aerobi-api/commit/27905b80f066d8facdee7b92a611e485e62750cd))

# [2.6.0-beta.28](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.27...v2.6.0-beta.28) (2026-06-19)


### Features

* **movements:** expõe metadados de exclusão lógica (deletedAt/deletedBy) ([406c4ee](https://github.com/atzaero/aerobi-api/commit/406c4ee59334f34842935a3de0b40d435773a6f6)), closes [atzaero/aerobi-api#339](https://github.com/atzaero/aerobi-api/issues/339)

# [2.6.0-beta.27](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.26...v2.6.0-beta.27) (2026-06-19)


### Features

* **movements:** adiciona conformity_status ao movimento (coluna, filtro e fluxo) ([badc1d0](https://github.com/atzaero/aerobi-api/commit/badc1d0c692b951b3cd3dd87bd83baa2e8a3efd3))

# [2.6.0-beta.26](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.25...v2.6.0-beta.26) (2026-06-18)


### Features

* **movements:** permite editar a matrícula (registration) com normalização canônica ([#336](https://github.com/atzaero/aerobi-api/issues/336)) ([0b222c1](https://github.com/atzaero/aerobi-api/commit/0b222c1f0210870accc2e1007a73532d5680012c)), closes [#335](https://github.com/atzaero/aerobi-api/issues/335)

# [2.6.0-beta.25](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.24...v2.6.0-beta.25) (2026-06-18)


### Bug Fixes

* **deps:** corrige advisories HIGH de nodemailer e undici ([d1c9049](https://github.com/atzaero/aerobi-api/commit/d1c9049f205a28ded79c2949547b91d32f12d370))

# [2.6.0-beta.24](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.23...v2.6.0-beta.24) (2026-06-18)


### Features

* **movements:** enxuga GET /movements e adiciona filtros operation_type/source ([c2d55d9](https://github.com/atzaero/aerobi-api/commit/c2d55d977f2d9526a8b37d41e590f210514218c4)), closes [#328](https://github.com/atzaero/aerobi-api/issues/328) [#327](https://github.com/atzaero/aerobi-api/issues/327)
* **movements:** normaliza operadores/proprietarios em GET /movements/:id ([3542aa7](https://github.com/atzaero/aerobi-api/commit/3542aa7dc2c1e9f157bcef13feb66a92ac524d38)), closes [#327](https://github.com/atzaero/aerobi-api/issues/327) [#329](https://github.com/atzaero/aerobi-api/issues/329) [#328](https://github.com/atzaero/aerobi-api/issues/328)

# [2.6.0-beta.23](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.22...v2.6.0-beta.23) (2026-06-17)


### Bug Fixes

* **streams:** aceita ICAO alfanumérico no endpoint de câmeras ([dd90e94](https://github.com/atzaero/aerobi-api/commit/dd90e945f84b4a18afdf4849e4ca32416857ed68)), closes [#323](https://github.com/atzaero/aerobi-api/issues/323)

# [2.6.0-beta.22](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.21...v2.6.0-beta.22) (2026-06-16)


### Bug Fixes

* **streams:** variante .m3u8 + LL-HLS + rotas públicas ([#321](https://github.com/atzaero/aerobi-api/issues/321)) ([a629d51](https://github.com/atzaero/aerobi-api/commit/a629d5153e17a8c30bc4b32b2e87a3ac1086182a))

# [2.6.0-beta.21](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.20...v2.6.0-beta.21) (2026-06-16)


### Bug Fixes

* **deploy:** authkey tag:ci não-efêmera + remove tailscale logout do Cleanup ([#320](https://github.com/atzaero/aerobi-api/issues/320)) ([c236815](https://github.com/atzaero/aerobi-api/commit/c2368158b5400c4d289ec49aa44207631b2678d3)), closes [aerobi-ansible#47](https://github.com/aerobi-ansible/issues/47) [#319](https://github.com/atzaero/aerobi-api/issues/319) [atzaero/aerobi#961](https://github.com/atzaero/aerobi/issues/961)

# [2.6.0-beta.20](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.19...v2.6.0-beta.20) (2026-06-15)


### Bug Fixes

* AllExceptionsFilter respeita headersSent ([2173c5d](https://github.com/atzaero/aerobi-api/commit/2173c5dd51cd9ef2f5599e36aa6f53d40a92c631)), closes [#317](https://github.com/atzaero/aerobi-api/issues/317)
* **streams:** TTL negativo curto no cache do resolver ([f533f0d](https://github.com/atzaero/aerobi-api/commit/f533f0da6cfdcbf9a66fdeb37bd64f896fd9a9ab)), closes [#74](https://github.com/atzaero/aerobi-api/issues/74)


### Features

* **streams:** resolver câmera no Firestore (cache) + HlsProxyService ([7c434ab](https://github.com/atzaero/aerobi-api/commit/7c434ab909bd1d01058273b03f8efd6b75c90251)), closes [#317](https://github.com/atzaero/aerobi-api/issues/317) [#74](https://github.com/atzaero/aerobi-api/issues/74)
* **streams:** rotas de listagem e proxy HLS (AerobiApiKeyGuard) ([a9f89b8](https://github.com/atzaero/aerobi-api/commit/a9f89b8df9beea47bafa9397a16e5669b5cef97f)), closes [#74](https://github.com/atzaero/aerobi-api/issues/74) [#75](https://github.com/atzaero/aerobi-api/issues/75)

# [2.6.0-beta.19](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.18...v2.6.0-beta.19) (2026-06-15)


### Features

* **conformity:** expõe telefone no GroupContact do diretório ([cf990ab](https://github.com/atzaero/aerobi-api/commit/cf990ab024a779396fef2661b6c94a209cbf528d)), closes [304/#307](https://github.com/atzaero/aerobi-api/issues/307)
* **movements:** evento agregado de lote e flag batched para notificações ([5efcec8](https://github.com/atzaero/aerobi-api/commit/5efcec8cf52dc3497266be0608e1dad58a1cc858)), closes [304/#309](https://github.com/atzaero/aerobi-api/issues/309)
* **notifications:** notificações WhatsApp de movements via Evolution GO ([d4bac47](https://github.com/atzaero/aerobi-api/commit/d4bac477f1b3fcc41f6ac1012a4f2087dae8d5c6)), closes [#305](https://github.com/atzaero/aerobi-api/issues/305) [#306](https://github.com/atzaero/aerobi-api/issues/306) [#307](https://github.com/atzaero/aerobi-api/issues/307) [#308](https://github.com/atzaero/aerobi-api/issues/308) [#309](https://github.com/atzaero/aerobi-api/issues/309) [#310](https://github.com/atzaero/aerobi-api/issues/310)

# [2.6.0-beta.18](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.17...v2.6.0-beta.18) (2026-06-14)


### Bug Fixes

* **movements:** persistir e filtrar registration na forma canônica ([297a3df](https://github.com/atzaero/aerobi-api/commit/297a3df25eca134994f0bf9ad23799f6a81e39ac)), closes [#291](https://github.com/atzaero/aerobi-api/issues/291)

# [2.6.0-beta.17](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.16...v2.6.0-beta.17) (2026-06-13)


### Bug Fixes

* **movements:** casar matrícula com forma canônica do RAB no snapshot ([1f0be6f](https://github.com/atzaero/aerobi-api/commit/1f0be6f106454dcd88a61193fa9b4f539123c5e0)), closes [#289](https://github.com/atzaero/aerobi-api/issues/289)

# [2.6.0-beta.16](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.15...v2.6.0-beta.16) (2026-06-13)


### Bug Fixes

* timestamp de boot no log de inicialização da API ([#287](https://github.com/atzaero/aerobi-api/issues/287)) ([80f3326](https://github.com/atzaero/aerobi-api/commit/80f33261d8be77c406fa665f3aeba8f07171bd3f)), closes [#286](https://github.com/atzaero/aerobi-api/issues/286)

# [2.6.0-beta.15](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.14...v2.6.0-beta.15) (2026-06-12)


### Bug Fixes

* incluir ambiente (NODE_ENV) no log de inicialização da API ([#285](https://github.com/atzaero/aerobi-api/issues/285)) ([3591b73](https://github.com/atzaero/aerobi-api/commit/3591b732105ab43bec91f6e0b94c518e7a7fd4ca)), closes [#284](https://github.com/atzaero/aerobi-api/issues/284)

# [2.6.0-beta.14](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.13...v2.6.0-beta.14) (2026-06-12)


### Features

* log de inicialização da API no bootstrap ([#283](https://github.com/atzaero/aerobi-api/issues/283)) ([a7869f4](https://github.com/atzaero/aerobi-api/commit/a7869f4a908c117d53c58b734b579629e0061c26)), closes [#282](https://github.com/atzaero/aerobi-api/issues/282)

# [2.6.0-beta.13](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.12...v2.6.0-beta.13) (2026-06-10)


### Bug Fixes

* **deploy:** retry com backoff na conexão à tailnet (blips transitórios) ([7a08cda](https://github.com/atzaero/aerobi-api/commit/7a08cdaeddf1fd47ecc983b6b05f92881b27b793)), closes [#225](https://github.com/atzaero/aerobi-api/issues/225) [#263](https://github.com/atzaero/aerobi-api/issues/263)

# [2.6.0-beta.12](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.11...v2.6.0-beta.12) (2026-06-10)


### Features

* **conformity:** @nestjs/event-emitter + emit movement.created ([8ca6587](https://github.com/atzaero/aerobi-api/commit/8ca65879a7493b09d5af6d35009527d01de50bda)), closes [#251](https://github.com/atzaero/aerobi-api/issues/251)
* **conformity:** ConformityListener — pouso automático sem solicitação registra não-conformidade ([18e6a76](https://github.com/atzaero/aerobi-api/commit/18e6a7619cd1de1c20c0753d6a5e84418fc7903b)), closes [#252](https://github.com/atzaero/aerobi-api/issues/252)
* **conformity:** integração Firestore (firebase-admin) + port + adapter ([7f51bbb](https://github.com/atzaero/aerobi-api/commit/7f51bbb8ab1e434efffad8ed7b2d5a45eb781274)), closes [#249](https://github.com/atzaero/aerobi-api/issues/249)
* **conformity:** NotificationListener — e-mail aos coordenadores/operadores do aeródromo (com dedupe) ([91fd4d2](https://github.com/atzaero/aerobi-api/commit/91fd4d2750cab94d3c8b8282f8451f346e4db230)), closes [#253](https://github.com/atzaero/aerobi-api/issues/253)
* **conformity:** schema operational_event + enums + migration ([9ffa385](https://github.com/atzaero/aerobi-api/commit/9ffa385097d5d4455a425018e3e0e830bab7cfb8)), closes [#250](https://github.com/atzaero/aerobi-api/issues/250)

# [2.6.0-beta.11](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.10...v2.6.0-beta.11) (2026-06-10)


### Bug Fixes

* **movements:** resolver snapshot RAB antes do upload da imagem ([bbbaa0d](https://github.com/atzaero/aerobi-api/commit/bbbaa0dd746a7cdca66c6a86cba9e74b2ff0f347)), closes [#233](https://github.com/atzaero/aerobi-api/issues/233) [#233](https://github.com/atzaero/aerobi-api/issues/233)


### Features

* **movements:** congela snapshot RAB 1:1 da aeronave na criação do movimento ([d9af550](https://github.com/atzaero/aerobi-api/commit/d9af55015fbb8eb981345c3ab3abae061886b276)), closes [#233](https://github.com/atzaero/aerobi-api/issues/233)
* **movements:** CreateMovementService como fonte única + split de origem ([1992cde](https://github.com/atzaero/aerobi-api/commit/1992cdeea4ccaacbd80b697e6ab2966c95aeb734)), closes [#234](https://github.com/atzaero/aerobi-api/issues/234) [#232](https://github.com/atzaero/aerobi-api/issues/232) [#234](https://github.com/atzaero/aerobi-api/issues/234) [#232](https://github.com/atzaero/aerobi-api/issues/232)
* **movements:** infere pouso/decolagem na ingestão AUTOMATIC via toggle 48h ([455e165](https://github.com/atzaero/aerobi-api/commit/455e165ad494827f6c8f16a28a72d4fc1a66d7ad)), closes [#234](https://github.com/atzaero/aerobi-api/issues/234) [#234](https://github.com/atzaero/aerobi-api/issues/234)
* **movements:** ocultar confidence nas respostas de consulta ([74b0cd4](https://github.com/atzaero/aerobi-api/commit/74b0cd4517137b33a2fe5af404aa9928f028fe7c)), closes [#235](https://github.com/atzaero/aerobi-api/issues/235)
* **movements:** rotas canônicas /movements e resposta enriquecida ([8aaa446](https://github.com/atzaero/aerobi-api/commit/8aaa446426f2404c86ef15aff50713ae0e96065f)), closes [#236](https://github.com/atzaero/aerobi-api/issues/236)
* **movements:** schema Movement + enums type/source + snapshot RAB + migration ([2cd50ef](https://github.com/atzaero/aerobi-api/commit/2cd50efaa7e7a755c879cddd503b4104f85737a4)), closes [#230](https://github.com/atzaero/aerobi-api/issues/230)

# [2.6.0-beta.10](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.9...v2.6.0-beta.10) (2026-06-09)


### Bug Fixes

* **deploy:** timeout no tailscale up + timeout-minutes no job ([#225](https://github.com/atzaero/aerobi-api/issues/225)) ([f16a301](https://github.com/atzaero/aerobi-api/commit/f16a301527285c72a64d2678a686f59e8125a9fa))

# [2.6.0-beta.9](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.8...v2.6.0-beta.9) (2026-06-09)


### Bug Fixes

* **authz:** aplica feedback do code-review do PR [#224](https://github.com/atzaero/aerobi-api/issues/224) ([80c748a](https://github.com/atzaero/aerobi-api/commit/80c748a3906f08498991bdb378175f1416642fb2))


### Features

* **authz:** escopo por grupo no módulo users/ (list/create/delete/resend) ([#219](https://github.com/atzaero/aerobi-api/issues/219)) ([c23a58c](https://github.com/atzaero/aerobi-api/commit/c23a58c855497094e390dc9ae812153b1d4e3f0d)), closes [#204](https://github.com/atzaero/aerobi-api/issues/204) [#210](https://github.com/atzaero/aerobi-api/issues/210)

# [2.6.0-beta.8](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.7...v2.6.0-beta.8) (2026-06-09)


### Bug Fixes

* **authz:** filtra recursos/usuário soft-deletados no GroupScopeGuard ([6af2ee5](https://github.com/atzaero/aerobi-api/commit/6af2ee56b23b18bf3df6a5c408e72262627e53c6))


### Features

* **authz:** GroupScopeGuard + @RequiresGroupScope (escopo por grupo) ([8d4f4af](https://github.com/atzaero/aerobi-api/commit/8d4f4af3768086ccc6684be09ea8d2a00c8eb8c0)), closes [#211](https://github.com/atzaero/aerobi-api/issues/211)
* **authz:** vincula User a AerodromeGroup com escopo por grupo/UF ([#210](https://github.com/atzaero/aerobi-api/issues/210)) ([0d4f7ee](https://github.com/atzaero/aerobi-api/commit/0d4f7ee5afe791656d6b64e3390deb14c26e5b26))

# [2.6.0-beta.7](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.6...v2.6.0-beta.7) (2026-06-09)


### Bug Fixes

* **authz:** mantém list-users ADMIN-only (paridade aerobi-web) até escopo por grupo ([#204](https://github.com/atzaero/aerobi-api/issues/204)) ([28348fd](https://github.com/atzaero/aerobi-api/commit/28348fd9e2fa6ae385688f51e76d1a516ffecd57)), closes [#208](https://github.com/atzaero/aerobi-api/issues/208) [#209](https://github.com/atzaero/aerobi-api/issues/209)


### Features

* **authz:** @RequirePermission + PermissionsGuard ([f5c644b](https://github.com/atzaero/aerobi-api/commit/f5c644be7bb27557231dab1e69c3bff3fe5450c8)), closes [#209](https://github.com/atzaero/aerobi-api/issues/209) [#206](https://github.com/atzaero/aerobi-api/issues/206)
* **authz:** estende GET /auth/me com permissions do role ([#207](https://github.com/atzaero/aerobi-api/issues/207)) ([79c6f61](https://github.com/atzaero/aerobi-api/commit/79c6f61b48eccbaefbcea30c4284093c8edd228b))
* **authz:** matriz de permissões RBAC (can/rolesFor) + testes ([a21f8c1](https://github.com/atzaero/aerobi-api/commit/a21f8c16f5ee1e364318d0cc18c912979c0ff12a)), closes [#203](https://github.com/atzaero/aerobi-api/issues/203) [#205](https://github.com/atzaero/aerobi-api/issues/205)
* **authz:** piloto users/ — migra @Roles para @RequirePermission + recorte role-alvo no service ([664427c](https://github.com/atzaero/aerobi-api/commit/664427c039c915748138e3b4c3f87841448ea2e7)), closes [#209](https://github.com/atzaero/aerobi-api/issues/209)

# [2.6.0-beta.6](https://github.com/atzaero/aerobi-api/compare/v2.6.0-beta.5...v2.6.0-beta.6) (2026-06-09)


### Bug Fixes

* **deploy:** conecta runner à tailnet (Headscale) antes do SSH ([eada192](https://github.com/atzaero/aerobi-api/commit/eada192d6a90aaf1f68e6d82a97404c878c0db7f)), closes [atzaero/aerobi-ansible#129](https://github.com/atzaero/aerobi-ansible/issues/129) [atzaero/aerobi-ansible#129](https://github.com/atzaero/aerobi-ansible/issues/129)

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
