import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { isAuth } from '../middlewares/isAuth';
import { MyContext } from '../MyContext';

@ObjectType()
class PaginatedPostResponse {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext): Promise<User> {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Number, { nullable: true })
  async userVote(
    @Root() post: Post,
    @Ctx() { req, voteLoader }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) return null;

    const vote = await voteLoader.load({
      postId: post.id,
      voterId: req.session.userId,
    });
    return vote ? vote.value : null;
  }

  // Fetch paginated posts
  @Query(() => PaginatedPostResponse)
  async getPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    // @Ctx() { req }: MyContext
  ): Promise<PaginatedPostResponse> {
    const realLimit = Math.min(50, limit);

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC')
      .take(realLimit + 1);
    // .leftJoinAndSelect('p.creator', 'u', 'u.id = p.creatorId')
    // .leftJoinAndSelect('p.votes', 'v', 'v.postId = p.id');
    if (cursor) {
      qb.where('p.createdAt < :cursor', { cursor });
    }
    const posts = await qb.getMany();
    // posts.forEach((post) => post.getUserVote(req.session.userId));
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit + 1,
    };
  }

  // Fetch single post

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('postId') postId: string
    // @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOne({
      where: { id: postId },
      // relations: ['creator', 'votes'],
    });
    if (!post) return null;
    // post?.getUserVote(req.session.userId);
    return post;
  }

  // Create post

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

  // Upate post

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('postId') postId: string,
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOne(postId);
    if (!post) return null;
    if (post.creatorId !== req.session.userId) return null;
    if (post.title !== title) post.title = title;
    if (post.body !== body) post.body = body;
    await post.save();
    return post;
  }

  // Delete post

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
