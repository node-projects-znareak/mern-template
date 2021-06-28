const { error } = require("../helpers/httpResponses");
const { validateLogin, validateRegister } = require("../helpers/validations");

function validateBody(res, shema, payload) {
  const isInvalidPayload = shema.validate(payload).error;
  if (isInvalidPayload) {
    return error(res, isInvalidPayload.details[0].message);
  }
  return true;
}

function validateLoginBody(req, res, next) {
  const { email, password } = req.body;
  const isValid = validateBody(res, validateLogin, { email, password });
  isValid && next();
}

function validateRegisterBody(req, res, next) {
   const { email, password, name } = req.body;
   const isValid = validateBody(res, validateRegister, { email, password, name });
   isValid && next();
 }

module.exports = { validateLoginBody, validateRegisterBody };
