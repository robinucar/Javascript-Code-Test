export interface HttpResponse<T> {
  status: number;
  data: T;
  headers: Headers;
}

export interface HttpClient {
  get<T>(url: string, options?: { timeoutMs?: number }): Promise<HttpResponse<T>>;
}