import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import querystring from "node:querystring";
// import { url } from "node:inspector/promises";

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
  const content = await fs.promises.readFile(
    path.join(__dirname, "pages", pages[fileName]),
    "utf-8",
  );
  return { status: 200, data: content };
};

const routes = {
  "/": () => renderPage("home.html"),
  "/article": () => renderPage("article.html"),
  "/admin": () => renderPage("admin.html"),
  "/new": () => renderPage("new.html"),
  "/edit": () => renderPage("edit.html"),
  "/login": () => renderPage("login.html"),
};

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const pathId = pathname.split("/")[2];

  try {
    if (routes[pathname]) {
      const route = routes[pathname];
      const response = await route(pathId);
      res.writeHead(response.status, { "Content-Type": "text/html" });
      res.end(response.data);
    } else if (pathname === "new" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        const parsed = querystring.parse(body);
        try {
          const homePath = path.join(__dirname, "pages", "home.html");
          const content = await fs.promises.readFile(homePath, "utf-8");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        } catch (templateError) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(templateError.message);
        }
      });
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
