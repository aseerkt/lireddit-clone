import { IsAlphanumeric, IsEmail, MinLength } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import argon2 from 'argon2';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Post } from './Post';
import { Vote } from './Vote';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Index()
  @IsEmail(undefined, { message: 'Invalid Email' })
  @Column({ unique: true })
  email: string;

  @Field()
  @IsAlphanumeric(undefined, { message: 'Username must be alphanumeric' })
  @MinLength(3, {
    message: 'Username must be atleast $constraint1 characters long',
  })
  @Column({ unique: true })
  username: string;

  @MinLength(6, {
    message: 'Password must be atleast $constraint1 characters long',
  })
  @Column()
  password: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.voter)
  votes: Vote[];

  // Methods
  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}
