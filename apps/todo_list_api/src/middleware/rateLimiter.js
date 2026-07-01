const requestLog = new Map();

const WINDOW_MS = 60 * 60 * 1000;
export const MAX_REQUESTS = 1000;

function rateLimiter(req, res, next) {
    const ip = req.ip;
    if (!requestLog.has(ip)) { requestLog.set(ip, []); }

    const requests = requestLog.get(ip);
    const now = Date.now();

    const recentRequests = requests.filter(t => now - t < WINDOW_MS);

    if (recentRequests.length >= MAX_REQUESTS) {
        return res.status(429).json({
            error: "Too many requests",
            message: "Please try again later"
        });
    }

    recentRequests.push(now);
    requestLog.set(ip, recentRequests);

    next();
}

export function resetRequestLog() { requestLog.clear(); }

export default rateLimiter;