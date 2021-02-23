import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Vote } from './Vote';

@ObjectType()
@Entity('posts')
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  body: string;

  @Field(() => Int)
  @Column({ default: 0, type: 'int' })
  points: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  userVote: number | null;

  // Relations

  @Field()
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  // Methods
  getUserVote(userId: number) {
    if (this.votes && userId) {
      this.votes.forEach(({ voterId, value }) => {
        if (voterId === userId) {
          this.userVote = value;
        }
      });
    }
  }
}
