type InterceptorFn<T = any> = (data: T) => T | Promise<T>;

class InterceptorManager {
  private requestInterceptors: InterceptorFn[] = [];
  private responseInterceptors: InterceptorFn[] = [];

  useRequestInterceptor(fn: InterceptorFn): number {
    this.requestInterceptors.push(fn);
    return this.requestInterceptors.length - 1;
  }

  useResponseInterceptor(fn: InterceptorFn): number {
    this.responseInterceptors.push(fn);
    return this.responseInterceptors.length - 1;
  }

  ejectRequestInterceptor(index: number): void {
    if (index >= 0 && index < this.requestInterceptors.length) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  ejectResponseInterceptor(index: number): void {
    if (index >= 0 && index < this.responseInterceptors.length) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  async interceptRequest(config: any): Promise<any> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  async interceptResponse(response: any): Promise<any> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }
}

export const interceptorManager = new InterceptorManager();

interceptorManager.useRequestInterceptor((config: any) => {
  console.log('[Request]', config);
  return config;
});

interceptorManager.useResponseInterceptor((response: any) => {
  console.log('[Response]', response);
  return response;
});

interceptorManager.useResponseInterceptor((response: any) => {
  if (response.error) {
    console.error('[API Error]', response.error);
  }
  return response;
});
