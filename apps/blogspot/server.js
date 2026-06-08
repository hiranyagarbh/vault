import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import querystring from "node:querystring";

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        return { id, title, shortDate, body };
      }
      return null;
    });
    const res = (await Promise.all(titlePromises)).filter(Boolean);
    return res;
  } catch (e) {
    return e.message;
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

  try {
    if (method === "POST") {
      if (basePath === "/new") {
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
      if (basePath === "/edit") {
        const pathId = req.url.split("/")[2]; // get article ID from URL

        // check if article ID provided
        if (!pathId) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("Article ID is required");
          return;
        }
        // check if article exists
        try {
          fs.readFile(
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
      if (basePath === "/delete") {
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
        const article = await fs.readFile(
          path.join(__dirname, "article", `${articleId}.json`),
          "utf-8",
        );
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(JSON.parse(article).body);
      } else if (pathname.startsWith("/edit")) {
        const content = await fs.readFile(
          path.join(__dirname, "pages", "edit.html"),
          "utf-8",
        );
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      } else if (routes[pathname]) {
        const response = await routes[pathname]();
        if (pathname === "/") {
          const articles = await getAllArticles(
            path.join(__dirname, "article"),
          );
          const listHTML = articles.map((a) => `<p>${a.title}</p>`).join("");
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
  console.log(`Server is running on port ${port}: http://localhost:${port}`);
  console.log(`Press Cmd+C to quit the server.`);
});
