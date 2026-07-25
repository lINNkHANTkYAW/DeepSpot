import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
