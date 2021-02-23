import { hash } from 'argon2';
import { Connection } from 'typeorm';
import { Seeder } from 'typeorm-seeding';
import fakePostData from '../data/postData.json';
import fakeUserData from '../data/userData.json';
import { Post } from '../entities/Post';
import { User } from '../entities/User';

let hashedUserData: typeof fakeUserData = [];

fakeUserData.forEach(async (user) => {
  hashedUserData.push({ ...user, password: await hash(user.password) });
});

export default class CreateMockData implements Seeder {
  public async run(_: any, connection: Connection): Promise<any> {
    await connection.dropDatabase();
    await connection.synchronize();

    // Add User Mock Data to DB
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(hashedUserData)
      .execute();

    // Add Post Mock Data to DB
    await connection
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values(fakePostData)
      .execute();
  }
}
