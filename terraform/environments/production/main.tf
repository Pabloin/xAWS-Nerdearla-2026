module "comunid" {
  source           = "../../modules/comunid"
  environment      = "production"
  domain_name      = "comunid.app"
  hosted_zone_name = "comunid.app"
  default_event_id = "nerdearla-2026"
  lambda_zip_path  = var.lambda_zip_path
  github_owner     = var.github_owner
  github_repo      = var.github_repo
}
