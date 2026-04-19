const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diff = toDate.setHours(0, 0, 0, 0) - fromDate.setHours(0, 0, 0, 0);
  return Math.ceil(diff / MS_PER_DAY);
};

module.exports = { daysBetween };
