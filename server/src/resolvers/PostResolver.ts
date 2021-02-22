import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middlewares/isAuth';
import { MyContext } from '../MyContext';

@ObjectType()
class PaginatedPostResponse {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver()
export class PostResolver {
  @Query(() => PaginatedPostResponse)
  async getPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPostResponse> {
    const realLimit = Math.min(50, limit);
    // return Post.find({
    //   relations: ['creator'],
    //   order: { createdAt: 'DESC' },
    //   take: realLimit,
    // });
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC')
      .take(realLimit + 1)
      .leftJoinAndSelect('p.creator', 'u', 'u.id = p.creatorId');
    if (cursor) {
      qb.where('p.createdAt < :cursor', { cursor });
    }
    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('postId') postId: string) {
    return Post.findOne({ where: { id: postId }, relations: ['creator'] });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const post = await Post.create({
      title,
      body,
      creatorId: req.session.userId,
    }).save();
    post.reload();
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('postId') postId: string,
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(postId);
    if (!post) return false;
    if (post.creatorId !== req.session.userId) return false;
    if (post.title !== title) post.title = title;
    if (post.body !== body) post.body = body;
    await post.save();
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('postId') postId: string,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(postId);
    if (!post) return false;
    if (post.creatorId !== req.session.userId) return false;
    await post.remove();
    return true;
  }
}
