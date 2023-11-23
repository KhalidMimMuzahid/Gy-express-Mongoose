const STAKE_CONSTANT = {
  twelve: {
    duration: 12,
    percentage: 50,
  },
  twentyFour: {
    duration: 24,
    percentage: 110,
  },
  thirtySix: {
    duration: 36,
    percentage: 200,
  },
};

const MONTHS = [12, 24, 36];

const LEVEL_INCOME_PERCENTAGE = {
  1: 15,
  2: 10,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 2,
  8: 2,
  9: 2,
  10: 2,
  11: 4,
  12: 5
}

module.exports = { STAKE_CONSTANT, MONTHS, LEVEL_INCOME_PERCENTAGE };
