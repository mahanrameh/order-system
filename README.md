# Order System

A modular, multi-app order system project developed as an internship task in TypeScript using [NestJS](https://nestjs.com/).  
This monorepo provides a scalable, microservice-oriented backend foundation for order and e‑commerce scenarios.

---

## Table of contents

- Project overview
- Quick facts & tech stack
- Repository structure (detailed)
- Runtime & developer setup (env vars, commands, docker-compose)
- Service contracts & common endpoints (examples + curl)
- Database & Prisma (where schema lives, migrations)
- Testing, CI/CD, and recommended workflows
- Debugging, logging & observability
- Security & production hardening checklist
- Contributing, releases & changelog
- License & acknowledgements

---

## Project overview

Order System separates domain concerns into self-contained apps (microservice-like) and shared libraries. Each app is a NestJS application and focuses on a single bounded context (catalog, orders, payments, basket, notifications, auth, etc.). The monorepo approach enables code sharing (Prisma, auth strategies, configs) and simplifies local development.

Goals:
- Clear separation of concerns for faster iteration and testing.
- Replaceable integrations (e.g., payment provider swap).
- Fast local dev with Docker compose for Postgres + Redis and Prisma migrations.
- Production-ready patterns (config per-environment, centralized logging, health checks).

---

## Quick facts & tech stack

- Primary language: TypeScript (97.1%)
- Framework: NestJS v11
- ORM: Prisma (schema: libs/prisma/schema/schema.prisma)
- DB: PostgreSQL
- Cache/session: Redis
- Message broker ready: AMQP (amqplib + amqp-connection-manager)
- Authentication: Passport (local + JWT)
- API docs: Swagger (auto-generated at /api/docs)
- Test runner: Jest (unit & e2e)
- Formatting/linting: Prettier + ESLint

Key package.json scripts (run from repo root):
- npm run start:dev -- --app=<appName>  — start an app in watch mode
- npm run build                         — build all apps
- npm run prisma:generate               — generate Prisma client
- npm run prisma:migrate                — run Prisma migrations
- npm run test, npm run test:e2e        — run tests

---

## Repository structure (detailed)

Root layout (expanded):

- apps/
  - catalog/           – Product catalog microservice (CRUD + filters)
  - notifications/     – Notification handler (email/SMS adapters / stubs)
  - order_system/      – Main API gateway and orchestrator (aggregates services)
  - orders/            – Orders lifecycle (create, update, list, cancel)
  - payments/          – Payment provider integration (pluggable)
  - products-basket/   – Basket service (temp storage, merge, checkout)
  - user-auth/         – Authentication & user management
- libs/
  - auth/              – Passport strategies, JWT helpers, guards
  - common/            – Shared DTOs, interceptors, exceptions, utils
  - configs/           – Centralized configuration & validation
  - prisma/            – Prisma schema, seed scripts, migrations helpers
  - redis/             – Redis client wrapper, cache helpers
- tools/, scripts/, etc. — development helpers (if present)

Important: Prisma schema file location is `libs/prisma/schema/schema.prisma` (see package.json). Use the monorepo Prisma setup when generating/migrating.

---

## Environment variables (recommended list)

Create a .env file in repository root or per-app env files. The following are typical required variables (add more per-app as needed):

- NODE_ENV=development|production
- PORT=3000
- DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
- REDIS_URL=redis://[:PASSWORD@]HOST:PORT
- JWT_SECRET=your_jwt_secret
- JWT_ACCESS_EXPIRES_IN=3600s
- PRISMA_MIGRATIONS_PATH=./prisma/migrations
- AMQP_URL=amqps://user:pass@rabbitmq:5672 (if using message broker)
- SENTRY_DSN= (optional)

Tip: Keep secrets out of the repo and use a secret manager or environment specific .env files.

---

## Docker compose (example)

A minimal docker-compose for local development:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: order_system
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Run:
- docker compose up -d
- update DATABASE_URL and REDIS_URL in .env, then run `npm run prisma:generate` and `npm run prisma:migrate`.

---

## Running apps locally

Run a single app in dev mode:
- npm run start:dev -- --app=order_system
- npm run start:dev -- --app=orders

Run all apps concurrently (recommended tooling: concurrently, nx, or custom scripts). For quick local testing, start the gateway (order_system) which aggregates other services.

---

## Service contracts & example requests

Below are example API flows you can use as templates. Replace host/port as needed.

1) Register / Login (user-auth)
- Register:
  curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"dev@example.com","password":"P@ssw0rd"}'
- Login:
  curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"dev@example.com","password":"P@ssw0rd"}'
  -> returns JWT access token

2) Create a basket and add product (products-basket)
- Create basket:
  curl -X POST http://localhost:3000/basket -H "Authorization: Bearer <token>" -d '{"customerId":"user-123"}'
- Add item:
  curl -X POST http://localhost:3000/basket/<basketId>/items -H "Authorization: Bearer <token>" -d '{"productId":"prod-1","quantity":2}'

3) Create order (orders)
- Checkout:
  curl -X POST http://localhost:3000/orders -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"basketId":"<id>","paymentMethod":"stub"}'

Swagger UI (per-service) will show exact DTOs and required fields if the service is running.

---

## Database & Prisma

- Prisma schema lives at: libs/prisma/schema/schema.prisma
- To generate the client: npm run prisma:generate
- To create and run migrations: npm run prisma:migrate

Recommended workflow:
1. Modify schema.prisma (in libs/prisma)
2. npx prisma migrate dev --name your_change --schema=libs/prisma/schema/schema.prisma
3. npm run prisma:generate

Note: In a monorepo, ensure your services import Prisma client from the same generated package (libs/prisma) to avoid multiple clients.

---

## Testing

- Unit tests (Jest): npm run test
- E2E tests: npm run test:e2e
- Coverage: npm run test:cov

Guidelines:
- Keep tests fast & deterministic (mock external services like Redis/AMQP/Payments).
- Use test databases (separate DB per CI run) and run migrations before tests.
- For e2e, start the minimal set of services required via Docker and seed test data.

---

## CI/CD (GitHub Actions example)

A simple CI pipeline:
- Run on push to main and PRs
- Steps: install dependencies, run lint, run tests, run prisma:generate, build

Example (summarized):
```yaml
name: CI
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2  # or setup-node
      - name: Install deps
        run: npm ci
      - name: Lint & format
        run: npm run lint
      - name: Run tests
        run: npm run test --silent
      - name: Build
        run: npm run build
```

Add deployment workflows for your target environment (Docker image build and push, Kubernetes manifests, or cloud provider-specific steps).

---

## Debugging, logging & observability

- Use Nest built-in Logger or plug in Winston/Pino for structured logs.
- Expose health checks (e.g., /health) for orchestration platforms.
- Integrate metrics (Prometheus) and distributed tracing (OpenTelemetry) for production systems.
- Optional: integrate Sentry for error monitoring (set SENTRY_DSN).

Debugging locally:
- npm run start:debug -- --app=order_system
- Attach VSCode debugger to Node inspect port if configured.

---

## Security & production hardening checklist

- Use strong JWT secrets and rotate regularly
- Store secrets in a secret manager (AWS Secrets Manager, Azure Key Vault)
- Ensure HTTPS termination at load balancer or API gateway
- Rate-limit public endpoints (Nest Throttler is included)
- Validate inputs strictly with class-validator and DTOs
- Sanitize logs (no PII)
- Run periodic dependency audits (npm audit) and upgrade critical libs
- Limit DB user privileges for runtime (no superuser)

---

## Extensibility & deployment notes

- Payments: replace the stub payment provider in apps/payments with real Stripe/PayPal integration; keep provider interface for easy swapping.
- Notifications: implement adapters for SMTP or external services.
- Deploy microservices independently if desired; otherwise deploy gateway + services together in a single cluster.

---

## Roadmap (suggested)

- Add Dockerfiles for each app and a root-level docker-compose for full-stack dev
- Add end-to-end test suite that spins up services in CI using Docker
- Integrate OpenTelemetry tracing and Prometheus metrics
- Add authentication refresh tokens and RBAC roles
- Add multi-tenant support (if required)

---

## Contributing

- Follow the repo coding standards: Prettier + ESLint
- Write unit tests for new logic and update/extend e2e tests where applicable
- Use feature branches and conventional commits for clean changelogs
- Include descriptive PR titles and link tasks in the PR description

Suggested PR checklist:
- [ ] Code compiles and lints
- [ ] Tests added / updated and passing
- [ ] Documentation updated (README, API docs)
- [ ] Security considerations addressed

---

## Releases & changelog

Use semantic versioning (MAJOR.MINOR.PATCH). Maintain a CHANGELOG.md (use keep-a-changelog or semantic-release to automate releases).

---

## FAQ / Troubleshooting

Q: Prisma migration errors on CI
A: Ensure DATABASE_URL points to a test DB, and the Prisma schema path matches libs/prisma/schema/schema.prisma when running migrate/generate.

Q: Redis connection refused
A: Confirm REDIS_URL in .env and that Redis service is up (docker compose or external host).

Q: JWT auth failing in dev
A: Verify JWT_SECRET is set in .env and consistent across services that verify tokens.

---

## Acknowledgements & useful links

- NestJS docs: https://docs.nestjs.com
- Prisma docs: https://www.prisma.io/docs
- Deploy guides: cloud provider docs for Docker/Kubernetes

---

## Next steps I can do for you

- Open a PR to update README.md in your repo with this improved version
- Add Dockerfiles and docker-compose for full local stack
- Add a basic GitHub Actions CI workflow file

---

<!-- Everything below remains exactly as in your current README -->

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
  <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/faq/deployment).

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes[...]
```
