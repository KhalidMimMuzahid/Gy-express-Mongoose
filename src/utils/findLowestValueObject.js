function findLowestValueObject(array, fieldName) {
  if (array.length === 0) {
    return null;
  }

  // Find the minimum value of the specified field
  const minValue = Math.min(...array.map((obj) => obj[fieldName]));

  // Filter objects that have the minimum value
  const minObjects = array.filter((obj) => obj[fieldName] === minValue);
  console.log({ minObjects });
  // If there are multiple objects with the same lowest value, return a random one
  const randomIndex = Math.floor(Math.random() * minObjects.length);

  console.log({ randomIndex });
  return minObjects[randomIndex];
}
module.exports = findLowestValueObject;
