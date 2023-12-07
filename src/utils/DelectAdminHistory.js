const ColorPredictionHistory = require("../models/colourPredictionHistory");

const DeleteAdminHistory = async () => {
  try {
    const updateResult = await ColorPredictionHistory.updateMany(
      {},
      { $set: { numberOfUser: 0, amount: 0 } }
    );

    console.log(`Updated ${updateResult.nModified} documents`);

    // Return any additional information if needed
    return updateResult;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

module.exports = DeleteAdminHistory;
