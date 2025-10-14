import type { HttpAdapter } from '../interfaces/http-adapter';
import type { RequestOptions } from '../interfaces/types';

export default class FetchAdapter implements HttpAdapter {
  async request<T = void, B = unknown>(url: string, options: RequestOptions<B> = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, signal } = options;

    const config: RequestInit = {
      method,
      headers,
      signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorMessage = await response.text();
        const error = new Error(errorMessage || 'Network response was not ok') as Error & {
          status?: number;
        };

        error.status = response.status;
        throw error;
      }

      if (response.status === 204) {
        return null as unknown as T; // No Content
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Fetch aborted:', error);
        } else {
          console.error('Fetch error:', error.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }

      throw error;
    }
  }
}
