import express from 'express';
import http from "http";
const bodyParser = require('body-parser')

import graphqlHTTP from 'express-graphql';
import cors from 'cors'
import schema from './api/schema'
import resolver from './api/resolvers'
import { isContext } from 'vm';
const jwt = require('express-jwt')

const auth = jwt({
  secret: process.env.SECRET,
  credentialsRequired: false
})

const loggingMiddleware = (req: { ip: any; }, res: any, next: () => void) => {
  console.log('ip:', req.ip);
  next();
}

const app = express();
app.use(loggingMiddleware);
app.use(cors())

app.use(
  '/graphql', bodyParser.json(), auth,
  graphqlHTTP((req:any)=>({
    context: {
      user: req.user
    },
    schema: schema,
    rootValue: resolver,
    graphiql: true,
    

  })),
);



const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE = process.env.MONGODB_DATABASE

const server = http.createServer(app);
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







