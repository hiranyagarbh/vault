import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import querystring from "node:querystring";
import { getAllArticles, getArticle, createArticle, updateArticle, deleteArticle } from "./articles.js";
import { renderPage, buildPage, buildHomeList, buildAdminList } from "./template.js";
import { createSession, deleteSession, isAuthenticated, protectedRoutes } from "./auth.js";

const port = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
await fs.mkdir(path.join(__dirname, "article"), { recursive: true });

const routes = {
  "/": () => renderPage("/"),
  "/article": () => renderPage("/article"),
  "/admin": () => renderPage("/admin"),
  "/new": () => renderPage("/new"),
  "/edit": () => renderPage("/edit"),
  "/login": () => renderPage("/login"),
};


const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const { method } = req;
  const basePath = "/" + pathname.split("/")[1];
  const folderPath = path.join(__dirname, "article");

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated(req)) {
    res.writeHead(302, {
      "Content-Type": "text/html",
      Location: "/login",
    });
    res.end();
    return;
  }

  try {
    if (method === "POST") {
      if (basePath === '/login') {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          const parsed = querystring.parse(body);
          if (parsed.username === process.env.ADMIN_USERNAME && parsed.password === process.env.ADMIN_PASSWORD) {
            const sessionToken = createSession();
            res.writeHead(302, {
              "Content-Type": "text/html",
              Location: "/admin",
              "Set-Cookie": `sessionToken=${sessionToken}; HttpOnly`
            });
            res.end();
          } else {
            res.writeHead(302, { "Content-Type": "text/html", Location: '/login?error=1' });
            res.end();
          }
        });
      }
      else if (basePath === "/new") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          const parsed = querystring.parse(body);
          const newArticleId = await createArticle(folderPath, parsed);
          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: `/article/${newArticleId}`,
          });
          res.end();
        });
      }
      else if (basePath === "/edit") {
        const pathId = pathname.split("/")[2];
        if (!pathId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID is required");
          return;
        }
        const existingContent = await getArticle(folderPath, pathId);
        if (!existingContent) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("Article not found");
          return;
        }
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          const parsed = querystring.parse(body);
          await updateArticle(folderPath, pathId, parsed);
          res.writeHead(302, { "Content-Type": "text/html", Location: `/article/${pathId}` });
          res.end();
        });
      }
      else if (basePath === "/delete") {
        const articleId = pathname.split("/")[2];
        const deleted = await deleteArticle(folderPath, articleId);
        if (deleted) {
          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: "/admin",
          });
          res.end();
        } else {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("Failed to delete article. ");
        }
      }
    } else if (method === "GET") {
      if (pathname.startsWith("/article/")) {
        const articleId = pathname.split("/")[2];
        if (!articleId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID required");
          return;
        }

        const template = await renderPage("/article")
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(buildPage(template, await getArticle(folderPath, articleId)));
      }
      else if (pathname.startsWith("/edit")) {
        const articleId = pathname.split("/")[2];
        if (!articleId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID required");
          return;
        }

        const template = await renderPage("/edit")
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(buildPage(template, await getArticle(folderPath, articleId)));
      }
      else if (routes[pathname]) {
        const content = await routes[pathname]();
        res.writeHead(200, { "Content-Type": "text/html" })
        if (pathname === "/") {
          const articles = await getAllArticles(folderPath);
          articles.sort((a, b) => b.shortDate > a.shortDate ? 1 : -1);
          res.end(content.replace("{{ARTICLE_LIST}}", buildHomeList(articles)))
        }
        else if (pathname === "/admin") {
          const articles = await getAllArticles(folderPath);
          res.end(content.replace("{{ARTICLE_LIST}}", buildAdminList(articles)))
        }
        else {
          res.end(content);
        }
      }
      else if (basePath == '/logout') {
        deleteSession();
        res.writeHead(302, {
          "Content-Type": "text/html",
          Location: "/login",
          "Set-Cookie": "sessionToken=; Max-Age=0; HttpOnly"
        });
        res.end();
      }
      else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 Not found");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("404 Not found");
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(error.message);
  }
});

server.listen(port, () => {
  console.log(`\n  🚀 Server running at \x1b[36mhttp://localhost:${port}\x1b[0m`);
  console.log(`  Press \x1b[33mCtrl+C\x1b[0m to stop\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  ❌ Port ${port} already in use. Try another port:\n     PORT=8001 node server.js\n`);
  } else {
    console.error(`\n  ❌ Server error: ${err.message}\n`);
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(`\n  👋 Shutting down...\n`);
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
