import { ConnectionOptions } from 'typeorm';
import { __prod__ } from './constants';

export const dbConfig: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'lireddit',
  username: 'postgres',
  password: 'postgres',
  synchronize: __prod__,
  logging: __prod__,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
