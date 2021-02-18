import 'reflect-metadata';
import 'colors';
import { createConnection } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PORT } from './constants';

const main = async () => {
  await createConnection();

  const app = express();

  app.get('/', (_req, res) => res.send('LiReddit API running'));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [__dirname + '/resolvers/*.js'] }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(
      `API running on http://localhost:${PORT}${apolloServer.graphqlPath}`.blue
        .bold
    );
  });
};

main().catch((error) => console.log(error));
