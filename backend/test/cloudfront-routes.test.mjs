import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../../terraform/modules/apps/route-rewrite.js", import.meta.url), "utf8")
  .replaceAll("${mobile_domain}", "mobile.comunid.app")
  .replaceAll("${app_domain}", "app.comunid.app")
  .replaceAll("${admin_domain}", "admin.comunid.app")
  .replaceAll("${hero_domain}", "hero.comunid.app")
  .replaceAll("${www_domain}", "www.comunid.app")
  .replaceAll("${root_domain}", "comunid.app");

function rewrite(uri, host = "comunid.app") {
  return runInNewContext(`${source}\nhandler({request:{uri:${JSON.stringify(uri)},headers:{host:{value:${JSON.stringify(host)}}}}})`);
}

test("serves mobile and admin entry points from their prefixes", () => {
  assert.equal(rewrite("/app/").uri, "/app/index.html");
  assert.equal(rewrite("/admin").uri, "/admin/index.html");
  assert.equal(rewrite("/admin/photos").uri, "/admin/index.html");
  assert.equal(rewrite("/b/ana-cloud").uri, "/app/index.html");
});

test("keeps static assets and the landing route unchanged", () => {
  assert.equal(rewrite("/app/assets/index.js").uri, "/app/assets/index.js");
  assert.equal(rewrite("/admin/assets/index.css").uri, "/admin/assets/index.css");
  assert.equal(rewrite("/").uri, "/");
});

test("serves the mobile and admin applications from their subdomains", () => {
  assert.equal(rewrite("/", "mobile.comunid.app").uri, "/app/index.html");
  assert.equal(rewrite("/profiles", "mobile.comunid.app").uri, "/app/index.html");
  assert.equal(rewrite("/assets/app.js", "mobile.comunid.app").uri, "/app/assets/app.js");
  assert.equal(rewrite("/", "app.comunid.app").uri, "/app/index.html");
  assert.equal(rewrite("/profiles", "app.comunid.app").uri, "/app/index.html");
  assert.equal(rewrite("/assets/app.js", "app.comunid.app").uri, "/app/assets/app.js");
  assert.equal(rewrite("/", "admin.comunid.app").uri, "/admin/index.html");
  assert.equal(rewrite("/faces", "admin.comunid.app").uri, "/admin/index.html");
});

test("serves the hero broadcaster from its subdomain", () => {
  assert.equal(rewrite("/", "hero.comunid.app").uri, "/hero.html");
  assert.equal(rewrite("/start", "hero.comunid.app").uri, "/hero.html");
  assert.equal(rewrite("/assets/hero.js", "hero.comunid.app").uri, "/assets/hero.js");
  assert.equal(rewrite("/app/heros/hero-matias-kreder.png", "hero.comunid.app").uri, "/app/heros/hero-matias-kreder.png");
});

test("redirects www to the root domain", () => {
  const response = rewrite("/about", "www.comunid.app");
  assert.equal(response.statusCode, 301);
  assert.equal(response.headers.location.value, "https://comunid.app/about");
});
