import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(req, res, next) {
  const headerId = req.headers['x-request-id'];
  const isValidUuid = headerId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(headerId);
  req.id = isValidUuid ? headerId : uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
}
