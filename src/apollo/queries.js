import { client } from "./client";
import gql from "graphql-tag";

export const getUserActivities = async (account, page = 1) => {
  const items = page * 10;
  const skips = page * 10 - 10;

  try {
    const queryObj = `
      query {
        userActivities(orderBy: timestamp, orderDirection: desc first: ${items}, skip: ${skips}, where: {
            userAddress: "${account}"
          } ) {
            id
            type
            atPrice
            userAddress
            tokenAmount
            ethAmount
            timestamp
            blockNumber
          }
       }
      `;

    const res = await client?.query({ query: gql(queryObj) });
    console.log("graph response ", res.data);
    return res.data;
  } catch (error) {
    console.log("getUserActivities", error);
    return [];
  }
};
