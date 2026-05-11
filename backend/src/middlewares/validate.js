const { ValidationError } = require('../shared/errors/AppError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new ValidationError('Validation failed', errors));
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
        const errors = result.error.errors.map((err) => ({
          field: `${source}.${err.path.join('.')}`,
          message: err.message,
        }));
        allErrors.push(...errors);
      } else {
        req[source] = result.data;
      }
    }
    if (allErrors.length > 0) {
      return next(new ValidationError('Validation failed', allErrors));
    }
    next();
  };
};

module.exports = { validate, validateMultiple };
