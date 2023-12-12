const User = require("../../models/auth.model");
const ColorPrediction = require("../../models/colourPrediction ");
const ColorPredictionHistory = require("../../models/colourPredictionHistory");
const Wallet = require("../../models/wallet.model");
const getIstTime = require("../../config/getTime");
const ColorPredictionAll = require("../../models/colourPredictionAll");
const createColorPrediction = async (req, res) => {
  try {
    const {
      color,
      number,
      contractMoney,
      period,
      box,
      contractCount,
      totalContractMoney,
    } = req.body;
    const userId = req.auth;
    console.log({ userId });
    const user = await User.findOne({ userId: userId });
    console.log({ user });
    const wallet = await Wallet.findOne({ userId });
    if (wallet.depositBalance >= Number(totalContractMoney)) {
      const colorPrediction = await ColorPrediction.create({
        userId: userId,
        fullName: user.fullName,
        color: color,
        number: number,
        box: box,
        period: period,
        contractMoney: contractMoney,
        contractCount: contractCount,
        totalContractMoney: totalContractMoney,
        date: new Date(getIstTime().date).toDateString(),
      });
      await ColorPredictionAll.create({
        userId: userId,
        fullName: user.fullName,
        color: color,
        box: box,
        number: number,
        period: period,
        contractMoney: contractMoney,
        contractCount: contractCount,
        totalContractMoney: totalContractMoney,
        date: new Date(getIstTime().date).toDateString(),
      });
      const filter = { userId: userId };
      const update = {
        $inc: { depositBalance: -Number(totalContractMoney) },
      };
      const options = { new: true };
      const investmentWallet = await Wallet.findOneAndUpdate(
        filter,
        update,
        options
      );
      // calculatePriceCL(color, number, box, totalContractMoney);
      // function calculatePriceCL(color, number, box, totalContractMoney) {
      //  if(number === 0){
      //   if(box === 0){
      //     return totalContractMoney * 9;
      //   } else if (number ===  )
      //  }

      let payout = 0;
      if (color === "green") {
        if (box === 0) {
          payout = totalContractMoney * 9;
        } else if ([1, 3, 7, 9].includes(number)) {
          payout = totalContractMoney * 2;
        } else if (number === 5) {
          payout = totalContractMoney * 1.5;
        }
      } else if (color === "red") {
        if (box === number) {
          payout = totalContractMoney * 9;
        } else if ([2, 4, 6, 8].includes(number)) {
          payout = totalContractMoney * 2;
        } else if (number === 0) {
          payout = totalContractMoney * 1.5;
        }
      } else if (color === "violet") {
        if (box === number) {
          payout = totalContractMoney * 9;
        } else if ([0, 5].includes(number)) {
          payout = totalContractMoney * 4.5;
        }
      } else if (color === "red-violet") {
        if (box === number) {
          payout = totalContractMoney * 9;
        } else if ([0, 5].includes(number)) {
          payout = totalContractMoney * 1.5;
        }
      } else if (color === "green-violet") {
        if (box === number) {
          payout = totalContractMoney * 9;
        } else if ([0, 5].includes(number)) {
          payout = totalContractMoney * 1.5;
        }
      }
      // else if (number === number) {
      //   payout = bet.contractMoney * 9;
      // }
      // }
      console.log({ payout });
      // await ColorPredictionHistory.findOneAndUpdate(
      //   { $or: [{ color: color }, { number: number }] },
      //   {
      //     $inc: {
      //       numberOfUser: contractCount,
      //       amount: totalContractMoney,
      //       priceCL: payout,
      //     },
      //   },
      //   { new: true }
      // );
      const history = await ColorPredictionHistory.findOne({
        $and: [{ color: color }, { number: number }],
      });
      if (history) {
        await ColorPredictionHistory.findOneAndUpdate(
          { $and: [{ color: color }, { number: number }] },
          {
            $inc: {
              numberOfUser: contractCount,
              amount: totalContractMoney,
              priceCL: payout,
            },
          },
          { new: true }
        );
      } else {
        await ColorPredictionHistory.create({
          period: period,
          color: color,
          number: number,
          numberOfUser: contractCount,
          amount: totalContractMoney,
          priceCL: payout,
        });
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
    const allBetting = await ColorPredictionAll.find({ userId }).sort({
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

module.exports = { createColorPrediction, getColorPrediction };
