# OTA DB

This package contains the database client for the osu! Tournament Arena.

In order to use the database, you need to bootstrap a libsql server and provide the `DATABASE_URL` and `DATABASE_AUTH_TOKEN` environment variables in your `.env` file.

You have the following options:

- [Local Development](#option-a-local-development) For simple development and testing purposes.
- [Production Deployment](#option-b-production-deployment) For production deployment.

Once you've set up your database, you can use the following commands to interact with it:

## Option A: Local Development

### Setup

Install the [Turso CLI](https://docs.turso.tech/cli/installation)

Run the following:

```
pnpm db:push
```

## Option B: Cloud Deployment

### Setup

Create a new database on [Turso](https://turso.tech/) and provide the `DATABASE_URL` and `DATABASE_AUTH_TOKEN` environment variables in your `.env` file.

Then run the following

```
pnpm db:push
```
