data "aws_caller_identity" "current" {}

locals {
  name = "${var.project_name}-${var.environment}"
  tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  })
  oidc_provider_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

module "storage" {
  source            = "../storage"
  project_name      = var.project_name
  environment       = var.environment
  account_id        = data.aws_caller_identity.current.account_id
  media_bucket_name = "${local.name}-media-${data.aws_caller_identity.current.account_id}"
  tags              = local.tags
}

module "apps" {
  source           = "../apps"
  project_name     = var.project_name
  environment      = var.environment
  domain_name      = var.domain_name
  hosted_zone_name = var.hosted_zone_name
  web_bucket_name  = "${local.name}-web-${data.aws_caller_identity.current.account_id}"
  tags             = local.tags
}

module "api" {
  source            = "../api"
  project_name      = var.project_name
  environment       = var.environment
  lambda_zip_path   = var.lambda_zip_path
  table_name        = module.storage.table_name
  table_arn         = module.storage.table_arn
  media_bucket_name = module.storage.media_bucket_name
  media_bucket_arn  = module.storage.media_bucket_arn
  public_app_url    = "https://${var.domain_name}"
  allowed_origins   = ["https://${var.domain_name}"]
  default_event_id  = var.default_event_id
  tags              = local.tags
}

module "cicd" {
  source                   = "../cicd"
  project_name             = var.project_name
  environment              = var.environment
  github_owner             = var.github_owner
  github_repo              = var.github_repo
  github_oidc_provider_arn = local.oidc_provider_arn
  web_bucket_arn           = module.apps.web_bucket_arn
  distribution_arn         = module.apps.distribution_arn
  lambda_arn               = module.api.lambda_arn
  tags                     = local.tags
}
