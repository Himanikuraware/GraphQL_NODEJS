const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type TestData {
        text: String!
        views: Int!
   }
   type RootQuery {
        hello: TestData!
   }
   schema {
        query: RootQuery
   }
`);

//! before String will make that string required.
