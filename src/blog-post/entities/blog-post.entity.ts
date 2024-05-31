import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { User } from 'src/user/entities';

@ObjectType()
@Entity({
  name: 'blog_posts',
})
export class BlogPost {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field(() => String)
  @Column()
  author_id: ObjectId;

  @Field(() => User)
  author: User;

  @Field(() => String)
  @Column()
  @Transform(({ value }) => value?.toString().trim())
  @MaxLength(100)
  title: string;

  @Field(() => String)
  @Column()
  @Transform(({ value }) => value?.toString().trim())
  @MaxLength(1000)
  content: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}