import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Vote } from '../entities/Vote';
import { isAuth } from '../middlewares/isAuth';
import { MyContext } from '../MyContext';

@Resolver()
export class VoteResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId') postId: string,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      // Check invalid input data
      if (![-1, 1].includes(value)) {
        console.log('invalid vote value');
        return false;
      }
      const post = await Post.findOne(postId);
      if (!post) {
        console.log('post not found');
        return false;
      }

      // Transaction Begins

      await getConnection().transaction(async (tem) => {
        let pointChange: number = 1;

        // Check if user already voted the post

        const doneVote = await tem.findOne(Vote, {
          where: { postId, voterId: req.session.userId },
        });
        if (doneVote) {
          if (doneVote.value === value) {
            await tem.remove(doneVote);
            if (value === 1) pointChange = -1;
            else pointChange = 1;
          } else {
            doneVote.value = value;
            await tem.save(doneVote);
            if (value === 1) pointChange = 2;
            else pointChange = -2;
          }
        } else {
          await tem
            .create(Vote, {
              voterId: req.session.userId,
              postId,
              value,
            })
            .save();
          pointChange = value;
        }

        post.points = post.points + pointChange;
        await tem.save(post);
      });
      return true;
    } catch (err) {
      if (err.code === '22P02') {
        console.log('invalid uuid in post id');
      } else console.log(err);
      return false;
    }
  }
}
