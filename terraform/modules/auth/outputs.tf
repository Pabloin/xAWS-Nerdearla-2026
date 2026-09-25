output "user_pool_id" { value = aws_cognito_user_pool.attendees.id }
output "client_id" { value = aws_cognito_user_pool_client.mobile.id }
output "issuer" { value = "https://${aws_cognito_user_pool.attendees.endpoint}" }
