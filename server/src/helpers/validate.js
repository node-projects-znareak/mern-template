const { validationError } = require("@helpers/httpResponses");

/**
 * Validate the payload with Yup
 * @param {Object} schema The Yup schema object
 * @param {*} dataToValidate The data for validate with the `schema`
 * @returns express widdleware to validate the schema
 */
module.exports = function validate(schema) {
  return async (req, res, next) => {
    try {
      if (typeof schema.validate !== "function")
        return next("The `schema` params is not a yup schema object");

      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
        files: req.files,
      });

      next();
    } catch (err) {
      validationError(res, err);
    }
  };
};
