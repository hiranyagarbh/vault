import fs from "node:fs/promises";
import path from "node:path";

export async function getAllArticles(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        const titlePromises = files.map(async (file) => {
            const filePath = path.join(folderPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                const content = await fs.readFile(filePath, "utf-8");
                const id = path.parse(filePath).name;
                const { title, createdAt } = JSON.parse(content);
                const shortDate = createdAt.split("T")[0];
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

export async function getArticle(folderPath, id) {
    try {
        const content = await fs.readFile(path.join(folderPath, `${id}.json`), "utf-8");
        const { title, body, createdAt, updatedAt } = JSON.parse(content);
        return { id, title, body, createdAt, updatedAt };
    } catch (e) {
        return null;
    }
}

export async function createArticle(folderPath, { title, body }) {
    const files = await fs.readdir(folderPath);
    const ids = files.map((f) => parseInt(path.parse(f).name));
    const newArticleId = ids.length ? Math.max(...ids) + 1 : 1;
    const newContent = JSON.stringify({
        title: title,
        body: body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    await fs.writeFile(path.join(folderPath, `${newArticleId}.json`), newContent, "utf-8");
    return newArticleId;
}

export async function updateArticle(folderPath, id, { title, body }) {
    const content = await fs.readFile(path.join(folderPath, `${id}.json`), "utf-8");
    const { createdAt } = JSON.parse(content);
    const newContent = JSON.stringify({
        title: title,
        body: body,
        createdAt: createdAt,
        updatedAt: new Date().toISOString(),
    });
    await fs.writeFile(path.join(folderPath, `${id}.json`), newContent, "utf-8");
    return true;
}

export async function deleteArticle(folderPath, id) {
    try {
        await fs.unlink(path.join(folderPath, `${id}.json`));
        return true;
    } catch (e) {
        return false;
    }
}