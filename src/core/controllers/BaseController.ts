import type { Environment } from '../orm/environment';

export abstract class BaseController {
  protected env?: Environment;

  /**
   * Set the environment for the controller.
   * Called by the Kernel upon registration.
   */
  setEnvironment(env: Environment): void {
    this.env = env;
  }

  protected getEnv(): Environment {
    if (!this.env) {
      throw new Error('[BaseController] Environment not set. Controller must be registered via Kernel.');
    }
    return this.env;
  }
}
