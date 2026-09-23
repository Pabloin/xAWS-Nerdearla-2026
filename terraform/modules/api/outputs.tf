output "api_url" { value = aws_apigatewayv2_api.http.api_endpoint }
output "api_id" { value = aws_apigatewayv2_api.http.id }
output "lambda_name" { value = aws_lambda_function.api.function_name }
output "lambda_arn" { value = aws_lambda_function.api.arn }
output "face_collection_id" { value = aws_rekognition_collection.faces.collection_id }
output "admin_secret_name" { value = aws_secretsmanager_secret.admin_token.name }
