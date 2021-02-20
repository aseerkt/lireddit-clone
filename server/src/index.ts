import 'reflect-metadata';
import 'colors';
import { createConnection } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, PORT, __prod__ } from './constants';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import cors from 'cors';

const redisStore = connectRedis(session);
const redisClient = new Redis();

const main = async () => {
  await createConnection();

  const app = express();
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      secret: 'keyboard cat',
      store: new redisStore({ client: redisClient, disableTouch: true }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        secure: __prod__,
      },
    })
  );

  app.get('/', (_req, res) => res.send('LiReddit API running'));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [__dirname + '/resolvers/*.js'] }),
    context: ({ req, res }) => ({ req, res, redis: redisClient }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () => {
    console.log(
      `API running on http://localhost:${PORT}${apolloServer.graphqlPath}`.blue
        .bold
    );
  });
};

main().catch((error) => console.log(error));
