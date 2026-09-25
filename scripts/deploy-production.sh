#!/usr/bin/env bash
set -euo pipefail

readonly project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly tf_dir="${project_dir}/terraform/environments/production"
readonly expected_account="402349693900"
readonly profile="${AWS_PROFILE_NAME:-402349693900_AdministratorAccess}"
readonly region="us-east-1"
readonly state_bucket="comunid-terraform-state-${expected_account}"

for name in CLOUDFLARE_API_TOKEN TF_VAR_cloudflare_zone_id TF_VAR_github_owner TF_VAR_github_owner_id TF_VAR_github_repo TF_VAR_github_repo_id; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 2
  fi
done

actual_account="$(aws sts get-caller-identity --profile "${profile}" --query Account --output text)"
if [[ "${actual_account}" != "${expected_account}" ]]; then
  echo "Refusing to deploy: expected AWS account ${expected_account}, got ${actual_account}." >&2
  exit 1
fi

export AWS_PROFILE="${profile}"
export AWS_REGION="${region}"

cd "${project_dir}"
npm ci
npm run check
npm --workspace @comunid/backend run package

terraform -chdir="${tf_dir}" init -reconfigure \
  -backend-config="bucket=${state_bucket}" \
  -backend-config="key=comunid/production/terraform.tfstate" \
  -backend-config="region=${region}" \
  -backend-config="encrypt=true" \
  -backend-config="use_lockfile=true"
terraform -chdir="${tf_dir}" validate
terraform -chdir="${tf_dir}" plan -out=tfplan
plan_json="$(mktemp)"
trap 'rm -f "${plan_json}"' EXIT
terraform -chdir="${tf_dir}" show -json tfplan > "${plan_json}"
if jq -e '[.resource_changes[]?.change.actions | select(index("delete"))] | length > 0' "${plan_json}"; then
  echo "Refusing to apply a plan that deletes infrastructure." >&2
  exit 1
fi
terraform -chdir="${tf_dir}" apply -auto-approve tfplan

api_url="$(terraform -chdir="${tf_dir}" output -raw api_url)"
web_bucket="$(terraform -chdir="${tf_dir}" output -raw web_bucket_name)"
distribution_id="$(terraform -chdir="${tf_dir}" output -raw distribution_id)"
lambda_name="$(terraform -chdir="${tf_dir}" output -raw lambda_name)"
export VITE_COGNITO_USER_POOL_ID="$(terraform -chdir="${tf_dir}" output -raw cognito_user_pool_id)"
export VITE_COGNITO_CLIENT_ID="$(terraform -chdir="${tf_dir}" output -raw cognito_client_id)"
export VITE_API_BASE_URL="${api_url}"
export VITE_APP_URL="https://mobile.comunid.app/"
export VITE_PUBLIC_APP_URL="https://mobile.comunid.app"
export VITE_HOME_URL="https://comunid.app/"
export VITE_MOBILE_BASE="/app/"
export VITE_ADMIN_BASE="/admin/"
npm run build

aws s3 sync front_home/dist "s3://${web_bucket}" --delete --exclude 'app/*' --exclude 'admin/*'
aws s3 sync front_mobile/dist "s3://${web_bucket}/app" --delete
aws s3 sync front_admin/dist "s3://${web_bucket}/admin" --delete
aws lambda update-function-code --function-name "${lambda_name}" --zip-file fileb://backend/dist/api.zip >/dev/null
aws cloudfront create-invalidation --distribution-id "${distribution_id}" --paths '/*' >/dev/null

echo "Production deployed to AWS account ${expected_account}."
echo "App: https://mobile.comunid.app"
echo "API: ${api_url}"
