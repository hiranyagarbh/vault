import { test, describe } from "node:test";
import assert from "node:assert";
import { buildHomeList, buildAdminList, buildPage } from "../template.js";

describe("buildPage", () => {
    const article = {
        id: "42",
        title: "Test Title",
        body: "Test Body Content",
        createdAt: "2024-03-15T10:30:00.000Z",
    };

    test("replaces all placeholders", () => {
        const template = "<h1>{{TITLE}}</h1><p>{{DATE}}</p><div>{{BODY}}</div><a href='/edit/{{ID}}'>Edit</a>";
        const result = buildPage(template, article);
        assert.strictEqual(result, "<h1>Test Title</h1><p>2024-03-15</p><div>Test Body Content</div><a href='/edit/42'>Edit</a>");
    });

    test("replaces multiple occurrences of same placeholder", () => {
        const template = "{{TITLE}} and {{TITLE}} again";
        const result = buildPage(template, article);
        assert.strictEqual(result, "Test Title and Test Title again");
    });

    test("returns template unchanged when no placeholders present", () => {
        const template = "<p>No placeholders here</p>";
        const result = buildPage(template, article);
        assert.strictEqual(result, "<p>No placeholders here</p>");
    });

    test("extracts date correctly from ISO string", () => {
        const template = "{{DATE}}";
        const result = buildPage(template, article);
        assert.strictEqual(result, "2024-03-15");
    });

    test("handles HTML in title and body (no escaping)", () => {
        const template = "{{TITLE}} {{BODY}}";
        const xssArticle = { ...article, title: "<script>alert(1)</script>", body: "<img onerror=alert(1)>" };
        const result = buildPage(template, xssArticle);
        assert.ok(result.includes("<script>"), "raw HTML passes through unescaped");
    });
});

describe("buildHomeList", () => {
    test("generates article links with correct href and title", () => {
        const articles = [{ id: "5", title: "My Post", shortDate: "2024-01-01" }];
        const result = buildHomeList(articles);
        assert.ok(result.includes('href="/article/5"'), "should link to /article/5");
        assert.ok(result.includes("My Post"), "should contain title");
        assert.ok(result.includes("2024-01-01"), "should contain date");
    });

    test("returns empty string for empty array", () => {
        const result = buildHomeList([]);
        assert.strictEqual(result, "");
    });

    test("renders multiple articles", () => {
        const articles = [
            { id: "1", title: "First", shortDate: "2024-01-01" },
            { id: "2", title: "Second", shortDate: "2024-02-01" },
            { id: "3", title: "Third", shortDate: "2024-03-01" },
        ];
        const result = buildHomeList(articles);
        assert.strictEqual((result.match(/class="article"/g) || []).length, 3, "should have 3 article divs");
        assert.ok(result.includes('href="/article/1"'));
        assert.ok(result.includes('href="/article/3"'));
    });

    test("wraps each article in div.article with h2 > a", () => {
        const articles = [{ id: "1", title: "Test", shortDate: "2024-01-01" }];
        const result = buildHomeList(articles);
        assert.ok(result.includes('<div class="article">'), "should have article div");
        assert.ok(result.includes("<h2>"), "should have h2");
        assert.ok(result.includes("</a></h2>"), "link should be inside h2");
    });
});

describe("buildAdminList", () => {
    test("generates table rows with edit link and delete form", () => {
        const articles = [{ id: "7", title: "Admin Post" }];
        const result = buildAdminList(articles);
        assert.ok(result.includes("<tr>"), "should have table row");
        assert.ok(result.includes('href="/edit/7"'), "should have edit link");
        assert.ok(result.includes('action="/delete/7"'), "should have delete form action");
        assert.ok(result.includes("Admin Post"), "should contain title");
    });

    test("returns empty string for empty array", () => {
        const result = buildAdminList([]);
        assert.strictEqual(result, "");
    });

    test("renders multiple rows", () => {
        const articles = [
            { id: "1", title: "A" },
            { id: "2", title: "B" },
        ];
        const result = buildAdminList(articles);
        assert.strictEqual((result.match(/<tr>/g) || []).length, 2, "should have 2 rows");
    });

    test("delete form uses POST method", () => {
        const articles = [{ id: "1", title: "X" }];
        const result = buildAdminList(articles);
        assert.ok(result.includes('method="POST"'), "delete should be POST");
    });

    test("delete button is a submit button", () => {
        const articles = [{ id: "1", title: "X" }];
        const result = buildAdminList(articles);
        assert.ok(result.includes('type="submit"'), "should have submit button");
        assert.ok(result.includes("Delete"), "button should say Delete");
    });
});