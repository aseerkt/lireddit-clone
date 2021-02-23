import DataLoader from 'dataloader';
import { User } from '../entities/User';

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    let userIdsToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdsToUser[user.id] = user;
    });

    return userIds.map((id) => userIdsToUser[id]);
  });
