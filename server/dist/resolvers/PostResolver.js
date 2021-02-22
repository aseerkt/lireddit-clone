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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const isAuth_1 = require("../middlewares/isAuth");
let PaginatedPostResponse = class PaginatedPostResponse {
};
__decorate([
    type_graphql_1.Field(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPostResponse.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedPostResponse.prototype, "hasMore", void 0);
PaginatedPostResponse = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPostResponse);
let PostResolver = class PostResolver {
    getPosts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const qb = typeorm_1.getConnection()
                .getRepository(Post_1.Post)
                .createQueryBuilder('p')
                .orderBy('p.createdAt', 'DESC')
                .take(realLimit + 1)
                .leftJoinAndSelect('p.creator', 'u', 'u.id = p.creatorId');
            if (cursor) {
                qb.where('p.createdAt < :cursor', { cursor });
            }
            const posts = yield qb.getMany();
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimit + 1,
            };
        });
    }
    post(postId) {
        return Post_1.Post.findOne({ where: { id: postId }, relations: ['creator'] });
    }
    createPost(title, body, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.create({
                title,
                body,
                creatorId: req.session.userId,
            }).save();
            post.reload();
            return true;
        });
    }
    updatePost(postId, title, body, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne(postId);
            if (!post)
                return false;
            if (post.creatorId !== req.session.userId)
                return false;
            if (post.title !== title)
                post.title = title;
            if (post.body !== body)
                post.body = body;
            yield post.save();
            return true;
        });
    }
    deletePost(postId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne(postId);
            if (!post)
                return false;
            if (post.creatorId !== req.session.userId)
                return false;
            yield post.remove();
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => PaginatedPostResponse),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPosts", null);
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('title')),
    __param(1, type_graphql_1.Arg('body')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId')),
    __param(1, type_graphql_1.Arg('title')),
    __param(2, type_graphql_1.Arg('body')),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver()
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=PostResolver.js.map