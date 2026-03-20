import { validationResult } from 'express-validator';
import { sendBadRequest } from './response.js';

/**
 * Reads express-validator results and short-circuits the request
 * with a 400 response if any validation errors are found.
 *
 * Attach AFTER your validator chain in a route definition:
 *   router.post('/path', [...validators], validate, controller)
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return sendBadRequest(res, 'Validation failed', formatted);
  }
  next();
};
