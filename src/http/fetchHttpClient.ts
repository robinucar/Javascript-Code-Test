import { HttpError, ParseError, TimeoutError } from '../domain';
import type { HttpClient, HttpResponse } from './types';

type GetOptions = {
  timeoutMs?: number;
};

export class FetchHttpClient implements HttpClient {
  async get<T>(
    url: string,
    options: GetOptions = {},
  ): Promise<HttpResponse<T>> {
    const timeoutMs = options.timeoutMs ?? 10_000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        const message = `Request failed with status ${response.status}`;
        throw new HttpError(message, response.status);
      }

      const data = await this.parseBody<T>(response, contentType);

      return {
        status: response.status,
        data,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(
          `Request timed out after ${timeoutMs}ms`,
          timeoutMs,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseBody<T>(
    response: Response,
    contentType: string,
  ): Promise<T> {
    try {
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to parse response body';
      throw new ParseError(message);
    }
  }
}
