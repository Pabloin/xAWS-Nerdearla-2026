resource "aws_cognito_user_pool" "attendees" {
  name                     = "${var.project_name}-${var.environment}-attendees"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = "ACTIVE"

  username_configuration {
    case_sensitive = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Confirmá tu cuenta de Comunid"
    email_message        = "Tu código de verificación de Comunid es {####}."
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  tags = var.tags
}

resource "aws_cognito_user_pool_client" "mobile" {
  name                          = "${var.project_name}-${var.environment}-mobile"
  user_pool_id                  = aws_cognito_user_pool.attendees.id
  generate_secret               = false
  explicit_auth_flows           = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
  refresh_token_validity        = 7

  token_validity_units {
    refresh_token = "days"
  }
}
