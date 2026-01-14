import { Queue } from 'bullmq';
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
export const crawlerQueue = new Queue('crawler-queue', { connection });
