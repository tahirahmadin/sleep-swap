import BigNumber from "bignumber.js";

export const fromWei = (tokens, decimals = 18) => {
  try {
    if (!tokens) {
      return new BigNumber(0).toString();
    }

    return new BigNumber(tokens)
      .div(new BigNumber(10).exponentiatedBy(decimals))
      .toString();
  } catch (error) {
    console.log("exeption in fromWei ", error);
    return null;
  }
};

export const toWei = (tokens, decimals = 18) => {
  try {
    if (!tokens) {
      return new BigNumber(0).toString();
    }
    return new BigNumber(tokens)
      .multipliedBy(new BigNumber(10).exponentiatedBy(decimals))
      .toFixed(0)
      .toString();
  } catch (error) {
    console.log("exeption in toWei , ", error);
    return null;
  }
};

export const formatCurrency = (value, precision = 1) => {
  if (!value) {
    return "0";
  }

  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  return formatter.format(value)?.slice(3);
};
