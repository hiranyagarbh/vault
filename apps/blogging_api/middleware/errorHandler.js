export default function errorHandler(err, req, res, next) {

  if (!(err instanceof Error)) err = new Error(String(err))

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error occurred:', err.stack);

  if (err.code === '23505') { return res.status(400).json({ error: 'Record already exists' }); }
  if (err.code === '42P01') { return res.status(500).json({ error: 'Internal server error' }); }
  if (err.code === '22P02') { return res.status(400).json({ error: 'Invalid input' }); }
  if (err.code === '23502' || err.code === '23503') { return res.status(500).json({ error: 'Internal server error' }); }

  res.status(statusCode).json({ error: message });
}