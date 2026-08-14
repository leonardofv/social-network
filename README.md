# Social Network

Projeto Web Full-Stack para adquirir/aprimorar habilidades em Desenvolvimento Web, utilizando tecnologias como TypeScript, ReactNative, entre outros.

## Sobre o projeto

Será uma rede social, parecida com o Instagram/Twitter, onde usuários cadastrados conseguem publicar textos e mídias e usuários que o seguem conseguem visualizá-los.

## Como usar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v20+)
- [PostgreSQL](https://www.postgresql.org/) rodando localmente

### 1. Instalar as dependências

O repositório tem três `package.json` (raiz, client e server):

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configurar as variáveis de ambiente

**Servidor** — crie `server/.env` (use `server/.env.example` como base):

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/redesocial"
JWT_SECRET="uma-senha-qualquer"
```

Crie também o banco no PostgreSQL.

**Cliente** — crie `client/.env`:

```env
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Rodar as migrations

```bash
cd server && npm run migrate:latest
```

### 4. Rodar em desenvolvimento

Na raiz do projeto:

```bash
npm run dev
```

## Tech Stack 💻

### Front-end

- [React](https://react.dev/) + [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Expo](https://expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/) (roteamento por arquivos)

### Back-end

- [TypeScript](https://www.typescriptlang.org/) (Node.js + ts-node)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (Banco de Dados SQL)
- [Knex.js](https://knexjs.org/) (Query Builder e migrations)
- [JWT](https://github.com/auth0/node-jsonwebtoken) (autenticação)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (hash de senhas)
- [Multer](https://github.com/expressjs/multer) (upload de imagens)

## Colaboradores 👨‍👩‍👧‍👦

- [Leonardo Vasconcelos](https://github.com/leonardofv)
- [Cleberson F. R. Junior](https://github.com/cleberson-dev)
