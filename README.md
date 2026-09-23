# Comunid

Comunid is a mobile-first event experience for discovering the people who build
a technology community. Participants meet someone, scan their QR badge, unlock
their story, and complete community quests.

The first vertical slice is implemented:

```text
discover a builder
  -> scan their badge (camera or local demo)
  -> validate the profile
  -> record an idempotent encounter
  -> unlock the card
  -> update collection and quest progress
```

## Repository

```text
front_home/                   Public Comunid landing page (Vite)
front_mobile/                 React + Vite event companion app
backend/                      Node.js Lambda API and domain tests
terraform/modules/apps/       S3, CloudFront, ACM, and Route 53
terraform/modules/storage/    DynamoDB and private media bucket
terraform/modules/api/        Lambda, IAM, and API Gateway
terraform/modules/cicd/       GitHub OIDC application role
terraform/modules/comunid/    reusable architecture composition
terraform/environments/       isolated staging and production roots
.github/workflows/            CI and deployment foundations
```

## Local development

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev:home
```

Open `http://127.0.0.1:5191` to view the public landing page. In a second
terminal, run `npm run dev:mobile` and open `http://127.0.0.1:5190` to explore
the event app. The app works without AWS using curated profiles and local
browser storage. Camera scanning requires browser permission; the scan screen
includes demo badges for local development.

The deployment keeps both frontends in one web bucket: the landing page is at
the domain root and the mobile app is served from `/app/`.

Run all checks:

```bash
npm run check
```

## API

The Lambda exposes:

- `GET /health`
- `GET /profiles`
- `POST /profiles` (disabled unless an administrator token is configured)
- `GET /profiles/{id}`
- `GET /profiles/{id}/qr`
- `POST /encounters`
- `GET /players/{id}/encounters`

The DynamoDB access pattern uses one table:

```text
PK=EVENT#{eventId}   SK=PROFILE#{profileId}
PK=PLAYER#{playerId} SK=ENCOUNTER#{eventId}#{profileId}
```

That encounter key makes a repeated scan idempotent for the same player, event,
and builder.

## AWS environments

The AWS profile for local read-only verification is `sebas`. Terraform is
designed to run in GitHub Actions through OIDC, not from a laptop.

| Environment | Domain | State key |
| --- | --- | --- |
| Staging | `staging.comunid.app` | `comunid/staging/terraform.tfstate` |
| Production | `comunid.app` | `comunid/production/terraform.tfstate` |

Before the first deployment:

1. Delegate `comunid.app` DNS to a Route 53 hosted zone or import the existing
   zone into Terraform ownership.
2. Create/configure the remote Terraform state bucket.
3. Confirm the GitHub OIDC provider exists in the AWS account.
4. Add the repository/action role secrets documented in the workflows.
5. Run the staging infrastructure workflow first and review its plan.

No AWS resources are created by the local build or test commands.

## Product direction

See [COMUNID_IDEA.md](COMUNID_IDEA.md) for the full concept and event principles.
