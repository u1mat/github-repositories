import type { HttpAdapter } from './interfaces/http-adapter';
import type { QueryParams, RequestOptions } from './interfaces/types';

export default class ApiBase {
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  private adapter: HttpAdapter;

  constructor(baseUrl: string, adapter: HttpAdapter) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.adapter = adapter;
  }

  private createQueryString(params: QueryParams): string {
    return new URLSearchParams(params as Record<string, string>).toString();
  }

  private buildHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  private async handleRequest<T, B>(endpoint: string, options: RequestOptions<B>): Promise<T> {
    try {
      return await this.adapter.request<T, B>(endpoint, options);
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async request<T, B = unknown>(endpoint: string, options: RequestOptions<B> = {}): Promise<T> {
    const { queryParams, headers, ...restOptions } = options;
    const queryString = queryParams ? `?${this.createQueryString(queryParams)}` : '';
    const url = `${this.baseUrl}${endpoint}${queryString}`;
    const finalOptions: RequestOptions<B> = {
      ...restOptions,
      headers: this.buildHeaders(headers),
    };

    return this.handleRequest<T, B>(url, finalOptions);
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T, B = unknown>(endpoint: string, body: B, options: RequestOptions<B> = {}): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'POST', body });
  }

  patch<T, B = unknown>(endpoint: string, body: B, options: RequestOptions<B> = {}): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'PATCH', body });
  }

  put<T, B = unknown>(endpoint: string, body: B, options: RequestOptions<B> = {}): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
