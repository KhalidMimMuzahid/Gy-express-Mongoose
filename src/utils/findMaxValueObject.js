function findMaxValueObject(array, property) {
  // Check if the array is not empty
  if (array.length === 0) {
    return null; // Return null for an empty array
  }

  // Use reduce to find the object with the maximum value
  const maxObject = array.reduce((max, current) => {
    return current[property] > max[property] ? current : max;
  });

  return maxObject;
}

module.exports = findMaxValueObject;
