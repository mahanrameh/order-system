# Order System

A modular, multi-app order system project developed as an internship task in TypeScript using the [NestJS](https://nestjs.com/) framework.

---

## Project Overview

**Order System** is designed as a backend monorepo providing a complete foundation for order and e-commerce applications. It features separate microservice-style applications—each handling a domain concern (such as orders, payments, authentication, product catalog, etc.)—and uses shared NestJS libraries for reuse and maintainability.

- **Framework:** NestJS 11
- **Primary language:** TypeScript (97.1%)
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache:** Redis

## Repository Structure

```txt
apps/
  catalog/           # Product catalog microservice
  notifications/     # Notification handler (user/system)
  order_system/      # Orchestrator/main API gateway
  orders/            # Orders management service
  payments/          # Payments integration service
  products-basket/   # Shopping basket handler
  user-auth/         # Authentication and user management

libs/
  auth/              # JWT/local strategies and auth services
  common/            # Common utilities, decorators, interceptors, etc.
  configs/           # Central configuration management
  prisma/            # Prisma schema, database integration
  redis/             # Redis helpers for cache/session
```

## Main Features

- **User auth & JWT sessions**
- **Order creation, update, management**
- **Product and catalog APIs**
- **Payment processing stub/services**
- **Basket service for temporary product holding**
- **Notifications system**
- Shared code and configs across apps

## Quick Start

> See below for NestJS-specific commands and in-depth docs.

```sh
git clone https://github.com/mahanrameh/order-system.git
cd order-system
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev -- --app=order_system
```
Replace `order_system` with the name of the app you want to run in the monorepo.

---

<!-- Rest of your original NestJS-based README follows below -->

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

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deploying NestJS apps easy.

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
