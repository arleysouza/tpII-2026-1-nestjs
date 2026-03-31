# CRUD simples com NestJS, Drizzle e PostgreSQL

Aplicacao web simples para realizar CRUD de usuarios com NestJS no servidor, Drizzle ORM no mapeamento do esquema e PostgreSQL no armazenamento.

## Tabela usada

O projeto trabalha com a tabela `users` abaixo:

```sql
CREATE TABLE users (
  id_user SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100)
);
```

## Como o projeto organiza essa tabela

Neste projeto, a definicao da tabela aparece em duas camadas diferentes:

- No banco de dados, a tabela precisa existir fisicamente no PostgreSQL.
- No codigo, o arquivo `users.schema.ts` descreve essa mesma estrutura para o Drizzle ORM.

Em outras palavras, `src/users/users.schema.ts` nao cria a tabela sozinho. Ele define o esquema que o codigo vai usar para montar consultas com seguranca de tipos. A criacao fisica da tabela continua sendo feita no PostgreSQL com o comando SQL mostrado acima.

## Significado dos principais arquivos

### Arquivos do modulo de usuarios

- `src/users/users.schema.ts`
  Define o esquema da tabela `users` no Drizzle. Aqui ficam o nome da tabela, os nomes das colunas, seus tipos e restricoes basicas, como `notNull()`.

- `src/users/user.entity.ts`
  Neste projeto, esse arquivo funciona como um ponto de reexportacao. Ele reaproveita o schema e os tipos `User` e `NewUser` definidos em `users.schema.ts`. Apesar do nome `entity`, ele nao representa uma entidade de ORM classica como no TypeORM.

- `src/users/dto/create-user.dto.ts`
  Define o formato esperado para criar um usuario. Tambem concentra as validacoes da entrada, como obrigatoriedade do nome, tamanho minimo e formato de e-mail.

- `src/users/dto/update-user.dto.ts`
  Define o formato esperado para atualizar um usuario. Como a atualizacao e parcial, os campos sao opcionais, mas continuam validados quando enviados.

- `src/users/users.controller.ts`
  Recebe as requisicoes HTTP da API, como `GET`, `POST`, `PUT` e `DELETE`. O controller extrai parametros e corpo da requisicao e delega a regra de negocio para o service.

- `src/users/users.service.ts`
  Contem a regra de negocio do CRUD. E o service que usa `DatabaseService` e o schema `users` para inserir, consultar, atualizar e remover registros da tabela.

- `src/users/users.module.ts`
  Agrupa as partes do dominio de usuarios dentro do NestJS. O modulo registra o `UsersController`, o `UsersService` e importa o `DatabaseModule` para disponibilizar acesso ao banco.

### Arquivos de banco

- `src/database/database.service.ts`
  Cria a conexao com o PostgreSQL usando as variaveis de ambiente e instancia o Drizzle com o schema do projeto. Esse servico expoe `db`, que e usado pelo `UsersService`.

- `src/database/database.module.ts`
  Torna o `DatabaseService` disponivel para os outros modulos da aplicacao.

### Arquivos de inicializacao

- `src/app.module.ts`
  E o modulo raiz da aplicacao. Ele carrega as configuracoes do `.env`, registra os modulos principais e configura o atendimento de arquivos estaticos.

- `src/main.ts`
  E o ponto de entrada da aplicacao NestJS. Aqui a aplicacao e inicializada, as validacoes globais sao ativadas e o servidor comeca a escutar na porta configurada.

## Fluxo da requisicao ate a tabela

Quando uma requisicao chega em `POST /api/users`, o fluxo principal e este:

1. `users.controller.ts` recebe a requisicao.
2. O Nest valida o corpo com `create-user.dto.ts`.
3. `users.service.ts` aplica a logica de criacao.
4. `database.service.ts` entrega a conexao com o banco.
5. O Drizzle usa `users.schema.ts` para montar o `INSERT` na tabela `users`.

## Requisitos

- Node.js
- npm
- PostgreSQL

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie ou ajuste o arquivo `.env` na raiz do projeto:

```env
PORT=3000
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_SSL=false
```

Se preferir, pode usar apenas `DATABASE_URL` e deixar as demais variaveis vazias.

3. Crie a tabela no PostgreSQL:

```sql
CREATE TABLE users (
  id_user SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100)
);
```

## Execucao

```bash
npm run start:dev
```

Abra no navegador:

```text
http://localhost:3000
```

## Rotas da API

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
