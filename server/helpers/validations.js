const Joi = require("@hapi/joi");

const email = Joi.string()
  .email({ minDomainSegments: 2 })
  .min(5)
  .max(30)
  .required()
  .messages({
    "string.email": `No es un correo válido, un correo válido tiene la forma: name@domain.tld `,
    "string.empty": `El correo no puede estar vacío`,
    "string.min": `El correo debe tener un mínimo de {#limit} caracteres`,
    "string.max": `El correo debe tener un máximo de {#limit} caracteres`,
  });

const password = Joi.string()
  .min(6)
  .max(16)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
  .required()
  .messages({
    "string.pattern.base": `La clave debe tener letras mayúsculas, minúsculas y números`,
    "string.empty": `La clave no puede estar vacía`,
    "string.min": `La clave debe tener un mínimo de {#limit} caracteres`,
    "string.max": `La clave debe tener un máximo de {#limit} caracteres`,
  });

const name = Joi.string()
  .min(4)
  .max(16)
  .pattern(/^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/)
  .required()
  .messages({
    "string.pattern.base": `El nombre de usuario debe ser letras, números y guiones (_-)`,
    "string.empty": `El nombre de usuario no debe estar vacío`,
    "string.min": `El nombre de usuario debe tener un mínimo de {#limit} caracteres`,
    "string.max": `El nombre de usuario debe tener un máximo de {#limit} caracteres`,
  });

const validateLogin = Joi.object({ email, password });
const validateRegister = Joi.object({ name, email, password });

module.exports = {
  email,
  password,
  validateLogin,
  validateRegister,
};
