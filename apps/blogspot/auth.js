import crypto from "node:crypto";

let sessionToken = null;

export function createSession() {
    sessionToken = crypto.randomUUID();
    return sessionToken;
}

export function verifySession(token) {
    return token === sessionToken;
}

export function deleteSession() {
    sessionToken = null;
}

export function isAuthenticated(req) {
    const sessionCookie = req.headers.cookie;
    if (!sessionCookie) {
        return false;
    }
    const cookies = Object.fromEntries(sessionCookie.split("; ").map((cookie) => cookie.split("=", 2)));
    return cookies.sessionToken === sessionToken;
}

export const protectedRoutes = ["/admin", "/new", "/edit", "/delete"];