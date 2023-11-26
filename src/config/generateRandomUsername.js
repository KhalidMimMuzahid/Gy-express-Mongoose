const generateRandomUsername = (firstName, lastName) => {
  // Generate a random number or string
  const randomSuffix = Math.random().toString(36).substring(2, 5);

  // Combine the first name, last name, and random suffix
  const username =
    firstName.toLowerCase() + lastName.toLowerCase() + randomSuffix;

  return username;
};
module.exports = generateRandomUsername;
