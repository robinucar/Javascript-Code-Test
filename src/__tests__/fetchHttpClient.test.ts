import { describe, it, expect, vi, afterEach } from "vitest";
import { FetchHttpClient } from "../http/fetchHttpClient";
import { HttpError, ParseError, TimeoutError } from "../domain";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("FetchHttpClient", () => {
  it("throws HttpError when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return {
          ok: false,
          status: 500,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ message: "fail" }),
          text: async () => "fail"
        } as unknown as Response;
      })
    );

    const client = new FetchHttpClient();

    await expect(client.get("http://example.com")).rejects.toBeInstanceOf(HttpError);
  });

 it("throws TimeoutError on request timeout", async () => {
  vi.useFakeTimers();

  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const abortError = new Error("Aborted");
          abortError.name = "AbortError";
          reject(abortError);
        });
      });
    })
  );

  const client = new FetchHttpClient();
  const promise = client.get("http://example.com", { timeoutMs: 10 });

  const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);

  await vi.advanceTimersByTimeAsync(20);

  await assertion;
});

  it("throws ParseError when json parsing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => {
            throw new Error("bad json");
          },
          text: async () => "ignored"
        } as unknown as Response;
      })
    );

    const client = new FetchHttpClient();

    await expect(client.get("http://example.com")).rejects.toBeInstanceOf(ParseError);
  });
});