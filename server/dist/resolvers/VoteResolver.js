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
exports.VoteResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const Vote_1 = require("../entities/Vote");
const isAuth_1 = require("../middlewares/isAuth");
let VoteResolver = class VoteResolver {
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (![-1, 1].includes(value)) {
                    console.log('invalid vote value');
                    return false;
                }
                const post = yield Post_1.Post.findOne(postId);
                if (!post) {
                    console.log('post not found');
                    return false;
                }
                yield typeorm_1.getConnection().transaction((tem) => __awaiter(this, void 0, void 0, function* () {
                    let pointChange = 1;
                    const doneVote = yield tem.findOne(Vote_1.Vote, {
                        where: { postId, voterId: req.session.userId },
                    });
                    if (doneVote) {
                        if (doneVote.value === value) {
                            yield tem.remove(doneVote);
                            if (value === 1)
                                pointChange = -1;
                            else
                                pointChange = 1;
                        }
                        else {
                            doneVote.value = value;
                            yield tem.save(doneVote);
                            if (value === 1)
                                pointChange = 2;
                            else
                                pointChange = -2;
                        }
                    }
                    else {
                        yield tem
                            .create(Vote_1.Vote, {
                            voterId: req.session.userId,
                            postId,
                            value,
                        })
                            .save();
                        pointChange = value;
                    }
                    post.points = post.points + pointChange;
                    yield tem.save(post);
                }));
                return true;
            }
            catch (err) {
                if (err.code === '22P02') {
                    console.log('invalid uuid in post id');
                }
                else
                    console.log(err);
                return false;
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId')),
    __param(1, type_graphql_1.Arg('value', () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "vote", null);
VoteResolver = __decorate([
    type_graphql_1.Resolver()
], VoteResolver);
exports.VoteResolver = VoteResolver;
//# sourceMappingURL=VoteResolver.js.map