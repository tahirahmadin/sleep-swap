import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/id/QmWFnFZsdUAg4royCGuM2rsu6SVXGTEBmJcLVorD977d9k",
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});
