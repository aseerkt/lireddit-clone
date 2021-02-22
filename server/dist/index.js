"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("colors");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const constants_1 = require("./constants");
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const cors_1 = __importDefault(require("cors"));
const redisStore = connect_redis_1.default(express_session_1.default);
const redisClient = new ioredis_1.default();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection();
    const app = express_1.default();
    app.use(cors_1.default({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        secret: 'keyboard cat',
        store: new redisStore({ client: redisClient, disableTouch: true }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: constants_1.__prod__,
        },
    }));
    app.get('/', (_req, res) => res.send('LiReddit API running'));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({ resolvers: [__dirname + '/resolvers/*.js'] }),
        context: ({ req, res }) => ({ req, res, redis: redisClient }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(constants_1.PORT, () => {
        console.log(`API running on http://localhost:${constants_1.PORT}${apolloServer.graphqlPath}`.blue
            .bold);
    });
});
main().catch((error) => console.log(error));
//# sourceMappingURL=index.js.map