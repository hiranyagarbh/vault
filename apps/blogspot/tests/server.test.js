import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "..", "server.js");

// random port
const PORT = 9000 + Math.floor(Math.random() * 1000);
const BASE = `http://localhost:${PORT}`;

let serverProcess;

// helper: make http request, return {status, headers, body}
// handles redirects manually to be able to assert on them
async function req(urlPath, options = {}) {
    const { method = "GET", body, headers = {}, cookie } = options;
    if (cookie) headers.cookie = cookie;

    const fetchOpts = { method, headers, redirect: "manual" };
    if (body) {
        fetchOpts.body = body;
        headers["Content-Type"] = headers["Content-Type"] || "application/x-www-form-urlencoded";
    }

    const res = await fetch(`${BASE}${urlPath}`, fetchOpts);
    const text = await res.text();
    return {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: text,
    };
}

// helper: login and return session cookie string
async function login() {
    const res = await req("/login", {
        method: "POST",
        body: "username=admin&password=admin123",
    });
    const setCookie = res.headers["set-cookie"];
    return setCookie?.split(";")[0];
}

describe("Server Integration Tests", () => {
    before(async () => {
        serverProcess = spawn("node", [serverPath], {
            env: {
                ...process.env,
                PORT: String(PORT),
                ADMIN_USERNAME: "admin",
                ADMIN_PASSWORD: "admin123",
            },
            stdio: "pipe",
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Server start timeout")), 5000);
            serverProcess.stdout.on("data", (data) => {
                if (data.toString().includes("Server running")) {
                    clearTimeout(timeout);
                    resolve();
                }
            });
            serverProcess.stderr.on("data", (data) => {
                console.error("Server stderr:", data.toString());
            });
        });
    });

    after(() => {
        if (serverProcess) {
            serverProcess.kill("SIGTERM");
        }
    });

    // get routes

    describe("GET /", () => {
        test("returns 200 with HTML", async () => {
            const res = await req("/");
            assert.strictEqual(res.status, 200);
            assert.ok(res.headers["content-type"].includes("text/html"));
        });

        test("contains home page content", async () => {
            const res = await req("/");
            assert.ok(res.body.includes("</html>"), "should be valid HTML");
        });
    });

    describe("GET /login", () => {
        test("returns 200 with login form", async () => {
            const res = await req("/login");
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.includes("login"), "should contain login form");
        });
    });

    describe("GET /nonexistent", () => {
        test("returns 404", async () => {
            const res = await req("/nonexistent");
            assert.strictEqual(res.status, 404);
            assert.ok(res.body.includes("404"));
        });
    });

    // auth protected routes redirect

    describe("Protected routes without auth", () => {
        test("GET /admin redirects to /login", async () => {
            const res = await req("/admin");
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
        });

        test("GET /new redirects to /login", async () => {
            const res = await req("/new");
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
        });

        test("GET /edit/1 redirects to /login", async () => {
            const res = await req("/edit/1");
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
        });

        test("POST /delete/1 redirects to /login", async () => {
            const res = await req("/delete/1", { method: "POST" });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
        });
    });

    // auth login flow

    describe("POST /login", () => {
        test("valid credentials → redirect to /admin with session cookie", async () => {
            const res = await req("/login", {
                method: "POST",
                body: "username=admin&password=admin123",
            });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/admin");
            assert.ok(res.headers["set-cookie"], "should set session cookie");
            assert.ok(res.headers["set-cookie"].includes("sessionToken="), "cookie should contain sessionToken");
            assert.ok(res.headers["set-cookie"].includes("HttpOnly"), "cookie should be HttpOnly");
        });

        test("invalid credentials → redirect to /login?error=1", async () => {
            const res = await req("/login", {
                method: "POST",
                body: "username=wrong&password=wrong",
            });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login?error=1");
        });

        test("empty credentials → redirect to /login?error=1", async () => {
            const res = await req("/login", {
                method: "POST",
                body: "",
            });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login?error=1");
        });
    });

    // auth protected routes

    describe("Authenticated access", () => {
        test("GET /admin returns 200 with valid session", async () => {
            const cookie = await login();
            const res = await req("/admin", { cookie });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.includes("</html>"));
        });

        test("GET /new returns 200 with valid session", async () => {
            const cookie = await login();
            const res = await req("/new", { cookie });
            assert.strictEqual(res.status, 200);
        });
    });

    // logout

    describe("GET /logout", () => {
        test("clears session and redirects to /login", async () => {
            const cookie = await login();
            const res = await req("/logout", { cookie });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
            assert.ok(res.headers["set-cookie"].includes("Max-Age=0"), "should expire cookie");
        });

        test("after logout, protected routes redirect again", async () => {
            const cookie = await login();
            await req("/logout", { cookie });
            const res = await req("/admin", { cookie });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/login");
        });
    });

    // CRUD

    describe("Article CRUD", () => {
        let articleId;
        let cookie;

        before(async () => {
            cookie = await login();
        });

        test("POST /new creates article and redirects", async () => {
            const res = await req("/new", {
                method: "POST",
                body: "title=Integration+Test+Article&body=This+is+test+content",
                cookie,
            });
            assert.strictEqual(res.status, 302);
            assert.ok(res.headers.location.startsWith("/article/"), "should redirect to new article");
            articleId = res.headers.location.split("/")[2];
            assert.ok(articleId, "should have article ID in redirect");
        });

        test("GET /article/:id returns created article", async () => {
            const res = await req(`/article/${articleId}`);
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.includes("Integration Test Article"), "should contain title");
            assert.ok(res.body.includes("This is test content"), "should contain body");
        });

        test("GET /edit/:id returns edit form with article data", async () => {
            const res = await req(`/edit/${articleId}`, { cookie });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.includes("Integration Test Article"), "should contain title in form");
        });

        test("POST /edit/:id updates article and redirects", async () => {
            const res = await req(`/edit/${articleId}`, {
                method: "POST",
                body: "title=Updated+Title&body=Updated+body+content",
                cookie,
            });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, `/article/${articleId}`);

            // verify update
            const article = await req(`/article/${articleId}`);
            assert.ok(article.body.includes("Updated Title"), "should have updated title");
            assert.ok(article.body.includes("Updated body content"), "should have updated body");
        });

        test("POST /edit without ID returns 400", async () => {
            const res = await req("/edit/", {
                method: "POST",
                body: "title=X&body=Y",
                cookie,
            });
            assert.strictEqual(res.status, 400);
        });

        test("POST /edit with nonexistent ID returns 404", async () => {
            const res = await req("/edit/99999", {
                method: "POST",
                body: "title=X&body=Y",
                cookie,
            });
            assert.strictEqual(res.status, 404);
        });

        test("article appears on home page", async () => {
            const res = await req("/");
            assert.ok(res.body.includes("Updated Title"), "home page should list the article");
        });

        test("article appears on admin page", async () => {
            const res = await req("/admin", { cookie });
            assert.ok(res.body.includes("Updated Title"), "admin page should list the article");
            assert.ok(res.body.includes(`/edit/${articleId}`), "admin should have edit link");
            assert.ok(res.body.includes(`/delete/${articleId}`), "admin should have delete form");
        });

        test("POST /delete/:id deletes article and redirects to admin", async () => {
            const res = await req(`/delete/${articleId}`, {
                method: "POST",
                cookie,
            });
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.headers.location, "/admin");

            // verify
            const home = await req("/");
            assert.ok(!home.body.includes("Updated Title"), "deleted article should not appear");
        });

        test("POST /delete nonexistent returns 500", async () => {
            const res = await req("/delete/99999", {
                method: "POST",
                cookie,
            });
            assert.strictEqual(res.status, 500);
        });
    });

    // edge cases

    describe("Edge cases", () => {
        test("GET /article/ without ID returns 400", async () => {
            const res = await req("/article/");
            assert.strictEqual(res.status, 400);
        });

        test("unsupported HTTP method returns 404", async () => {
            const res = await req("/", { method: "PUT" });
            assert.strictEqual(res.status, 404);
        });
    });
});
