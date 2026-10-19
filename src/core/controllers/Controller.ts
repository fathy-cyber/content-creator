
import type { Request, Response, NextFunction } from 'express';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteEntry {
  path: string;
  method: HTTPMethod;
  methodName: string;
}

export type RouteMap = Map<string, RouteEntry>;

export const MODULE_ID_SYMBOL = Symbol('moduleId');
export const HTTP_ROUTES_SYMBOL = Symbol('httpRoutes');

/**
 * @route decorator to mark a method as an RPC endpoint.
 * @param path The endpoint path, e.g., '/my-method'
 */
export function route(path: string, httpMethod: HTTPMethod = 'POST') {
  return function (target: any, propertyKey: string) {
    const constructor = target.constructor;
    let routes = constructor[HTTP_ROUTES_SYMBOL] as RouteMap;
    if (!routes) {
      routes = new Map();
      constructor[HTTP_ROUTES_SYMBOL] = routes;
    }
    const key = `${httpMethod}:${path}`;
    routes.set(key, { path, method: httpMethod, methodName: propertyKey });
  };
}

export function getRoute(path: string) { return route(path, 'GET'); }
export function postRoute(path: string) { return route(path, 'POST'); }
export function putRoute(path: string) { return route(path, 'PUT'); }
export function patchRoute(path: string) { return route(path, 'PATCH'); }
export function deleteRoute(path: string) { return route(path, 'DELETE'); }

/**
 * @Controller decorator to mark a class as a controller.
 * @param moduleId The ID of the module this controller belongs to.
 */
export function Controller(moduleId: string) {
  return function (constructor: any) {
    constructor[MODULE_ID_SYMBOL] = moduleId;
    if (!constructor[HTTP_ROUTES_SYMBOL]) {
      constructor[HTTP_ROUTES_SYMBOL] = new Map();
    }
  };
}

export interface ControllerMetadata {
  [MODULE_ID_SYMBOL]: string;
  [HTTP_ROUTES_SYMBOL]: RouteMap;
}

type RouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

export function createRouteHandler(instance: any, methodName: string): RouteHandler {
  return async (req: Request, res: Response, next?: NextFunction) => {
    try {
      const params = {
        ...req.params,
        ...req.query,
        ...req.body,
      };
      const result = await instance[methodName](params, req, res);
      if (result !== undefined) {
        res.json(result);
      }
    } catch (error: any) {
      next?.(error);
    }
  };
}
