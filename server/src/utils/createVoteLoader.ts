import DataLoader from 'dataloader';
import { Vote } from '../entities/Vote';

export const createVoteLoader = () =>
  new DataLoader<{ postId: string; voterId: number }, Vote | null>(
    async (keys) => {
      // return await Vote.findByIds(keys as any);
      const votes = await Vote.findByIds(keys as any);
      const voteIdsToVote: Record<string, Vote> = {};
      votes.forEach((vote) => {
        voteIdsToVote[`${vote.voterId}|${vote.postId}`] = vote;
      });

      return keys.map((key) => voteIdsToVote[`${key.voterId}|${key.postId}`]);
    }
  );
