const requestLog = new Map();

function middleware(req, res, next) {
    const ip = req.ip;
    if (!requestLog.has(ip)) { requestLog.set(ip, []); }

    const requests = requestLog.get(ip);
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const maxRequests = 1000; // Maximum requests per hour

    const recentRequests = requests.filter(t => now - t < windowMs);

    if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
            error: "Too many requests",
            message: "Please try again later"
        });
    }

    recentRequests.push(now);
    requestLog.set(ip, recentRequests);

    next();
}

export default middleware;