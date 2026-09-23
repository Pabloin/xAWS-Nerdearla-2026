variable "project_name" {
  type    = string
  default = "comunid"
}
variable "environment" { type = string }
variable "domain_name" { type = string }
variable "additional_domains" {
  type    = map(string)
  default = {}
}
variable "cloudflare_zone_id" { type = string }
variable "default_event_id" {
  type    = string
  default = "nerdearla-2026"
}
variable "lambda_zip_path" { type = string }
variable "github_owner" { type = string }
variable "github_repo" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}
