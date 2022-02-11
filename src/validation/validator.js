function validate({
  name, value, type, required = true,
}) {
  if (value === undefined || value === null) {
    if (required) throw new TypeError(`${name} is missing`);

    return;
  }
  if (typeof value === 'string' && value === '') throw new TypeError(`${name} is missing`);

  // eslint-disable-next-line valid-typeof
  if ((type === 'object' && Array.isArray(value)) || typeof value !== type) {
    throw new TypeError(`${name} is not a ${type}: ${value}: ${typeof value}`);
  }
}

module.exports = {
  validate,
};
