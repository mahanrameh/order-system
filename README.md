# Order System

A modular, multi-app order system project developed as an internship task in TypeScript using [NestJS](https://nestjs.com/).  
This monorepo provides a scalable, microservice-oriented backend foundation for order and e-commerce scenarios.

---

## Project Overview

**Order System** organizes business logic into self-contained microservices, each developed in TypeScript around NestJS v11. Its strong modularity and adherence to Domain-Driven Design (DDD) principles make it perfect for rapid development, testing, and CI/CD pipelines.

### Technologies

- **Primary Language:** TypeScript (97.1%), with supporting JavaScript (2.9%)
- **Framework:** [NestJS](https://nestjs.com/) v11
- **Database:** PostgreSQL (managed via [Prisma ORM](https://www.prisma.io/))
- **Cache:** Redis (for session/basket data)
- **API Docs:** Auto-generated Swagger (OpenAPI spec on /api/docs endpoint)

---

## Repository Structure

```
apps/
  catalog/           # Product catalog microservice (CRUD operations)
  notifications/     # User/system notifications (email/SMS stub)
  order_system/      # Main API gateway/orchestrator
  orders/            # Orders management (create, update, get)
  payments/          # Payment service integration (stubbed for demo)
  products-basket/   # Shopping basket service (hold, merge, remove)
  user-auth/         # User auth module (JWT, registration, login)
libs/
  auth/              # JWT strategies, Passport integration
  common/            # Shared utilities, decorators, error handling
  configs/           # Centralized configuration management (envs, secrets)
  prisma/            # Database schema (PostgreSQL), integration helpers
  redis/             # Redis cache/session helpers
```

---

## Architectural Highlights

- **Microservices:** Apps communicate via REST and may use message brokers (AMQP, RabbitMQ-ready).
- **Authentication:** Passport.js JWT + local strategy, bcrypt hashing, role guards.
- **Order Flow:** Basket management, order creation/validation, product inventory check, payment stub integration.
- **Notifications:** Email/SMS handler (stub/demo).
- **Testing:** Unit/E2E tests with Jest and coverage reporting.

---

## Main Features

- 🛡️ **User Authentication:** JWT/Passport (login, registration)
- 📦 **Basket Service:** Add/remove/merge products per client
- 📄 **Catalog:** Product APIs with query/filter
- 📝 **Order Management:** Full create/update/get/cancel flow
- 💳 **Payments:** Stripe/PayPal ready (stub provided)
- 🔔 **Notifications System:** Configurable (stubbed)
- 🏗️ **Shared Libraries**
- 🤝 **Swagger API Docs:** http://localhost:3000/api/docs

---

## Quick Start

```sh
git clone https://github.com/mahanrameh/order-system.git
cd order-system
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev -- --app=order_system
```
To run a specific microservice (e.g., orders):
```sh
npm run start:dev -- --app=orders
```

### Environment Setup

Copy `.env.example` → `.env` and configure:
- Postgres URI
- Redis endpoint
- JWT secret

---

## API Documentation

Visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs) for Swagger UI.

---

## Testing

```sh
npm run test       # unit tests
npm run test:e2e   # integration tests
npm run test:cov   # coverage
```

---

## Developer Tools

- ESLint & Prettier
- Prisma ORM
- Jest

---

## Contributing

1. Fork and make changes.
2. Format (`npm run lint`) and test.
3. Submit PRs to main branch.

---

## License

MIT (custom code). NestJS is MIT licensed.

---

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma ORM](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

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

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes it easy for you to get up and running quickly and securely.

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- [NestJS Documentation](https://docs.nestjs.com)
- [Discord](https://discord.gg/G7Qnnhy)
- [Courses](https://courses.nestjs.com/)
- [Jobs](https://jobs.nestjs.com)
- [Devtools](https://devtools.nestjs.com)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
