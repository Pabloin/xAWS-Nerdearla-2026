#!/usr/bin/env python3
"""Genera el diagrama vectorial de arquitectura para la charla."""

from html import escape
from pathlib import Path

OUT = Path(__file__).with_name("arquitectura-charla.svg")
parts = []


def add(value):
    parts.append(value)


def txt(x, y, value, cls="detail", extra=""):
    add(f'<text x="{x}" y="{y}" class="{cls}" {extra}>{escape(value)}</text>')


def rect(x, y, w, h, cls="card", r=18, extra=""):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}" {extra}/>')


def path(d, cls="flow"):
    add(f'<path d="{d}" class="{cls}"/>')


def card(x, y, w, h, name, lines, color, icon, badge=None):
    rect(x, y, w, h)
    add(f'<rect x="{x+19}" y="{y+20}" width="58" height="58" rx="12" fill="{color}"/>')
    txt(x+48, y+58, icon, "icon", 'text-anchor="middle"')
    txt(x+91, y+46, name, "name")
    for i, line in enumerate(lines):
        txt(x+91, y+72+i*23, line, "detail")
    if badge:
        rect(x+19, y+h-39, w-38, 25, "badge", 9)
        txt(x+31, y+h-21, badge, "badgeText")


add('''<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" role="img" aria-labelledby="title description">
<title id="title">Arquitectura de comunid.app — Nerdearla 2026</title>
<desc id="description">Participantes y organizadores usan aplicaciones web servidas por CloudFront y S3. API Gateway y Lambda conectan DynamoDB, Rekognition y Secrets Manager. GitHub Actions y Terraform despliegan la solución.</desc>
<defs>
  <linearGradient id="background" x2="1" y2="1"><stop stop-color="#0d1726"/><stop offset="1" stop-color="#13263d"/></linearGradient>
  <linearGradient id="cloud" x2="1" y2="1"><stop stop-color="#152b41"/><stop offset="1" stop-color="#112235"/></linearGradient>
  <marker id="tip" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#82c8ff" stroke-width="2"/></marker>
  <marker id="softTip" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1 1 L8 4.5 L1 8" fill="none" stroke="#8ba6bd" stroke-width="1.8"/></marker>
  <style>
    text{font-family:Arial,Helvetica,sans-serif} .eyebrow{font-size:18px;letter-spacing:4px;font-weight:700;fill:#98ceff} .brand{font-size:55px;font-weight:800;letter-spacing:-1.5px;fill:#f6f9ff}.brandApp{fill:#8dd5ff}.subtitle{font-size:21px;fill:#b8c9d9}.section{font-size:18px;letter-spacing:2.6px;font-weight:700;fill:#a3d6ff}.name{font-size:21px;font-weight:700;fill:#f9fbff}.detail{font-size:16px;fill:#c2d0dd}.small{font-size:14px;fill:#9eb1c4}.icon{font-size:22px;font-weight:700;fill:white}.badgeText{font-size:14px;fill:#bcd1e3}.panel{fill:#111e30;stroke:#3b5874;stroke-width:1.7}.cloud{fill:url(#cloud);stroke:#466582;stroke-width:1.7}.card{fill:#1a2c43;stroke:#3e5b77;stroke-width:1.6}.badge{fill:#233b55}.flow{fill:none;stroke:#82c8ff;stroke-width:3;marker-end:url(#tip)}.support{fill:none;stroke:#8ba6bd;stroke-width:2;stroke-dasharray:7 7;marker-end:url(#softTip)}.thin{fill:none;stroke:#6385a5;stroke-width:1.5}.label{font-size:14px;font-weight:700;letter-spacing:1px;fill:#9ed4ff}.note{font-size:16px;fill:#d4e4f1}
  </style>
</defs>
<rect width="1920" height="1080" fill="url(#background)"/>
<rect width="1920" height="6" fill="#84cbff"/>
''')

txt(70, 65, "NERDEARLA 2026 · ARQUITECTURA", "eyebrow")
add('<text x="70" y="121" class="brand">comunid<tspan class="brandApp">.app</tspan></text>')
txt(72, 156, "La comunidad hecha app: encuentros reales, QR y búsqueda visual", "subtitle")

# Personas
rect(60, 220, 273, 650, "panel", 28)
txt(87, 260, "PERSONAS", "section")
rect(82, 308, 229, 189)
add('<circle cx="120" cy="350" r="25" fill="#183a59" stroke="#76c5ff" stroke-width="1.8"/>')
txt(120, 358, "▯", "icon", 'text-anchor="middle"')
txt(156, 346, "Participante", "name")
txt(156, 372, "Web móvil", "detail")
txt(106, 413, "Escanea badges QR", "detail")
txt(106, 439, "Registra encuentros", "detail")
txt(106, 465, "Completa su pasaporte", "detail")
rect(82, 550, 229, 189)
add('<circle cx="120" cy="592" r="25" fill="#183a59" stroke="#76c5ff" stroke-width="1.8"/>')
txt(120, 600, "▣", "icon", 'text-anchor="middle"')
txt(156, 588, "Organizador", "name")
txt(156, 614, "Panel web", "detail")
txt(106, 655, "Gestiona perfiles", "detail")
txt(106, 681, "Valida consentimiento", "detail")
txt(106, 707, "Indexa rostros", "detail")

# Nube y etiquetas de columnas
rect(352, 190, 1508, 680, "cloud", 32)
txt(385, 230, "AWS CLOUD · STAGING / PRODUCCIÓN", "section")
txt(1825, 230, "Infraestructura como código: Terraform", "small", 'text-anchor="end"')
path("M385 244 H1827", "thin")
for x, label in [(390, "BORDE Y ENTREGA"), (682, "FRONTENDS"), (982, "API SERVERLESS"), (1282, "DATOS E IA"), (1587, "OPERACIÓN")]:
    txt(x, 278, label, "section")

# Servicios: la infraestructura usa una sola distribución y un bucket web.
card(390, 326, 250, 146, "CloudFront", ["Una distribución", "para 3 interfaces"], "#734cff", "CF", "HTTPS · OAC · rutas por dominio")
card(390, 560, 250, 105, "Cloudflare", ["comunid.app · DNS"], "#f18a30", "DNS")
card(682, 326, 250, 146, "Amazon S3", ["Bucket web privado", "Home · móvil · admin"], "#78a70d", "S3", "React/Vite · HTML · JS")
card(682, 560, 250, 105, "AWS ACM", ["Certificado TLS"], "#e64265", "TLS")
card(982, 326, 250, 146, "API Gateway", ["HTTP API", "Rutas y límites"], "#8953ef", "API", "Perfiles · QR · encuentros")
card(982, 560, 250, 146, "AWS Lambda", ["Node.js 20", "Lógica y validaciones"], "#f17a13", "λ", "API compartida")
card(1282, 318, 260, 132, "DynamoDB", ["Perfiles · encuentros", "Consentimiento · IDs"], "#b448dc", "DB")
card(1282, 493, 260, 145, "Rekognition", ["Detectar · indexar", "Buscar rostros"], "#08a995", "AI", "Colección por entorno")
card(1282, 698, 260, 112, "Secrets Manager", ["Token del panel admin"], "#c84464", "KEY")
card(1587, 326, 236, 126, "CloudWatch", ["Logs de Lambda", "Diagnóstico"], "#d62888", "LOG")
card(1587, 530, 236, 126, "AWS IAM", ["Roles y permisos", "de ejecución"], "#d94558", "IAM")

# Flujos de solicitud. Las dependencias DNS/TLS se muestran punteadas.
path("M311 403 H380")
path("M311 644 H352 V438 H380")
txt(323, 387, "HTTPS", "label")
path("M640 399 H672")
path("M932 399 H972")
txt(939, 382, "API HTTPS", "label")
path("M1107 472 V550")
path("M1232 590 H1256 V384 H1272")
path("M1232 619 H1272")
path("M1232 656 H1256 V754 H1272")
txt(1244, 472, "METADATOS", "label")
txt(1245, 604, "ROSTROS", "label")
path("M515 560 V482", "support")
path("M682 609 H657 V488 H548 V482", "support")
txt(399, 540, "DNS", "label")
txt(659, 545, "TLS", "label")
txt(1595, 712, "Observabilidad y acceso controlado", "small")
txt(1595, 735, "S3 de medios: provisionado; sin flujo", "small")
txt(1595, 756, "activo en esta versión", "small")

# Observación para evitar sugerir que las selfies se almacenan o que el móvil usa Rekognition.
rect(386, 781, 830, 56, "badge", 13)
txt(405, 805, "PRIVACIDAD", "label")
txt(516, 805, "La selfie y la foto grupal original quedan en el navegador.", "note")
txt(516, 827, "El reconocimiento facial se usa en el panel organizador.", "small")

# Entrega continua
rect(60, 908, 1800, 116, "panel", 25)
txt(86, 945, "ENTREGA CONTINUA", "section")
for x, w, title, sub, icon, color in [
    (335, 264, "GitHub Actions", "CI · build · despliegue", "{}", "#31557e"),
    (650, 265, "OIDC + AWS STS", "Credenciales temporales", "OIDC", "#d23f58"),
    (967, 280, "Roles IAM", "Infraestructura · aplicación", "IAM", "#d23f58"),
    (1301, 488, "Terraform + deploy", "S3 · Lambda · invalidación CloudFront", "TF", "#7955c8"),
]:
    rect(x, 932, w, 67)
    add(f'<rect x="{x+14}" y="947" width="40" height="40" rx="9" fill="{color}"/>')
    txt(x+34, 973, icon, "badgeText", 'text-anchor="middle"')
    txt(x+67, 959, title, "name")
    txt(x+67, 984, sub, "small")
path("M600 966 H640")
path("M916 966 H957")
path("M1248 966 H1291")
txt(72, 1054, "Fuente técnica: terraform/modules y backend/functions/api.mjs · Diagrama de arquitectura, no inventario de recursos desplegados", "small")
txt(1840, 1054, "comunid.app · Nerdearla 2026", "small", 'text-anchor="end"')
add("</svg>")
OUT.write_text("\n".join(parts), encoding="utf-8")
print(OUT)
