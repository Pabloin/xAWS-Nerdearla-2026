variable "project_name" { type = string }
variable "environment" { type = string }
variable "domain_name" { type = string }
variable "additional_domains" {
  type    = map(string)
  default = {}
}
variable "cloudflare_zone_id" { type = string }
variable "web_bucket_name" { type = string }
variable "tags" { type = map(string) }
