const { z } = require('zod');

const zodIssueToKey = {
  invalid_type: 'INVALID_TYPE',
  invalid_enum_value: 'INVALID_ENUM',
  invalid_string: 'INVALID_TYPE',
  too_small: (issue) => {
    if (issue.type === 'string') return 'STRING_MIN';
    if (issue.type === 'array') return 'ARRAY_MIN';
    return 'NUMBER_MIN';
  },
  too_big: (issue) => {
    if (issue.type === 'string') return 'STRING_MAX';
    if (issue.type === 'array') return 'ARRAY_MAX';
    return 'NUMBER_MAX';
  },
  invalid_date: 'INVALID_DATE',
  custom: 'REQUIRED',
};

function getMessageKey(issue) {
  if (issue.message && /^[A-Z][A-Z0-9_]+$/.test(issue.message)) {
    return issue.message;
  }
  const mapped = zodIssueToKey[issue.code];
  if (typeof mapped === 'function') return mapped(issue);
  return mapped || 'REQUIRED';
}

function getMessageParams(issue) {
  const params = {};
  if (issue.minimum != null) params.min = issue.minimum;
  if (issue.maximum != null) params.max = issue.maximum;
  return params;
}

const zodErrorMap = (issue, ctx) => {
  const messageKey = getMessageKey(issue);
  return { message: messageKey, params: getMessageParams(issue) };
};

function configureZodErrorMap() {
  z.setErrorMap((issue, ctx) => {
    const { message, params } = zodErrorMap(issue, ctx);
    return { message: JSON.stringify({ messageKey: message, params }) };
  });
}

function parseZodErrorMessage(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.messageKey) return parsed;
  } catch {
    // legacy plain string — treat as key if uppercase else REQUIRED
    if (/^[A-Z][A-Z0-9_]+$/.test(raw)) {
      return { messageKey: raw, params: {} };
    }
  }
  return { messageKey: 'REQUIRED', params: {} };
}

module.exports = {
  configureZodErrorMap,
  parseZodErrorMessage,
  getMessageKey,
  getMessageParams,
};
