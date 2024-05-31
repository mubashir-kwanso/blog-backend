import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { CreateBlogPostInput, GetAllBlogPostsInput } from './dto';
import { BlogPost } from './entities';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
  ) {}

  createBlogPost(
    currentUserPayload: TokenPayload,
    createBlogPostInput: CreateBlogPostInput,
  ): Promise<BlogPost> {
    const blogPost = this.blogPostRepository.create({
      author_id: new ObjectId(currentUserPayload.sub),
      title: createBlogPostInput.title,
      content: createBlogPostInput.content,
    });
    return this.blogPostRepository.save(blogPost);
  }

  getAllBlogPosts({
    limit,
    offset,
    sort,
  }: GetAllBlogPostsInput): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      order: {
        createdAt: sort,
      },
      take: limit,
      skip: offset,
    });
  }

  findOneById(id: string): Promise<BlogPost> {
    return this.blogPostRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }
}
