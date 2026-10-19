import type { Environment } from './environment';

const envStack: Environment[] = [];

export const context = {
  runWith<T>(env: Environment, callback: () => Promise<T>): Promise<T> {
    envStack.push(env);
    try {
      return callback();
    } finally {
      envStack.pop();
    }
  },

  getEnv(): Environment | undefined {
    return envStack[envStack.length - 1];
  },
};