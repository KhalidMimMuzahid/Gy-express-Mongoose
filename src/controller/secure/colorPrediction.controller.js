const User = require("../../models/auth.model");
const ColorPrediction = require("../../models/colourPrediction ");
const ColorPredictionHistory = require("../../models/colourPredictionHistory");
const Wallet = require("../../models/wallet.model");
const getIstTime = require("../../config/getTime");
const ColorPredictionAll = require("../../models/colourPredictionAll");
const getUpdatePeriodHistoryArray = require("../../utils/getUpdatePeriodHistoryArray");
const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const ProidId = require("../../models/periodId.model");

const createColorPrediction = async (req, res) => {
  try {
    const {
      // color,
      // number,
      // box,
      // contractMoney,
      // contractCount,
      option,
      period,
      totalContractMoney,
    } = req.body;

    console.log({ bettingData: req.body });

    // res.json({ ok: 999 });

    const userId = req.auth;
    // console.log({ userId });
    // return;
    const wallet = await Wallet.findOne({ userId });

    console.log({ wallet });
    if (wallet.depositBalance >= Number(totalContractMoney)) {
      const colorPrediction = await ColorPrediction.create({
        userId: userId,
        option,
        period: period,
        totalContractMoney: totalContractMoney,
        date: new Date(getIstTime().date).toDateString(),
      });
      console.log({ colorPrediction });

      await ColorPredictionAll.create({
        colorPrediction_id: colorPrediction?._id,
        userId: userId,
        option,
        period: period,
        totalContractMoney: totalContractMoney,
        date: new Date(getIstTime().date).toDateString(),
      });

      const filter = { userId: userId };
      const update = {
        $inc: { depositBalance: -Number(totalContractMoney) },
      };
      const options = { new: true };
      await Wallet.findOneAndUpdate(filter, update, options);

      // console.log({ xxx });
      // return;
      const updatePeriodHistoryArray = getUpdatePeriodHistoryArray(
        option,
        totalContractMoney
      );

      const updateMultipleData = async (
        optionSelectedByUser,
        updatePeriodHistoryArray
      ) => {
        try {
          for (const eachData of updatePeriodHistoryArray) {
            // const { option, amount, priceCL } = eachData;
            let updateData = {
              amount: eachData?.amount,
              priceCL: eachData?.priceCL,
            };
            // const = { option, amount, priceCL }

            console.log({
              option: optionSelectedByUser,
              period,
              userId,
            });
            const isAlreadyBet = await ColorPrediction.find({
              option: optionSelectedByUser,
              period,
              userId,
            });
            console.log({ isAlreadyBet });
            console.log("updateData(before): ", updateData);
            if (isAlreadyBet?.length <= 1) {
              updateData.numberOfUser = 1;
            }
            console.log("updateData(after): ", updateData);
            // Use findOneAndUpdate to update the document based on the 'option'

            const { option, amount, priceCL } = eachData;

            const result = await ColorPredictionHistory.findOneAndUpdate(
              { option },
              {
                $inc: updateData,
              },
              { new: true }
            );

            // If the document with the specified 'option' does not exist, create a new one
            if (!result) {
              await ColorPredictionHistory.create({
                numberOfUser: 1,
                option,
                amount,
                priceCL,
              });
            }
          }

          console.log("Data updated successfully");
        } catch (error) {
          console.error("Error updating data:", error.message);
          throw error; // You can choose to handle or rethrow the error
        }
      };

      try {
        await updateMultipleData(option, updatePeriodHistoryArray);
        // Handle success
      } catch (error) {
        // Handle error

        console.log({ error });
      }

      res.status(201).json({
        message: "Color prediction saved successfully.",
        data: colorPrediction,
      });
    } else {
      return res.status(400).json({ message: "Insufficient Balance" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getColorPrediction = async (req, res) => {
  try {
    const userId = req.auth;
    const lastPeriod = await ProidId.findOne().sort({ updatedAt: -1 });
    const lastPeriodID = lastPeriod?.period;

    const allBetting = await ColorPredictionAll.find({
      userId,
      period: { $ne: lastPeriodID },
    }).sort({
      updatedAt: -1,
    });

    if (allBetting.length > 0) {
      return res.status(200).json({ data: allBetting });
    } else {
      return res.status(404).json({ message: "No Data Found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPeriodHistory = async (req, res) => {
  try {
    const { periodId } = req.body;
 console.log({periodId})
 console.log(req.body)
    // Fetch data from ColorPredictionAll collection
    const existPeriod = await ColorPredictionAll.find({
      period: periodId,
    }).sort({
      updatedAt: -1,
    });

    // Fetch data from ColorPredictionWinner collection
    const Winner = await ColorPredictionWinner.find({ period: periodId });

    // Combine the data from both collections
    const combinedData = [...existPeriod, ...Winner];

    // Remove duplicates based on the userId
    const uniqueData = Array.from(new Map(combinedData.map((item) => [item.userId, item])).values());

    console.log({ uniqueData });

    if (uniqueData.length > 0) {
      // Do something with the unique data
      res.status(200).json({ data: uniqueData });
    } else {
      res.status(404).json({ message: "No data found for the given periodId" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createColorPrediction,
  getColorPrediction,
  getPeriodHistory,
};
