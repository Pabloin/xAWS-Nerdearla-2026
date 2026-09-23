module "comunid" {
  source             = "../../modules/comunid"
  environment        = "staging"
  domain_name        = "staging.comunid.app"
  cloudflare_zone_id = var.cloudflare_zone_id
  default_event_id   = "nerdearla-2026"
  lambda_zip_path    = var.lambda_zip_path
  github_owner       = var.github_owner
  github_repo        = var.github_repo
}
