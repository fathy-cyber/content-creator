import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const TASK_QUEUE_NAME = 'scheduled-tasks';

export const taskQueue = new Queue(TASK_QUEUE_NAME, {
  connection: redisConnection,
});
