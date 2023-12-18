function findLowestValueObject(array, property) {
  // Check if the array is not empty
  if (array.length === 0) {
    return null; // Return null for an empty array
  }

  // Use reduce to find the object with the lowest value
  const lowestObject = array.reduce((lowest, current) => {
    return current[property] < lowest[property] ? current : lowest;
  });

  return lowestObject;
}
module.exports = findLowestValueObject;
