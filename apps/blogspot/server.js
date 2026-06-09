import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import querystring from "node:querystring";
import crypto from "node:crypto";

const port = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sessionToken = null;
const renderPage = async (fileName) => {
  const pages = {
    "/": "home.html",
    "/article": "article.html",
    "/admin": "admin.html",
    "/new": "new.html",
    "/edit": "edit.html",
    "/login": "login.html",
  };
  const content = await fs.readFile(
    path.join(__dirname, "pages", pages[fileName]),
    "utf-8",
  );
  return { status: 200, data: content };
};

function isAuthenticated(req) {
  const sessionCookie = req.headers.cookie;
  if (!sessionCookie) {
    return false;
  }
  const cookies = Object.fromEntries(sessionCookie.split("; ").map((cookie) => cookie.split("=", 2)));
  return cookies.sessionToken === sessionToken;
};

const protectedRoutes = ["/admin", "/new", "/edit", "/delete"];

const routes = {
  "/": () => renderPage("/"),
  "/article": () => renderPage("/article"),
  "/admin": () => renderPage("/admin"),
  "/new": () => renderPage("/new"),
  "/edit": () => renderPage("/edit"),
  "/login": () => renderPage("/login"),
};


// returns an array of article objects: { id, title, date }
async function getAllArticles(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const titlePromises = files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        const content = await fs.readFile(filePath, "utf-8");
        const id = path.parse(filePath).name;
        const { title, date, body } = JSON.parse(content);
        const shortDate = date.split("T")[0];
        return { id, title, shortDate };
      }
      return null;
    });
    const res = (await Promise.all(titlePromises)).filter(Boolean);
    return res;
  } catch (e) {
    return [];
  }
}

async function deleteArticle(filePath) {
  try {
    await fs.unlink(filePath);
    console.log("Deleted article:", filePath);
    return true;
  } catch (e) {
    console.error("Failed to delete article:", e);
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const { method } = req;
  const basePath = "/" + pathname.split("/")[1];

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
            sessionToken = crypto.randomUUID();
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
          const folderPath = path.join(__dirname, "article");
          const files = await fs.readdir(folderPath);
          const ids = files.map((f) => parseInt(path.parse(f).name));
          const newArticleId = ids.length ? Math.max(...ids) + 1 : 1;
          try {
            const newContent = JSON.stringify({
              title: parsed.title,
              date: new Date().toISOString(),
              body: parsed.body,
            });
            await fs.writeFile(
              path.join(__dirname, "article", `${newArticleId}.json`),
              newContent,
              "utf-8",
            );
            res.writeHead(302, {
              "Content-Type": "text/html",
              Location: `/article/${newArticleId}`,
            });
            res.end();
          } catch (e) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end(e.message);
          }
        });
      }
      else if (basePath === "/edit") {
        const pathId = pathname.split("/")[2];
        if (!pathId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID is required");
          return;
        }
        // check if article exists
        try {
          await fs.readFile(
            path.join(__dirname, "article", `${pathId}.json`),
            "utf-8",
          );
        } catch (e) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("Article not found");
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          const parsed = querystring.parse(body);
          try {
            const updatedContent = JSON.stringify({
              title: parsed.title,
              date: new Date().toISOString(),
              body: parsed.body,
            });
            await fs.writeFile(
              path.join(__dirname, "article", `${pathId}.json`),
              updatedContent,
              "utf-8",
            );
            // redirect to updated article
            res.writeHead(302, {
              "Content-Type": "text/html",
              Location: `/article/${pathId}`,
            });
            res.end();
          } catch (e) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end(e.message);
          }
        });
      }
      else if (basePath === "/delete") {
        const articleId = pathname.split("/")[2];
        const deleted = await deleteArticle(
          path.join(__dirname, "article", `${articleId}.json`),
        );
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

        const template = await fs.readFile(
          path.join(__dirname, "pages", "article.html"),
          "utf-8",
        );
        const articleRaw = await fs.readFile(
          path.join(__dirname, "article", `${articleId}.json`),
          "utf-8",
        );
        const articleData = JSON.parse(articleRaw);
        const shortDate = articleData.date.split("T")[0];
        const htmlOutput = template
          .replace(/{{TITLE}}/g, articleData.title)
          .replace("{{DATE}}", shortDate)
          .replace("{{BODY}}", articleData.body);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(htmlOutput);
      } else if (pathname.startsWith("/edit")) {
        const articleId = pathname.split("/")[2];

        if (!articleId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID required");
          return;
        }

        const template = await fs.readFile(
          path.join(__dirname, "pages", "edit.html"),
          "utf-8",
        );
        const articleRaw = await fs.readFile(
          path.join(__dirname, "article", `${articleId}.json`),
          "utf-8",
        );
        const articleData = JSON.parse(articleRaw);
        const shortDate = articleData.date.split("T")[0];
        const htmlOutput = template
          .replace("{{ID}}", articleId)
          .replace("{{TITLE}}", articleData.title)
          .replace("{{DATE}}", shortDate)
          .replace("{{BODY}}", articleData.body);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(htmlOutput);
      } else if (routes[pathname]) {
        const response = await routes[pathname]();
        if (pathname === "/") {
          const articles = await getAllArticles(
            path.join(__dirname, "article"),
          );
          const listHTML = articles
            .map(
              (a) =>
                `<li><a href="/article/${a.id}">${a.title}</a> — ${a.shortDate}</li>`,
            )
            .join("");
          response.data = response.data.replace("{{ARTICLE_LIST}}", listHTML);
        }
        if (pathname === "/admin") {
          const articles = await getAllArticles(
            path.join(__dirname, "article"),
          );
          const listHTML = articles
            .map(
              (a) => `
            <tr>
              <td>${a.title}</td>
              <td><a href="/edit/${a.id}">Edit</a> | <form method="POST" action="/delete/${a.id}"><button type="submit">Delete</button></form></td>
            </tr>
          `,
            )
            .join("");
          response.data = response.data.replace("{{ARTICLE_LIST}}", listHTML);
        }

        res.writeHead(response.status, { "Content-Type": "text/html" });
        res.end(response.data);
      } else if (basePath == '/logout') {
        res.writeHead(302, {
          "Content-Type": "text/html",
          Location: "/login",
          "Set-Cookie": `sessionToken="sessionToken=; Max-Age=0"; HttpOnly`
        });
        res.end();
      } else {
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
