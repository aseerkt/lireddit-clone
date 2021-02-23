import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity('votes')
export class Vote extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value: number;

  @Field()
  @PrimaryColumn()
  voterId: number;

  @ManyToOne(() => User, (user) => user.votes)
  voter: User;

  @Field()
  @PrimaryColumn()
  postId: string;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: 'CASCADE' })
  post: Post;
}
