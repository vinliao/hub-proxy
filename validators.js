const isNumber = (data, key) => {
  const number = data[key];

  if (typeof number !== "number") {
    return {
      isValid: false,
      error: `Invalid input. Expected a number for ${key}.`,
    };
  }

  return { isValid: true };
};

const isHexString = (data, key) => {
  const hexString = data[key];

  if (typeof hexString !== "string" || !/^[0-9a-fA-F]+$/.test(hexString)) {
    return {
      isValid: false,
      error: `Invalid input. Expected a hex string for ${key}.`,
    };
  }

  return { isValid: true };
};

const isString = (data, key) => {
  const stringValue = data[key];

  if (typeof stringValue !== "string") {
    return {
      isValid: false,
      error: `Invalid input. Expected a string for ${key}.`,
    };
  }

  return { isValid: true };
};

const isByteArray = (data, key) => {
  const input = data[key];

  if (!Array.isArray(input) || !input.every(Number.isInteger)) {
    return {
      isValid: false,
      error: `Invalid input. Expected an array of bytes for ${key}.`,
    };
  }

  return { isValid: true };
};

module.exports = {
  isNumber,
  isHexString,
  isString,
  isByteArray,
};
