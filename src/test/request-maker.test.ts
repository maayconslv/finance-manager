import axios from 'axios';

interface HttpResponse<T> {
  body: {
    data: T;
    errors?: any;
  }
}

interface RequestFields<T> {
  body?: T
  headers: Record<string, string>
  method: 'get' | 'post' | 'put' | 'delete'
  path?: string | undefined
}

interface MakeRequestFields {
  method: 'get' | 'post' | 'put' | 'delete',
  path?: string,
  body?: any,
  headers?: Record<string, string> | undefined
}

export class RequestMaker {
  private readonly commonHeaders: Record<string, string> = { 'Content-Type': 'application/json' }


  public async execute<T>({ method, body, headers, path }: MakeRequestFields): Promise<HttpResponse<T>> {
    const mergedHeaders = headers ? { ...this.commonHeaders, ...headers } : this.commonHeaders;
    return this.request({ headers: mergedHeaders, method, path, body });
  }

  private async request<T>({ body, headers, method, path }: RequestFields<T>) {
    const response = await axios.request<T>({
      method,
      url: `http://localhost:${process.env['PORT']}/${path}`,
      data: body,
      headers,
      validateStatus: () => true
    });

    return { body: response.data };
  }
}
