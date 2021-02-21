import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { isAuth } from '../middlewares/isAuth';
import { MyContext } from '../MyContext';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return Post.find({ relations: ['creator'] });
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
