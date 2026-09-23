variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "github_owner" { type = string }
variable "github_repo" { type = string }
variable "cloudflare_zone_id" { type = string }
variable "lambda_zip_path" {
  type    = string
  default = "../../../backend/dist/api.zip"
}
