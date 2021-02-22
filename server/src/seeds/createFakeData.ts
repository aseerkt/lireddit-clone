import { Connection } from 'typeorm';
import { Seeder } from 'typeorm-seeding';
import fakePostData from '../data/MOCK_DATA.json';
import { Post } from '../entities/Post';

export default class CreatePets implements Seeder {
  public async run(_: any, connection: Connection): Promise<any> {
    await Post.delete({});
    await connection
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values(fakePostData)
      .execute();
  }
}
