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
  "/": () => renderPage("/"),
  "/article": () => renderPage("/article"),
  "/admin": () => renderPage("/admin"),
  "/new": () => renderPage("/new"),
  "/edit": () => renderPage("/edit"),
  "/login": () => renderPage("/login"),
};

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const pathId = pathname.split("/")[2];

  try {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        const parsed = querystring.parse(body);
        try {
          const content = await fs.promises.readFile(
            path.join(__dirname, "article", `${pathId}.json`),
            "utf-8",
          );
          const updatedContent = JSON.stringify({
            title: parsed.title,
            date: new Date().toISOString(),
            body: content,
          });
          await fs.promises.writeFile(
            path.join(__dirname, "article", `${pathId}.json`),
            updatedContent,
            "utf-8",
          );
          res.writeHead(302, { "Content-Type": "text/html", Location: "/" }); // redirect to home
          res.end();
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
