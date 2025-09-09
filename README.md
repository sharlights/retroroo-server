# Authentication Flow
1. User clicks magic link → /auth/magic-link/verify?token=abc123
2. AuthController verifies token → issues JWT
3. Frontend receives JWT (/retro?jwt=...)
4. Client connects to socket with JWT:
5. BoardGateway validates JWT and joins board room



## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```



## Migrations

TypeORM has been set up to manage database migrations. To create a new migration, use the following command:

```bash
$ npm run migration:create 
```

You can also perform a scaffolding migration with:

```bash
$ npm run migration:generate ./src/migrations/<Name>
```

Once you've created a migration, you can run it with:

```bash
$ npm run migration:run 
```
