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
  const cleanedHexString = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;

  if (
    typeof hexString !== "string" ||
    !/^[0-9a-fA-F]+$/.test(cleanedHexString)
  ) {
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

const isCastId = (data, key) => {
  const castId = data[key];

  if (
    typeof castId !== "object" ||
    castId === null ||
    typeof castId.fid !== "number" ||
    typeof castId.hash !== "string" ||
    !/^[0-9a-fA-F]+$/.test(castId.hash)
  ) {
    return {
      isValid: false,
      error:
        "Invalid input. Expected an object with 'fid' and 'hash' keys for castId.",
    };
  }

  return { isValid: true };
};

module.exports = {
  isNumber,
  isHexString,
  isString,
  isByteArray,
  isCastId,
};
