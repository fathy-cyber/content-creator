export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: any;
}

export interface RpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: any;
}

function jsonRpcError(code: number, message: string, id?: any): RpcResponse {
  return {
    jsonrpc: '2.0',
    error: { code, message },
    id,
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' || typeof document !== 'undefined';
}

export function createRpcHandler() {
  if (isBrowser()) {
    return class BrowserRpcHandler {
      private baseUrl: string;
      
      constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
      }
      
      async call<T = any>(method: string, params?: any): Promise<T> {
        const res = await fetch(`${this.baseUrl}/rpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now(),
          }),
        });
        
        const response = await res.json() as RpcResponse;
        
        if (response.error) {
          throw new Error(`RPC Error ${response.error.code}: ${response.error.message}`);
        }
        
        return response.result as T;
      }
      
      async rpc<T = any>(method: string, params?: any): Promise<T> {
        return this.call<T>(method, params);
      }
    };
  }
  
  return null;
}

let RpcHandlerClass: ReturnType<typeof createRpcHandler> = null;

export function getRpcHandler() {
  if (!RpcHandlerClass) {
    RpcHandlerClass = createRpcHandler();
  }
  return RpcHandlerClass;
}

export function rpc<T = any>(method: string, params?: any): Promise<T> {
  const HandlerClass = getRpcHandler();
  if (!HandlerClass) {
    return Promise.reject(new Error('RPC not available in browser'));
  }
  const handler = new HandlerClass();
  return handler.rpc<T>(method, params);
}

export async function createServerRpcHandler(controllers: any, services: any) {
  if (isBrowser()) return null;
  
  const { controllerRegistry } = await import('../controllers/ControllerRegistry');
  const { kernel } = await import('../kernel/Kernel');
  const { EnvironmentImpl } = await import('../orm/environment');
  
  return async function handleRpc(req: RpcRequest): Promise<RpcResponse> {
    if (!req || req.jsonrpc !== '2.0' || !req.method) {
      return jsonRpcError(-32600, 'Invalid Request', req?.id);
    }

    const endpoint = controllerRegistry.getEndpoint('POST', req.method);

    if (!endpoint) {
      return jsonRpcError(-32601, 'Method not found', req.id);
    }

    try {
      const userId = 'system';
      const env = new EnvironmentImpl(
        userId,
        {},
        services,
        kernel.registry,
        kernel.adapter
      );

      const result = await endpoint.instance[endpoint.methodName](req.params || {}, env);
      return {
        jsonrpc: '2.0',
        result,
        id: req.id,
      };
    } catch (error: any) {
      return jsonRpcError(-32603, error.message || 'Internal Error', req.id);
    }
  };
}