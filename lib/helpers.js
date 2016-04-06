// Wrapper string value as Array
// Using defaultValue instead if value is not presented
exports.arrayify = function arrayify(value, defaultValue) {
  if (!value && !defaultValue) {
    throw new Error('either value or defaultValue must be provided.');
  }

  return value ?
    (Array.isArray(value) ? value : [value]) :
    (arrayify(defaultValue)  || []);
};
