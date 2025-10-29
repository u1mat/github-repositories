import type { HttpAdapter } from './interfaces/http-adapter';
import type { QueryParams, RequestOptions } from './interfaces/types';

export default class ApiBase {
  private adapter: HttpAdapter;
  protected readonly baseUrl: string;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, adapter: HttpAdapter) {
    this.baseUrl = this.normalizeBaseUrl(baseUrl);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.adapter = adapter;
  }

  private normalizeBaseUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private createQueryString(params: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const filteredParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return new URLSearchParams(filteredParams).toString();
  }

  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    if (!customHeaders || Object.keys(customHeaders).length === 0) {
      return this.defaultHeaders;
    }

    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  private buildUrl(endpoint: string, queryParams?: QueryParams): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const queryString = queryParams ? `?${this.createQueryString(queryParams)}` : '';

    return queryString
      ? `${this.baseUrl}${normalizedEndpoint}${queryString}`
      : `${this.baseUrl}${normalizedEndpoint}`;
  }

  private async executeRequest<T, B = unknown>(
    url: string,
    options: RequestOptions<B>
  ): Promise<T> {
    try {
      return await this.adapter.request<T, B>(url, options);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      console.error('API request failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    } else {
      console.error('API request failed with unknown error:', error);
    }
  }

  protected async request<T, B = unknown>(
    endpoint: string,
    options: RequestOptions<B> = {}
  ): Promise<T> {
    const { queryParams, headers, ...restOptions } = options;

    const url = this.buildUrl(endpoint, queryParams);
    const requestOptions: RequestOptions<B> = {
      ...restOptions,
      headers: this.buildHeaders(headers),
    };

    return this.executeRequest<T, B>(url, requestOptions);
  }

  public get<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T, B = unknown>(
    endpoint: string,
    body: B,
    options: Omit<RequestOptions<B>, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'POST', body });
  }

  public patch<T, B = unknown>(
    endpoint: string,
    body: B,
    options: Omit<RequestOptions<B>, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'PATCH', body });
  }

  public put<T, B = unknown>(
    endpoint: string,
    body: B,
    options: Omit<RequestOptions<B>, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'PUT', body });
  }

  public delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public createAbortController(): AbortController | null {
    if (!this.adapter.createAbortController) {
      console.warn('AbortController is not supported by the current HTTP adapter.');
      return null;
    }

    return this.adapter.createAbortController();
  }
}
