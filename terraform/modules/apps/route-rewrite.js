function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var host = request.headers && request.headers.host ? request.headers.host.value.toLowerCase() : "";
  var mobileDomain = "${mobile_domain}";
  var appDomain = "${app_domain}";
  var adminDomain = "${admin_domain}";
  var heroDomain = "${hero_domain}";
  var wwwDomain = "${www_domain}";

  if (wwwDomain && host === wwwDomain) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://${root_domain}" + uri } }
    };
  }

  if (heroDomain && host === heroDomain) {
    if (uri.indexOf("/assets/") !== 0 && uri.indexOf("/brand/") !== 0 && uri.indexOf("/app/heros/") !== 0) request.uri = "/hero.html";
    return request;
  }

  var hostSection = (mobileDomain && host === mobileDomain) || (appDomain && host === appDomain) ? "/app" : adminDomain && host === adminDomain ? "/admin" : "";
  if (hostSection && uri.indexOf("/app/") !== 0 && uri.indexOf("/admin/") !== 0 && uri.indexOf("/b/") !== 0) {
    request.uri = hostSection + (uri === "/" ? "/index.html" : uri);
    uri = request.uri;
  }
  var sections = ["/app", "/admin"];

  if (uri.indexOf("/b/") === 0) {
    request.uri = "/app/index.html";
    return request;
  }

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    if (uri === section || uri === section + "/") {
      request.uri = section + "/index.html";
      break;
    }
    if (uri.indexOf(section + "/") === 0 && uri.lastIndexOf(".") < uri.lastIndexOf("/")) {
      request.uri = section + "/index.html";
      break;
    }
  }
  return request;
}
