// Logs method, URL, status code, and response time for every request.

export default function requestLogger(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const color = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
        const reset = "\x1b[0m";

        console.log(`${color}${req.method} ${req.originalUrl} ${status}${reset} ${duration}ms`);
    });

    next();
}
