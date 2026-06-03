/** Shared OpenAPI parameter and spec injection for Accept-Language (i18n). */

const ACCEPT_LANGUAGE_PARAM_REF = '#/components/parameters/AcceptLanguage';

const ACCEPT_LANGUAGE_PARAMETER = {
  in: 'header',
  name: 'Accept-Language',
  required: false,
  description:
    'Response locale for messages and localized catalog fields. Values: `ar`, `en`. ' +
    'This header takes precedence for the current request; `User.preferredLanguage` is used only when the header is omitted.',
  schema: {
    type: 'string',
    enum: ['ar', 'en'],
    default: 'ar',
  },
  example: 'ar',
};

function operationHasAcceptLanguage(parameters = []) {
  return parameters.some(
    (p) =>
      p?.name === 'Accept-Language' ||
      p?.$ref === ACCEPT_LANGUAGE_PARAM_REF,
  );
}

/**
 * Ensures every operation lists Accept-Language and components.parameters.AcceptLanguage exists.
 */
function injectAcceptLanguageParameter(spec) {
  if (!spec || typeof spec !== 'object') return spec;

  const paths = {};
  Object.entries(spec.paths || {}).forEach(([pathKey, methods]) => {
    paths[pathKey] = {};
    Object.entries(methods || {}).forEach(([method, operation]) => {
      if (!operation || typeof operation !== 'object') {
        paths[pathKey][method] = operation;
        return;
      }
      const existing = operation.parameters || [];
      paths[pathKey][method] = {
        ...operation,
        parameters: operationHasAcceptLanguage(existing)
          ? existing
          : [{ $ref: ACCEPT_LANGUAGE_PARAM_REF }, ...existing],
      };
    });
  });

  return {
    ...spec,
    paths,
    components: {
      ...(spec.components || {}),
      parameters: {
        ...(spec.components?.parameters || {}),
        AcceptLanguage: ACCEPT_LANGUAGE_PARAMETER,
      },
    },
  };
}

module.exports = {
  ACCEPT_LANGUAGE_PARAM_REF,
  ACCEPT_LANGUAGE_PARAMETER,
  injectAcceptLanguageParameter,
};
