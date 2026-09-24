# Terraform bootstrap

Esta carpeta resuelve el primer acceso de GitHub Actions a AWS. El script crea
el proveedor OIDC de GitHub si todavía no existe y un rol temporal para poder
ejecutar Terraform por primera vez. No inicia Terraform ni crea recursos de la
aplicación. `bootstrap-state-bucket.sh` crea el bucket remoto versionado,
cifrado y bloqueado contra acceso público.

Crear el bucket de estado:

```bash
AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-state-bucket.sh create
```

El comando imprime el valor para el secreto `COMUNID_TERRAFORM_STATE_BUCKET`.

Desde la raíz del repositorio:

```bash
AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-github-oidc-role.sh create
```

Copiá el ARN temporal que imprime el script a los secretos de GitHub:

- `COMUNID_STAGING_INFRA_ROLE_ARN`
- `COMUNID_PRODUCTION_INFRA_ROLE_ARN`

El bucket remoto de estado y las credenciales de Cloudflare también deben estar
configurados. Consultá la sección **AWS environments** del README principal.

Después de aplicar Terraform en staging, cambiá `COMUNID_STAGING_INFRA_ROLE_ARN`
al output `github_infra_role_arn`. Cuando apliques production, cambiá también
`COMUNID_PRODUCTION_INFRA_ROLE_ARN` al output de ese entorno. El rol de
aplicación se obtiene como `github_app_role_arn`; producción lo usa para subir
los frontends y actualizar Lambda.

Cuando ambos secretos de infraestructura apunten a sus roles permanentes,
eliminá el rol temporal:

```bash
AWS_PROFILE=sebas ./terraform-bootstrap/bootstrap-github-oidc-role.sh destroy
```

El proveedor OIDC no se elimina porque los roles permanentes lo usan.
