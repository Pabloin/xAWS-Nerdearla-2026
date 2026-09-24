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
front_admin/                  Private organizer studio for face review
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

Run `npm run dev:admin` for the organizer studio at `http://127.0.0.1:5192`.
Enter a deployed API URL and the admin token to use face detection. The studio
needs AWS Rekognition and a configured admin secret; its interface can be
previewed locally before those resources are available.

The deployment keeps the three frontends in one web bucket. Production serves
the landing page at `comunid.app`, the mobile app at `mobile.comunid.app`, and
the organizer studio at `admin.comunid.app`. The `/app/` and `/admin/` paths
remain available on the root domain. `www.comunid.app` redirects to the root.

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
- `GET /admin/session` and `GET /admin/profiles`
- `POST /admin/profiles`
- `PUT /admin/profiles/{id}/face-consent` — records or withdraws facial consent
- `POST /admin/detect-faces` — finds faces in a photo without saving them
- `POST /admin/faces` — indexes one reviewed face for a consented profile
- `GET /admin/profiles/{id}/faces` and `DELETE /admin/profiles/{id}/faces/{faceId}`
- `POST /admin/search-faces` — checks a reviewed face against the collection

The DynamoDB access pattern uses one table:

```text
PK=EVENT#{eventId}   SK=PROFILE#{profileId}
PK=PLAYER#{playerId} SK=ENCOUNTER#{eventId}#{profileId}
PK=PROFILE#{profileId} SK=FACE#{faceId}
PK=REKOGNITION_USER#{userId} SK=PROFILE
```

That encounter key makes a repeated scan idempotent for the same player, event,
and builder.

## AWS environments

The AWS profile for local read-only verification is `sebas`. Terraform is
designed to run in GitHub Actions through OIDC. The one-time OIDC bootstrap
script is in `terraform-bootstrap/`.

| Environment | Domain | State key |
| --- | --- | --- |
| Staging | `staging.comunid.app` | `comunid/staging/terraform.tfstate` |
| Production | `comunid.app` | `comunid/production/terraform.tfstate` |

Before the first deployment:

1. Run `AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-github-oidc-role.sh create`
   from the repository root. It creates the GitHub OIDC provider if needed and
   a temporary bootstrap role restricted to this repository. Set the two
   infrastructure role secrets it prints to GitHub Actions.
2. Keep `comunid.app` delegated to Cloudflare. Create a scoped Cloudflare API
   token with Zone DNS Edit and Zone Read permissions for `comunid.app`, then
   add it as the `COMUNID_CLOUDFLARE_API_TOKEN` GitHub Actions secret. Add the
   zone ID as `COMUNID_CLOUDFLARE_ZONE_ID`. Terraform creates the ACM
   validation CNAMEs and CloudFront CNAMEs in Cloudflare. Keep these records
   set to DNS only so ACM validation and CloudFront domain checks can work.
3. Run `AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-state-bucket.sh create`
   and set the printed bucket name as the `COMUNID_TERRAFORM_STATE_BUCKET`
   GitHub secret.
4. Run the staging workflow with `apply_infrastructure` enabled. Review its
   plan, then set `COMUNID_STAGING_INFRA_ROLE_ARN` to the `github_infra_role_arn`
   Terraform output. Set `COMUNID_STAGING_APP_ROLE_ARN` to
   `github_app_role_arn` for application deployment.
5. Run production once staging is ready. Set
   `COMUNID_PRODUCTION_INFRA_ROLE_ARN` to that environment's
   `github_infra_role_arn` output.
6. After both infrastructure secrets use the permanent Terraform roles, remove
   the temporary role with
   `AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-github-oidc-role.sh destroy`.

The bootstrap script only creates the OIDC provider and temporary IAM role; it
does not create application or Terraform state resources.

## Organizer studio setup

Terraform creates a Rekognition face collection and an empty Secrets Manager
secret named `comunid-<environment>-admin-token`. After applying the
infrastructure, set that secret's value to a long random token in Secrets
Manager. Enter the token in the studio at `/admin/`; it is never included in
the frontend build. The Lambda reads the secret at runtime and caches it for
five minutes. `ADMIN_TOKEN` can be set directly for local backend development.

The studio tracks profile participation and facial consent separately. It
detects faces and lets an organizer choose only people with facial consent.
It sends only the selected face crops for indexing. The original group photo
is kept in the browser, not stored by the API. Rekognition stores face
vectors; DynamoDB stores profile and face IDs. Removing a face or withdrawing
facial consent deletes its vector from the collection.

## Product direction

See [COMUNID_IDEA.md](COMUNID_IDEA.md) for the full concept and event principles.
