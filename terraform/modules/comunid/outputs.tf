output "api_url" { value = module.api.api_url }
output "web_bucket_name" { value = module.apps.web_bucket_name }
output "distribution_id" { value = module.apps.distribution_id }
output "lambda_name" { value = module.api.lambda_name }
output "github_app_role_arn" { value = module.cicd.app_role_arn }
output "domain_name" { value = module.apps.domain_name }
