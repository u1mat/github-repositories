import type { HttpAdapter } from '../interfaces/http-adapter';
import type { RequestOptions } from '../interfaces/types';

interface FetchError extends Error {
  status?: number;
  statusText?: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export default class FetchAdapter implements HttpAdapter {
  private readonly defaultConfig: RequestInit = {
    method: 'GET',
  };

  public async request<T = void, B = unknown>(
    url: string,
    options: RequestOptions<B> = {}
  ): Promise<T> {
    const config = this.buildRequestConfig(options);

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleFetchError(error);
      throw error;
    }
  }

  private buildRequestConfig<B>(options: RequestOptions<B>): RequestInit {
    const { method = 'GET', headers = {}, body, signal } = options;

    const config: RequestInit = {
      ...this.defaultConfig,
      method,
      headers,
      signal,
    };

    if (body !== undefined && body !== null) {
      config.body = JSON.stringify(body);
    }

    return config;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw await this.createFetchError(response);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as unknown as T;
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as Promise<T>;
  }

  private async createFetchError(response: Response): Promise<FetchError> {
    let errorMessage: string;

    try {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const errorData = (await response.json()) as ErrorResponse;

        errorMessage = errorData.message ?? errorData.error ?? 'Request failed';
      } else {
        errorMessage = await response.text();
      }
    } catch {
      errorMessage = response.statusText || 'Request failed';
    }

    const error = new Error(errorMessage) as FetchError;
    error.status = response.status;
    error.statusText = response.statusText;

    return error;
  }

  private handleFetchError(error: unknown): void {
    if (!(error instanceof Error)) {
      console.error('Unexpected fetch error:', error);
      return;
    }

    if (error.name === 'AbortError') {
      console.warn('Request was aborted:', error.message);
    } else {
      console.error('Fetch error:', {
        message: error.message,
        name: error.name,
      });
    }
  }

  public createAbortController(): AbortController {
    return new AbortController();
  }
}
