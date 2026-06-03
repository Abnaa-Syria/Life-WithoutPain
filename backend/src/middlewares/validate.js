const { ValidationError } = require('../shared/errors/AppError');
const { parseZodErrorMessage } = require('../i18n/zodErrorMap');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((err) => {
        const { messageKey, params } = parseZodErrorMessage(err.message);
        return {
          field: err.path.join('.'),
          messageKey,
          params,
        };
      });
      return next(new ValidationError('VALIDATION_ERROR', errors));
    }
    req[source] = result.data;
    next();
  };
};

const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];
    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const errors = result.error.errors.map((err) => {
          const { messageKey, params } = parseZodErrorMessage(err.message);
          return {
            field: `${source}.${err.path.join('.')}`,
            messageKey,
            params,
          };
        });
        allErrors.push(...errors);
      } else {
        req[source] = result.data;
      }
    }
    if (allErrors.length > 0) {
      return next(new ValidationError('VALIDATION_ERROR', allErrors));
    }
    next();
  };
};

module.exports = { validate, validateMultiple };
