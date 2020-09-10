import express from 'express';
import http from 'http';

import graphqlHTTP from 'express-graphql';
import cors from 'cors';
import schema from './api/schema';
import resolver from './api/graphQLResolver';
import LoggerService from './services/logger_service';

const bodyParser = require('body-parser');
const jwt = require('express-jwt');

const auth = jwt({
  secret: process.env.SECRET,
  credentialsRequired: false,
  algorithms: ['RS256']
});

const loggingMiddleware = (req: { ip: any; }, res: any, next: () => void) => {
  next();
};

const app = express();
app.use(loggingMiddleware);
app.use(cors());

app.use(
  '/graphql', bodyParser.json(), auth,
  graphqlHTTP((req: any) => ({
    context: {
      user: req.user,
    },

    schema,
    rootValue: resolver,
    graphiql: true,
  })),
);

const { PORT } = process.env;
const { NODE_ENV } = process.env;

const server = http.createServer(app);

const logger = new LoggerService('Server');
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}...`);
  logger.info(`Server address: ${server.address()}`);
  logger.info(`Env: ${NODE_ENV}`);
});

process.on('uncaughtException', (e) => {
  logger.error('uncaughtException', e);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  logger.error('unhandledRejection', e);
});
