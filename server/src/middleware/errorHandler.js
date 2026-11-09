import { errorResponse } from '../utils/response.js';
import config from '../config/index.js';

export function notFoundHandler(req, res) {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
}

export function globalErrorHandler(err, req, res, _next) {
  if (config.nodeEnv === 'development') {
    console.error('Unhandled Server Error:', err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(
    res,
    message,
    statusCode,
    config.nodeEnv === 'development' ? err.stack : undefined
  );
}
