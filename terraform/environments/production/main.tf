module "comunid" {
  source      = "../../modules/comunid"
  environment = "production"
  domain_name = "comunid.app"
  additional_domains = {
    mobile = "mobile.comunid.app"
    admin  = "admin.comunid.app"
    www    = "www.comunid.app"
  }
  cloudflare_zone_id = var.cloudflare_zone_id
  default_event_id   = "nerdearla-2026"
  lambda_zip_path    = var.lambda_zip_path
  github_owner       = var.github_owner
  github_repo        = var.github_repo
}
