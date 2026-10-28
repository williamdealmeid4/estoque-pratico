# Estoque Prático

Aplicação de demonstração para acompanhar produtos, estoque mínimo e movimentos de entrada e saída. A API usa TypeScript e PostgreSQL; a interface foi feita para funcionar em telas grandes e pequenas.

## Executar

Requisitos: Node.js 20+ e PostgreSQL. Crie um banco vazio, configure `DATABASE_URL` com a conexão PostgreSQL e execute:

```sh
npm install
npm run db:setup
npm start
```

Acesse `http://127.0.0.1:3000`. No PowerShell, uma configuração local pode ser feita com `$env:DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/estoque'`. Use credenciais próprias e mantenha-as fora do repositório.

## O que o projeto demonstra

- Cadastro de produtos com estoque mínimo.
- Registro de entradas e saídas com histórico e observação opcional.
- Operações em transação com bloqueio da linha do produto, evitando que saídas concorrentes deixem o saldo negativo.
- Consulta de produtos com indicação de reposição e busca por nome.

Execute `npm test` para testar as regras de domínio e `npm run typecheck` para verificar os tipos. O projeto é uma demonstração local: ainda não possui autenticação ou autorização e não deve ser exposto à internet.