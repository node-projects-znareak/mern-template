/**
 * Sends a validation error response.
 * @param {Object} res - The response object.
 * @param {Object} data - The error data.
 */
function validationError(res, data) {
  res.status(400).json({
    ok: false,
    error: data.name || "Validation Error",
    data: data.errors || data.message || data,
    statusCode: 400,
  });
}

/**
 * Sends an error response.
 * @param {Object} res - The response object.
 * @param {string|Object} [data="An error occurred while processing the request"] - The error data.
 * @param {number} [statusCode=400] - The HTTP status code.
 */
function error(res, data = "An error occurred while processing the request", statusCode = 400) {
  res.status(statusCode).json({
    ok: false,
    error: true,
    data,
    statusCode,
  });
}

/**
 * Sends a success response.
 * @param {Object} res - The response object.
 * @param {string|Object} [data="The request processed successfully"] - The success data.
 * @param {number} [statusCode=200] - The HTTP status code.
 */
function success(res, data = "The request processed successfully", statusCode = 200) {
  res.status(statusCode).json({
    ok: true,
    error: false,
    data,
    statusCode,
  });
}

module.exports = {
  validationError,
  success,
  error,
};
