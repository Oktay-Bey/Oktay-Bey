export function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    error: message,
    ...(details ? { details } : {}),
  });
}
