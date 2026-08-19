import { ValidationError } from '../errors/index.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        return next(new ValidationError('Validation failed', details));
      }

      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateBody(schema) {
  return validate(schema, 'body');
}

export function validateParams(schema) {
  return validate(schema, 'params');
}

export function validateQuery(schema) {
  return validate(schema, 'query');
}
