import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export interface MyContext {
  req: Request & { session: { userId: number } };
  res: Response;
  redis: Redis;
}
