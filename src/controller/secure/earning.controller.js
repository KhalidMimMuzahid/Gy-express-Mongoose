const LevelIncome = require("../../models/levelIncome.model");
const { RankIncome } = require("../../models/rankIncome.model");
const { PackageRoi } = require("../../models/topup.model")

const getLevelIncome = async (req, res) => {
    try {
        const [levelIncome] = await LevelIncome.aggregate([
            {
                $match: {
                    userId: req.auth.id
                }
            },
            {
                $group: {
                    _id: null,
                    totalLevelIncome: {
                        $sum: "$amount"
                    },
                    history: {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $sort: {
                    "history.createdAt": -1 // Sort in ascending order, use -1 for descending
                }
            },
        ])
        levelIncome.history.sort((a, b) => b.createdAt - a.createdAt);
        if (levelIncome) {
            return res.status(200).json({ data: levelIncome })
        }
    } catch (error) {
        return res.status(400).json({ message: "Something went wrong" })
    }
}
// Get ROI income
const getRoiIncome = async (req, res) => {
    try {
        const { history, userId, fullName, sponsorId, currentPackage, totalReturnedAmount, incomeDay } = await PackageRoi.findOne({ userId: req.auth.id })
        const data = {
            history: history.reverse(),
            userId,
            fullName,
            sponsorId,
            currentPackage,
            totalReturnedAmount,
            incomeDay
        }
        if (data) {
            return res.status(200).json({ data: data })
        }
    } catch (error) {
        return res.status(400).json({ message: "Something went wrong" })
    }
}
// Get Rank income
const getRankIncome = async (req, res) =>{
    try {
        const rankHistory = await RankIncome.find({userId: req.auth.id});
        if(rankHistory.length > 0){
            return res.status(200).json({data: rankHistory})
        }else{
            return res.status(400).json({message: "There is no Rank history"})
        }
    } catch (error) {
        return res.status(400).json({message: "Something went wrong"})
    }
}

module.exports = { getLevelIncome, getRoiIncome, getRankIncome}