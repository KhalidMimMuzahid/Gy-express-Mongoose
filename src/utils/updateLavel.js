const User = require("../models/auth.model");
const Level = require("../models/level.model");


const updateLevel = async (levelUser, user, levelNumber)=>{
    console.log(user, levelUser)
    const update = await Level.updateOne({userId: levelUser?.userId}, {
        $push: {
            level: {
                level: levelNumber,
                userId: user.userId,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                sponsorId: user.sponsorId,
                joiningDate: user.joiningDate,
                activationDate: user.activationDate
            },
        },
    });
    console.log({update})
    await User.updateOne({userId: levelUser.userId}, {
        $push: {
            team: {
                userId: user.userId,
                level: levelNumber
            }
        }
    });
}

module.exports = updateLevel;