#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  terraform-bootstrap/bootstrap-state-bucket.sh create

Environment variables:
  AWS_PROFILE  Optional AWS CLI profile.
  AWS_REGION   Optional AWS region. Defaults to us-east-1.

Creates the dedicated, versioned, encrypted S3 bucket used by Comunid
Terraform state. It does not initialize or apply Terraform.
USAGE
}

command="${1:-}"
if [[ "$command" == "-h" || "$command" == "--help" ]]; then
  usage
  exit 0
fi
if [[ "$command" != "create" ]]; then
  usage >&2
  exit 2
fi

aws_region="${AWS_REGION:-us-east-1}"
aws_args=(--region "$aws_region")
if [[ -n "${AWS_PROFILE:-}" ]]; then
  aws_args+=(--profile "$AWS_PROFILE")
fi

account_id="$(aws "${aws_args[@]}" sts get-caller-identity --query Account --output text)"
bucket="comunid-terraform-state-${account_id}"

bucket_exists="$(aws "${aws_args[@]}" s3api list-buckets \
  --query "Buckets[?Name=='${bucket}'] | length(@)" --output text)"
if [[ "$bucket_exists" != "1" ]]; then
  create_args=(--bucket "$bucket" --region "$aws_region")
  if [[ "$aws_region" != "us-east-1" ]]; then
    create_args+=(--create-bucket-configuration "LocationConstraint=${aws_region}")
  fi
  aws "${aws_args[@]}" s3api create-bucket "${create_args[@]}" >/dev/null
  echo "Created state bucket: ${bucket}"
else
  echo "State bucket already exists in this account: ${bucket}"
fi

aws "${aws_args[@]}" s3api put-public-access-block \
  --bucket "$bucket" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws "${aws_args[@]}" s3api put-bucket-ownership-controls \
  --bucket "$bucket" \
  --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'
aws "${aws_args[@]}" s3api put-bucket-encryption \
  --bucket "$bucket" \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws "${aws_args[@]}" s3api put-bucket-versioning \
  --bucket "$bucket" \
  --versioning-configuration Status=Enabled
aws "${aws_args[@]}" s3api put-bucket-tagging \
  --bucket "$bucket" \
  --tagging 'TagSet=[{Key=Project,Value=comunid},{Key=ManagedBy,Value=bootstrap-script},{Key=Purpose,Value=terraform-state}]'

echo
echo "Terraform state bucket is ready: ${bucket}"
echo "GitHub Actions secret: COMUNID_TERRAFORM_STATE_BUCKET=${bucket}"
