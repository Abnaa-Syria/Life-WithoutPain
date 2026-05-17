/**
 * Normalize phone numbers to E.164-style +{country}{number} for storage and lookup.
 * Accepts: +966511111111, 966511111111, 0511111111, 511111111
 */
function normalizePhone(input) {
  if (input == null || input === '') return input;

  const trimmed = String(input).trim();
  if (trimmed.includes('@')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (digits.startsWith('966')) {
    return `+${digits}`;
  }

  if (digits.startsWith('05') && digits.length === 10) {
    return `+966${digits.slice(1)}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return `+966${digits}`;
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

module.exports = { normalizePhone };
