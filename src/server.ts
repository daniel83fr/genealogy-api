import express from 'express';
import http from 'http';

import graphqlHTTP from 'express-graphql';
import cors from 'cors';
import schema from './api/schema';
import resolver from './api/graphQLResolver';
import LoggerService from './services/logger_service';
import Scrapper from './services/scrapper';

const bodyParser = require('body-parser');
const jwt = require('express-jwt');

const auth = jwt({
  secret: process.env.SECRET,
  credentialsRequired: false,
});

const loggingMiddleware = (req: { ip: any; }, res: any, next: () => void) => {
  console.log('ip:', req.ip);
  next();
};

const app = express();
app.use(loggingMiddleware);
app.use(cors());



app.get('/scrapper', (req: any, res: any) => {
  const scrapper = new Scrapper();
  res.send({'error': 'you should not be here'});
  //var res1 = scrapper.BuildCsv();
  //scrapper.Scrap('https://www.geni.com/api/profile-92995219');
 // res.send(res1);
});

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
const DATABASE = process.env.MONGODB_DATABASE;

const server = http.createServer(app);



const logger = new LoggerService('Server');
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}...`);
  logger.info(`Server address: ${server.address()}`);
  logger.info(`Env: ${NODE_ENV}`);
  logger.info(`Database: ${DATABASE}`);
});

process.on('uncaughtException', (e) => {
  logger.error('uncaughtException', e);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  logger.error('unhandledRejection', e);
});


