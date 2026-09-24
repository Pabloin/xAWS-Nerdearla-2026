#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  terraform-bootstrap/bootstrap-github-oidc-role.sh create
  terraform-bootstrap/bootstrap-github-oidc-role.sh destroy

Environment variables:
  AWS_PROFILE       Optional AWS CLI profile.
  AWS_REGION        Optional AWS region. Defaults to us-east-1.
  AWS_ACCOUNT_ID    Optional AWS account id. Auto-detected if omitted.
  GITHUB_OWNER      GitHub owner. Defaults to Pabloin.
  GITHUB_REPO       GitHub repository. Defaults to xAWS-Nerdearla-2026.

The temporary role has AdministratorAccess. It only trusts this GitHub
repository and must be deleted after Terraform creates the permanent roles.
The script creates/removes only this temporary role and the shared OIDC
provider when creating; it never deletes the OIDC provider.
USAGE
}

command="${1:-}"
if [[ -z "$command" || "$command" == "-h" || "$command" == "--help" ]]; then
  usage
  exit 0
fi
if [[ "$command" != "create" && "$command" != "destroy" ]]; then
  usage >&2
  exit 2
fi

aws_region="${AWS_REGION:-us-east-1}"
github_owner="${GITHUB_OWNER:-Pabloin}"
github_repo="${GITHUB_REPO:-xAWS-Nerdearla-2026}"
role_name="comunid-github-infra-bootstrap-role"
oidc_host="token.actions.githubusercontent.com"
oidc_url="https://${oidc_host}"
policy_arn="arn:aws:iam::aws:policy/AdministratorAccess"

if [[ ! "$github_owner" =~ ^[A-Za-z0-9-]+$ || ! "$github_repo" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "GITHUB_OWNER or GITHUB_REPO contains unsupported characters." >&2
  exit 2
fi

aws_args=(--region "$aws_region")
if [[ -n "${AWS_PROFILE:-}" ]]; then
  aws_args+=(--profile "$AWS_PROFILE")
fi

account_id="${AWS_ACCOUNT_ID:-$(aws "${aws_args[@]}" sts get-caller-identity --query Account --output text)}"
provider_arn="arn:aws:iam::${account_id}:oidc-provider/${oidc_host}"
trust_file="$(mktemp)"
trap 'rm -f "$trust_file"' EXIT

write_trust_policy() {
  cat >"$trust_file" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "${provider_arn}"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"},
      "StringLike": {"token.actions.githubusercontent.com:sub": [
        "repo:${github_owner}/${github_repo}:*",
        "repo:${github_owner}@*/${github_repo}@*:*"
      ]}
    }
  }]
}
EOF
}

ensure_oidc_provider() {
  if aws "${aws_args[@]}" iam get-open-id-connect-provider \
    --open-id-connect-provider-arn "$provider_arn" >/dev/null 2>&1; then
    echo "GitHub OIDC provider already exists: ${provider_arn}"
    return
  fi

  aws "${aws_args[@]}" iam create-open-id-connect-provider \
    --url "$oidc_url" \
    --client-id-list sts.amazonaws.com \
    --tags \
      Key=Project,Value=comunid \
      Key=ManagedBy,Value=manual-bootstrap \
      Key=Purpose,Value=github-actions-oidc >/dev/null
  echo "Created GitHub OIDC provider: ${provider_arn}"
}

create_bootstrap_role() {
  ensure_oidc_provider
  write_trust_policy

  if aws "${aws_args[@]}" iam get-role --role-name "$role_name" >/dev/null 2>&1; then
    aws "${aws_args[@]}" iam update-assume-role-policy \
      --role-name "$role_name" --policy-document "file://${trust_file}"
    echo "Updated temporary role trust policy: ${role_name}"
  else
    aws "${aws_args[@]}" iam create-role \
      --role-name "$role_name" \
      --assume-role-policy-document "file://${trust_file}" \
      --description "Temporary first-run Terraform bootstrap for Comunid" \
      --tags \
        Key=Project,Value=comunid \
        Key=ManagedBy,Value=manual-bootstrap \
        Key=Purpose,Value=github-actions-terraform-bootstrap >/dev/null
    echo "Created temporary role: ${role_name}"
  fi

  aws "${aws_args[@]}" iam attach-role-policy \
    --role-name "$role_name" --policy-arn "$policy_arn"

  echo
  echo "Set both GitHub infrastructure secrets to this temporary ARN for the first apply:"
  echo "  COMUNID_STAGING_INFRA_ROLE_ARN=arn:aws:iam::${account_id}:role/${role_name}"
  echo "  COMUNID_PRODUCTION_INFRA_ROLE_ARN=arn:aws:iam::${account_id}:role/${role_name}"
  echo
  echo "After applying each environment, replace its secret with github_infra_role_arn."
}

destroy_bootstrap_role() {
  if ! aws "${aws_args[@]}" iam get-role --role-name "$role_name" >/dev/null 2>&1; then
    echo "Temporary role does not exist: ${role_name}"
    return
  fi

  aws "${aws_args[@]}" iam detach-role-policy \
    --role-name "$role_name" --policy-arn "$policy_arn" >/dev/null 2>&1 || true
  aws "${aws_args[@]}" iam delete-role --role-name "$role_name"
  echo "Deleted temporary role: arn:aws:iam::${account_id}:role/${role_name}"
  echo "Kept shared GitHub OIDC provider: ${provider_arn}"
}

case "$command" in
  create) create_bootstrap_role ;;
  destroy) destroy_bootstrap_role ;;
esac
