"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const constants_1 = require("./constants");
exports.dbConfig = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'lireddit',
    username: 'postgres',
    password: 'postgres',
    synchronize: !constants_1.__prod__,
    logging: !constants_1.__prod__,
    entities: ['dist/entities/**/*.js'],
    migrations: ['dist/migrations/**/*.js'],
    subscribers: ['dist/subscribers/**/*.js'],
    cli: {
        entitiesDir: 'src/entities',
        migrationsDir: 'src/migration',
        subscribersDir: 'src/subscriber',
    },
    seeds: ['src/seeds/**/*{.ts,.js}'],
};
//# sourceMappingURL=dbConfig.js.map