# Branch protection (GitHub) — o que configurar

O workflow **CI** (`.github/workflows/ci.yml`) corre em PRs para `develop` / `main`, mas **só bloqueia merge automaticamente** se alguém com permissão de administrador ativar as regras abaixo no repositório.

## Onde

**Settings → General → (se existir) Rulesets** ou **Settings → Branches → Branch protection rule** para `develop` (e `main` se aplicável).

## Recomendado para `develop`

1. **Require a pull request before merging**
2. **Require approvals** — pelo menos 1 (ajustar ao acordo da equipa)
3. **Require status checks to pass before merging**
   - Adicionar os checks que aparecem após uma corrida do workflow **CI**, tipicamente:
     - **Security**
     - **Quality**
     - **Test**
   - (Os nomes devem coincidir com os *jobs* no Actions; se a lista estiver vazia, abrir um PR de teste para o GitHub registar os checks.)
4. **Require branches to be up to date before merging** — opcional mas reduz merges “verdes” que falham depois do rebase.
5. **Consider** desativar bypass para administradores nas regras acima, se a política do projeto for “ninguém merge com CI vermelho”.

## Notas

- Repositórios privados em planos gratuitos podem ter limitações em API/automação para ler regras; a configuração faz-se na UI.
- Isto não substui **code review** nem **dependabot/audit** — complementa.
