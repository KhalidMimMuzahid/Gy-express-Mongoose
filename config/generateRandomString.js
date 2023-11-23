const { v4: uuid_v4 } = require("uuid");

const generateString = (length) => {
  let result = uuid_v4();

  return result.trim();
};

module.exports = generateString;
