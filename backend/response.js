/**
 * Centralised response helpers.
 * Ensures every API response follows a consistent envelope shape.
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403);
};

export const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, message, 400, errors);
};

export const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
