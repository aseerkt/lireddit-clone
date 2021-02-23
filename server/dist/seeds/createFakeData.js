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
const argon2_1 = require("argon2");
const postData_json_1 = __importDefault(require("../data/postData.json"));
const userData_json_1 = __importDefault(require("../data/userData.json"));
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
let hashedUserData = [];
userData_json_1.default.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
    hashedUserData.push(Object.assign(Object.assign({}, user), { password: yield argon2_1.hash(user.password) }));
}));
class CreateMockData {
    run(_, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection.dropDatabase();
            yield connection.synchronize();
            yield connection
                .createQueryBuilder()
                .insert()
                .into(User_1.User)
                .values(hashedUserData)
                .execute();
            yield connection
                .createQueryBuilder()
                .insert()
                .into(Post_1.Post)
                .values(postData_json_1.default)
                .execute();
        });
    }
}
exports.default = CreateMockData;
//# sourceMappingURL=createFakeData.js.map