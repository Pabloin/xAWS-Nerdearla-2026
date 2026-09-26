#!/usr/bin/env python3
"""Genera el diagrama de arquitectura para la charla."""

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
    add(f'<rect x="{x+17}" y="{y+18}" width="54" height="54" rx="12" fill="{color}"/>')
    txt(x+44, y+53, icon, "icon", 'text-anchor="middle"')
    txt(x+84, y+43, name, "name")
    for i, line in enumerate(lines):
        txt(x+84, y+68+i*21, line, "detail")
    if badge:
        rect(x+17, y+h-34, w-34, 22, "badge", 8)
        txt(x+28, y+h-18, badge, "badgeText")


add('''<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" role="img" aria-labelledby="title description">
<title id="title">Arquitectura de comunid.app — Nerdearla 2026</title>
<desc id="description">La app móvil permite escanear códigos QR y ver héroes que comparten su ubicación. Una página privada permite a los héroes publicar su ubicación, que Lambda guarda temporalmente en DynamoDB. CloudFront y S3 sirven las interfaces. Rekognition queda en el panel organizador como función complementaria.</desc>
<defs>
  <linearGradient id="background" x2="1" y2="1"><stop stop-color="#0d1726"/><stop offset="1" stop-color="#13263d"/></linearGradient>
  <linearGradient id="cloud" x2="1" y2="1"><stop stop-color="#152b41"/><stop offset="1" stop-color="#112235"/></linearGradient>
  <marker id="tip" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#82c8ff" stroke-width="2"/></marker>
  <marker id="softTip" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1 1 L8 4.5 L1 8" fill="none" stroke="#8ba6bd" stroke-width="1.8"/></marker>
  <style>
    text{font-family:Arial,Helvetica,sans-serif}.eyebrow{font-size:18px;letter-spacing:4px;font-weight:700;fill:#98ceff}.brand{font-size:55px;font-weight:800;letter-spacing:-1.5px;fill:#f6f9ff}.brandApp{fill:#8dd5ff}.subtitle{font-size:21px;fill:#b8c9d9}.section{font-size:17px;letter-spacing:2px;font-weight:700;fill:#a3d6ff}.name{font-size:20px;font-weight:700;fill:#f9fbff}.detail{font-size:16px;fill:#c2d0dd}.small{font-size:14px;fill:#9eb1c4}.icon{font-size:20px;font-weight:700;fill:white}.badgeText{font-size:13px;fill:#bcd1e3}.panel{fill:#111e30;stroke:#3b5874;stroke-width:1.7}.cloud{fill:url(#cloud);stroke:#466582;stroke-width:1.7}.card{fill:#1a2c43;stroke:#3e5b77;stroke-width:1.6}.badge{fill:#233b55}.flow{fill:none;stroke:#82c8ff;stroke-width:3;marker-end:url(#tip)}.support{fill:none;stroke:#8ba6bd;stroke-width:2;stroke-dasharray:7 7;marker-end:url(#softTip)}.thin{fill:none;stroke:#6385a5;stroke-width:1.5}.label{font-size:14px;font-weight:700;letter-spacing:1px;fill:#9ed4ff}.note{font-size:16px;fill:#d4e4f1}.accent{fill:#c8ff3d}
  </style>
</defs>
<rect width="1920" height="1080" fill="url(#background)"/><rect width="1920" height="6" fill="#84cbff"/>
''')

txt(70, 65, "NERDEARLA 2026 · ARQUITECTURA", "eyebrow")
add('<text x="70" y="121" class="brand">comunid<tspan class="brandApp">.app</tspan></text>')
txt(72, 156, "Encuentros en persona: escaneá el QR y encontrá a la comunidad en el evento", "subtitle")

# Actores y experiencia
rect(60, 205, 300, 655, "panel", 26)
txt(87, 244, "EXPERIENCIA DEL EVENTO", "section")
rect(82, 274, 256, 220, "card", 19)
txt(106, 312, "PARTICIPANTE", "label")
txt(106, 352, "1  Escanea el badge QR", "name")
txt(106, 385, "2  Abre el perfil y su historia", "detail")
txt(106, 418, "3  Registra el encuentro", "detail")
txt(106, 451, "4  Completa su pasaporte", "detail")
rect(82, 517, 256, 220, "card", 19)
txt(106, 555, "HÉROE", "label")
txt(106, 595, "Comparte ubicación", "name")
txt(106, 628, "desde su enlace privado", "detail")
txt(106, 674, "Su ubicación aparece en vivo", "detail")
txt(106, 707, "mientras el dato está vigente", "detail")
txt(88, 784, "La app conecta el encuentro", "small")
txt(88, 806, "presencial con el mapa del evento.", "small")

# Plataforma AWS
rect(382, 190, 1478, 670, "cloud", 30)
txt(412, 230, "AWS CLOUD · PRODUCCIÓN", "section")
txt(1826, 230, "Infraestructura como código: Terraform", "small", 'text-anchor="end"')
path("M412 245 H1828", "thin")
for x, label in [(412, "WEB"), (700, "APLICACIONES"), (1010, "API"), (1308, "DATOS Y SERVICIOS"), (1603, "OPERACIÓN")]:
    txt(x, 279, label, "section")

card(412, 326, 246, 132, "CloudFront", ["Entrega web segura", "rutas por dominio"], "#734cff", "CF", "HTTPS · OAC")
card(412, 540, 246, 120, "Cloudflare", ["DNS de comunid.app"], "#f18a30", "DNS")
card(700, 326, 260, 132, "S3 privado", ["Home · móvil · admin", "Hero · HTML · React"], "#78a70d", "S3", "Sitios estáticos")
card(700, 540, 260, 120, "AWS ACM", ["Certificado TLS"], "#e64265", "TLS")
card(1010, 326, 260, 132, "API Gateway", ["HTTP API", "QR · perfiles · ubicación"], "#8953ef", "API", "Rutas protegidas")
card(1010, 540, 260, 132, "AWS Lambda", ["Node.js · reglas de negocio", "validación y expiración"], "#f17a13", "λ", "API compartida")
card(1308, 315, 260, 128, "DynamoDB", ["Perfiles · encuentros", "ubicación temporal"], "#b448dc", "DB", "Sin historial de ubicación")
card(1308, 480, 260, 124, "Rekognition", ["Detección e indexado", "de rostros con consentimiento"], "#08a995", "AI", "Panel organizador")
card(1308, 642, 260, 112, "Secrets Manager", ["Token del panel admin"], "#c84464", "KEY")
card(1603, 326, 220, 126, "CloudWatch", ["Logs y diagnóstico"], "#d62888", "LOG")
card(1603, 530, 220, 126, "AWS IAM", ["Roles y permisos"], "#d94558", "IAM")

# Rutas principales: participante escanea y consulta; héroe publica ubicación.
path("M338 370 H402")
path("M338 623 H390 V455 H402")
txt(358, 356, "HTTPS", "label")
path("M658 392 H690")
path("M960 392 H1000")
txt(964, 375, "API", "label")
path("M1140 458 V530")
path("M1270 592 H1287 V443 H1298", "flow")
txt(1275, 580, "DATOS", "label")
path("M513 540 V468", "support")
path("M700 600 H676 V476 H548 V468", "support")
path("M1438 443 V470", "support")
txt(1450, 465, "ADMIN OPCIONAL", "small")
txt(1609, 713, "Ubicación activa: hasta 2 min", "small")
txt(1609, 735, "La app consulta cada 30 s", "small")
txt(1609, 757, "y muestra héroes disponibles", "small")

# Resumen funcional
rect(412, 785, 1411, 52, "badge", 13)
txt(433, 817, "FLUJO CENTRAL", "label")
txt(580, 817, "Escaneo QR → API → encuentro en DynamoDB", "note")
txt(1128, 817, "Ubicación → API → dato temporal → app", "note")

# CI/CD
rect(60, 900, 1800, 124, "panel", 25)
txt(87, 941, "ENTREGA CONTINUA", "section")
for x, w, title, sub, icon, color in [
    (335, 264, "GitHub Actions", "CI · build · despliegue", "{}", "#31557e"),
    (650, 265, "OIDC + AWS STS", "Credenciales temporales", "OIDC", "#d23f58"),
    (967, 280, "Roles IAM", "Infraestructura · aplicación", "IAM", "#d94558"),
    (1301, 488, "Terraform + deploy", "S3 · Lambda · invalidación CloudFront", "TF", "#7955c8"),
]:
    rect(x, 922, w, 72)
    add(f'<rect x="{x+14}" y="938" width="40" height="40" rx="9" fill="{color}"/>')
    txt(x+34, 964, icon, "badgeText", 'text-anchor="middle"')
    txt(x+67, 950, title, "name")
    txt(x+67, 977, sub, "small")
path("M600 958 H640")
path("M916 958 H957")
path("M1248 958 H1291")
txt(72, 1054, "Reconocimiento facial: capacidad secundaria del panel organizador, con consentimiento.", "small")
txt(1840, 1054, "comunid.app · Nerdearla 2026", "small", 'text-anchor="end"')
add("</svg>")
OUT.write_text("\n".join(parts), encoding="utf-8")
print(OUT)
