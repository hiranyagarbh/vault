export default function errorHandler(err, req, res, next) {

    if (!(err instanceof Error)) err = new Error(String(err))

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error('Error occurred:', err.stack);

    res.status(statusCode).json({ error: message });
}