function findObjectFromArrayOfObject(arrayOfObjects, fieldName, fieldValue) {
  for (let i = 0; i < arrayOfObjects.length; i++) {
    if (arrayOfObjects[i][fieldName] === fieldValue) {
      return arrayOfObjects[i];
    }
  }
  // Return null if no matching object is found
  return null;
}

module.exports = findObjectFromArrayOfObject;
