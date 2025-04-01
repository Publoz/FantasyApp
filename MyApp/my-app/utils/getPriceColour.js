const getPriceColor = (price) => {
  if (price >= 30) {
    return 'red';
  } else if (price > 15) {
    return 'orange';
  } else {
    return 'green';
  }
};

export default getPriceColor