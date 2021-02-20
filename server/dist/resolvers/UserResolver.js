"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResovler = void 0;
const argon2_1 = require("argon2");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const constants_1 = require("../constants");
const User_1 = require("../entities/User");
const types_1 = require("../types");
const extractErrors_1 = require("../utils/extractErrors");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
let RegisterArgs = class RegisterArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterArgs.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterArgs.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterArgs.prototype, "password", void 0);
RegisterArgs = __decorate([
    type_graphql_1.ArgsType()
], RegisterArgs);
let LoginArgs = class LoginArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], LoginArgs.prototype, "usernameOrEmail", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], LoginArgs.prototype, "password", void 0);
LoginArgs = __decorate([
    type_graphql_1.ArgsType()
], LoginArgs);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResovler = class UserResovler {
    me({ req }) {
        return User_1.User.findOne({ where: { id: req.session.userId } });
    }
    register({ email, username, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = new User_1.User({ email, username, password });
                const validationErrors = yield class_validator_1.validate(user);
                if (validationErrors.length > 0) {
                    return { errors: extractErrors_1.extractErrors(validationErrors) };
                }
                yield user.save();
                return { user };
            }
            catch (err) {
                let errors = [];
                console.log(err);
                if (err.code === '23505') {
                    if (err.detail.includes('email')) {
                        errors.push({ field: 'email', message: 'Email is already taken' });
                    }
                    if (err.detail.includes('username')) {
                        errors.push({
                            field: 'username',
                            message: 'Username is already taken',
                        });
                    }
                    return { errors };
                }
            }
            return {};
        });
    }
    login({ usernameOrEmail, password }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User_1.User.findOne({
                    where: usernameOrEmail.includes('@')
                        ? { email: usernameOrEmail }
                        : { username: usernameOrEmail },
                });
                if (!user) {
                    return {
                        errors: [
                            {
                                field: 'usernameOrEmail',
                                message: 'User does not exist, register to continue',
                            },
                        ],
                    };
                }
                const valid = yield argon2_1.verify(user === null || user === void 0 ? void 0 : user.password, password);
                if (!valid) {
                    return {
                        errors: [{ field: 'password', message: 'Incorrect Password' }],
                    };
                }
                req.session.userId = user.id;
                return { user };
            }
            catch (err) {
                console.log(err);
            }
            return {};
        });
    }
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                req.session.destroy((err) => {
                    if (err) {
                        console.log(err);
                        resolve(false);
                    }
                    res.clearCookie(constants_1.COOKIE_NAME);
                    resolve(true);
                });
            });
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ email });
            if (!user)
                return true;
            try {
                const token = uuid_1.v4();
                yield redis.set(constants_1.FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 3);
                const html = `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`;
                yield sendEmail_1.sendEmail(email, html);
                return true;
            }
            catch (err) {
                console.log(err);
            }
            return false;
        });
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length < 6) {
                return {
                    errors: [
                        {
                            field: 'newPassword',
                            message: 'Password must be 6 or more characters long',
                        },
                    ],
                };
            }
            const userId = yield redis.get(constants_1.FORGOT_PASSWORD_PREFIX + token);
            if (!userId)
                return { errors: [{ field: 'token', message: 'Token expired' }] };
            const user = yield User_1.User.findOne(userId);
            if (!user)
                return { errors: [{ field: 'token', message: 'Token expired' }] };
            user.password = yield argon2_1.hash(newPassword);
            yield user.save();
            yield redis.del(constants_1.FORGOT_PASSWORD_PREFIX + token);
            req.session.userId = user.id;
            return { user };
        });
    }
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResovler.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterArgs]),
    __metadata("design:returntype", Promise)
], UserResovler.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginArgs, Object]),
    __metadata("design:returntype", Promise)
], UserResovler.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResovler.prototype, "logout", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResovler.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('token')),
    __param(1, type_graphql_1.Arg('newPassword')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResovler.prototype, "changePassword", null);
UserResovler = __decorate([
    type_graphql_1.Resolver()
], UserResovler);
exports.UserResovler = UserResovler;
//# sourceMappingURL=UserResolver.js.map