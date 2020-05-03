import express from 'express';
import http from "http";

import graphqlHTTP from 'express-graphql';
import cors from 'cors'
import schema from './api/schema'
import resolver from './api/resolvers'


const router = express();
router.use(cors())
router.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
  }),
);


const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE = process.env.MONGODB_DATABASE

const server = http.createServer(router);



server.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}...`);
  console.log(`Server address: ${server.address()}`)
  console.log(`Env: ${NODE_ENV}`);
  console.log(`Database: ${DATABASE}`);
}
);

process.on("uncaughtException", e => {
  console.log(e);
  process.exit(1);
});

process.on("unhandledRejection", e => {
  console.log(e);
  process.exit(1);
});







