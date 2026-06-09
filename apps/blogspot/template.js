import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderPage = async (fileName) => {
    const pages = {
        "/": "home.html",
        "/article": "article.html",
        "/admin": "admin.html",
        "/new": "new.html",
        "/edit": "edit.html",
        "/login": "login.html",
    };
    const content = await fs.readFile(path.join(__dirname, "pages", pages[fileName]), "utf-8");
    return content;
}

export function buildPage(template, article) {
    let page = template;
    page = page.replaceAll("{{TITLE}}", article.title);
    page = page.replaceAll("{{BODY}}", article.body);
    page = page.replaceAll("{{DATE}}", article.createdAt.split("T")[0]);
    page = page.replaceAll("{{ID}}", article.id);
    return page;
}

export function buildHomeList(articles) {
    const articleList = articles.map((article) => {
        return `
            <div class="article">
                <h2><a href="/article/${article.id}">${article.title}</a></h2>
                <p>${article.shortDate}</p>
            </div>
        `;
    }).join("");
    return articleList;
}

export function buildAdminList(articles) {
    const articleList = articles.map((article) => {
        return `<tr><td>${article.title}</td><td><a href="/edit/${article.id}">Edit</a> | <form method="POST" action="/delete/${article.id}"><button type="submit">Delete</button></form></td></tr>`;
    }).join("");
    return articleList;
}