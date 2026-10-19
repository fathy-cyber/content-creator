import type { Router } from 'express';
import { ControllerMetadata, HTTP_ROUTES_SYMBOL, MODULE_ID_SYMBOL, RouteEntry, createRouteHandler } from './Controller';

export interface HTTPEndpoint {
  instance: any;
  methodName: string;
  moduleId: string;
  httpMethod: string;
  path: string;
}

export class ControllerRegistry {
  private endpoints = new Map<string, HTTPEndpoint>();

  register(controller: any): void {
    const constructor = controller.constructor;
    const metadata = constructor as unknown as ControllerMetadata;

    if (!metadata[HTTP_ROUTES_SYMBOL]) {
      return;
    }

    const routes = metadata[HTTP_ROUTES_SYMBOL];
    const moduleId = metadata[MODULE_ID_SYMBOL];

    for (const [key, entry] of routes.entries()) {
      this.endpoints.set(key, {
        instance: controller,
        methodName: entry.methodName,
        moduleId,
        httpMethod: entry.method,
        path: entry.path,
      });
    }
  }

  getEndpoint(httpMethod: string, path: string): HTTPEndpoint | undefined {
    const key = `${httpMethod}:${path}`;
    return this.endpoints.get(key);
  }

  getAllEndpoints(): HTTPEndpoint[] {
    return [...this.endpoints.values()];
  }

  getEndpointsByModule(moduleId: string): HTTPEndpoint[] {
    return [...this.endpoints.values()].filter(e => e.moduleId === moduleId);
  }

  unregisterModule(moduleId: string): void {
    for (const [key, endpoint] of this.endpoints.entries()) {
      if (endpoint.moduleId === moduleId) {
        this.endpoints.delete(key);
      }
    }
  }

  setupRoutes(router: Router): void {
    for (const endpoint of this.endpoints.values()) {
      const handler = createRouteHandler(endpoint.instance, endpoint.methodName);
      const method = endpoint.httpMethod.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
      router[method](endpoint.path, handler);
    }
  }
}

export const controllerRegistry = new ControllerRegistry();