# Ride Hailing Microservices

Backend de um app estilo Uber, construído como um monorepo NestJS com 4 microsserviços independentes que se comunicam de forma assíncrona via **RabbitMQ**, cada um com seu próprio banco de dados.

**[Live demo →](https://rides.catverse.com.br/demo)**

## Arquitetura

Todo tráfego externo entra pelo `api-gateway`, que expõe a API REST/HTTP e traduz cada chamada em uma mensagem RPC para o microsserviço dono daquele domínio. Os serviços internos não têm porta HTTP pública — só conversam entre si (e com o gateway) por filas do RabbitMQ.

```
                         HTTP (porta 3010)
                              │
                        ┌─────▼─────┐
                        │ api-gateway│
                        └─────┬─────┘
                              │ RPC via RabbitMQ
           ┌──────────────────┼──────────────────┐
           │                  │                  │
   ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
   │ authentications│  │     rider     │  │    logging    │
   │  auth_queue    │  │  rider_queue  │  │coordinate_    │
   │                │  │               │  │ rider_queue   │
   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
           │                  │                  │
     ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
     │ Postgres  │      │ Postgres  │      │  MongoDB  │
     │ (authDb)  │      │(riders_db)│      │(logging-db)│
     └───────────┘      └───────────┘      └───────────┘
```

No cadastro (`POST /auth/register`), o `authentications` cria o usuário e dispara uma mensagem `create-rider` para o serviço `rider`, que cria o perfil de passageiro correspondente — um exemplo de orquestração entre serviços via fila.

## Serviços

| Serviço | Porta HTTP | Fila RabbitMQ | Banco | Responsabilidade |
|---|---|---|---|---|
| `api-gateway` | 3010 | — (cliente das outras filas) | — | Único ponto de entrada HTTP; valida JWT e roteia para os demais serviços |
| `authentications` | 3011 | `auth_queue` | PostgreSQL (Prisma) | Cadastro/login, hash de senha (bcrypt) e emissão/validação de JWT |
| `rider` | 3012 | `rider_queue` | PostgreSQL (TypeORM) | CRUD de passageiros (riders) |
| `logging` | 3013 | `coordinate_rider_queue` | MongoDB (Mongoose) | Recebe e armazena coordenadas de localização dos riders |

Cada serviço também expõe `GET /health` na própria porta, usado pelos healthchecks do deploy.

## Stack

- **NestJS 11** (monorepo, um projeto por app em `apps/`, contratos compartilhados em `libs/`)
- **RabbitMQ** para comunicação entre serviços (`@nestjs/microservices`, transporte RMQ)
- **PostgreSQL** — via **Prisma** no `authentications` e via **TypeORM** no `rider`
- **MongoDB** (Mongoose) no `logging`
- **JWT** (`@nestjs/jwt`) + `bcrypt` para autenticação
- **class-validator** / **class-transformer** para validação de DTOs compartilhados
- **Docker** multi-stage build (uma única imagem parametrizada por `--build-arg APP_NAME`) + **Docker Compose**
- **GitHub Actions** para deploy contínuo

## API (via api-gateway)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cria usuário + rider correspondente |
| `POST` | `/auth/login` | Retorna JWT |
| `GET` | `/auth/profile` | Perfil do usuário autenticado (requer `Authorization: Bearer <token>`) |
| `POST` | `/riders` | Cria um rider |
| `GET` | `/riders` | Lista todos os riders |
| `GET` | `/riders/:id` | Busca um rider por id |
| `POST` | `/riders/coordinates` | Registra uma coordenada de localização |
| `GET` | `/riders/coordinates/:id` | Histórico de coordenadas de um rider |
| `GET` | `/demo` | Página de demonstração interativa |
| `GET` | `/health` | Healthcheck |

## Rodando localmente

Pré-requisitos: Node 22+, Docker e Docker Compose.

```bash
# sobe RabbitMQ, MongoDB e os 2 Postgres (auth e rider)
docker compose up -d

npm install

# roda os 4 serviços juntos, em watch mode
npm run start:all:dev
```

O `api-gateway` sobe em `http://localhost:3010` — abra `http://localhost:3010/demo` para a página de demonstração, ou o painel do RabbitMQ em `http://localhost:15673` (usuário/senha: `user`/`password`).

Cada serviço lê sua própria configuração via variáveis de ambiente (com defaults para desenvolvimento local caso não sejam definidas):

| Variável | Usada por | Default local |
|---|---|---|
| `RABBITMQ_URL` | todos | `amqp://user:password@localhost:5673` |
| `PORT` | todos | 3010/3011/3012/3013 |
| `DATABASE_URL` | `authentications` (Prisma) | ver `apps/authentications/.env` |
| `JWT_SECRET` | `authentications` | — |
| `RIDER_DATABASE_URL` | `rider` (TypeORM) | `postgres://root:root@localhost:5432/riders_db` |
| `MONGO_URI` | `logging` | `mongodb://root:root@localhost:27018/logging-db?authSource=admin` |

## Deploy

A stack de produção (`docker-compose.prod.yml`) sobe tudo em containers isolados numa única VM, expondo só o `api-gateway`; o restante (bancos e broker) fica acessível apenas na rede interna do Docker. Deploy contínuo via GitHub Actions a cada push na `main`. Passo a passo completo em [DEPLOY.md](DEPLOY.md).

## Estrutura do projeto

```
apps/
  api-gateway/       # gateway HTTP + JWT guard
  authentications/    # auth (Prisma/Postgres)
  rider/              # riders (TypeORM/Postgres)
  logging/            # coordenadas (Mongoose/MongoDB)
libs/
  auth-contracts/     # DTOs compartilhados de auth
  rider-contracts/    # DTOs compartilhados de rider/coordinates
```

## Licença

UNLICENSED — projeto pessoal de estudo/portfólio.
