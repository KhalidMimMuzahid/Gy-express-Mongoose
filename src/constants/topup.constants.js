const topUpPackageAmount = [
  30, 70, 100, 250, 500, 700, 1000, 1500, 2000, 5000, 10000,
];

const roiCommissionPercentage = {
  thirtyTo5Hundred: 0.31,
  sevenHundredTo2k: 0.36,
  fiveKToN: 0.4,
};

const levelCommissionPerCentage = {
  1: 0.15,
  2: 0.1,
  3: 0.05,
  4: 0.01,
  5: 0.01,
  6: 0.01,
  7: 0.01,
};

const rankRewardAmount = {
  SILVER: {
    rewardAmount: 40,
    directUsers: 5,
    level1Business: 1000,
    allLevelBusiness: 5000,
    position: 1,
  },
  GOLD: {
    rewardAmount: 90,
    directUsers: 10,
    level1Business: 2000,
    allLevelBusiness: 10000,
    position: 2,
  },
  RUBY: {
    rewardAmount: 150,
    directUsers: 15,
    level1Business: 4000,
    allLevelBusiness: 20000,
    position: 3,
  },
  DIAMOND: {
    rewardAmount: 500,
    directUsers: 20,
    level1Business: 8000,
    allLevelBusiness: 50000,
    position: 4
  },
  DIAMOND_CROWN: {
    rewardAmount: 900,
    directUsers: 25,
    level1Business: 16000,
    allLevelBusiness: 100000,
    position: 5
  },
};

const forbiddenDates = [
  "Dec 24",
  "Dec 25",
  "Dec 26",
  "Dec 27",
  "Dec 28",
  "Dec 29",
  "Dec 30",
  "Dec 31",
  "Jan 01",
  "Jan 02",
  "Jan 03",
];

module.exports = {
  topUpPackageAmount,
  roiCommissionPercentage,
  levelCommissionPerCentage,
  forbiddenDates,
  rankRewardAmount
};
