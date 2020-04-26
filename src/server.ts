import http from "http";
import express from "express";
import { applyMiddleware, applyRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";

var cors = require('cors')

process.on("uncaughtException", e => {
  console.log(e);
  process.exit(1);
});

process.on("unhandledRejection", e => {
  console.log(e);
  process.exit(1);
});

const router = express();
router.use(cors())

applyMiddleware(middleware, router);
applyRoutes(router);
applyMiddleware(errorHandlers, router);

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV ;
const DATABASE = process.env.MONGODB_DATABASE

const server = http.createServer(router);

server.listen(PORT, () =>
  {

    console.log(`Server is running on port ${PORT}...`);
    console.log(`Server address: ${server.address()}`)
    console.log(`Env: ${NODE_ENV}`);
    console.log(`Database: ${DATABASE}`);
  }
);