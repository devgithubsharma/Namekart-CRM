let lastFetchedId = 0;

const getLastFetchedId = () => lastFetchedId;

const setLastFetchedId = (value) => {
  lastFetchedId = value;
};

module.exports = {
  getLastFetchedId,
  setLastFetchedId,
};
