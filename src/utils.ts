import { createHash } from "crypto";
import { Response, Result } from "./types/response";
import { Entity } from "./types/types";
import { Method } from "./types/request";

export function generateAppId(appName: string) {
  return createHash("sha256", { outputLength: 64 })
    .update(appName)
    .digest("hex");
}

export async function sleep(timems: number) {
  await new Promise((r) => setTimeout(r, timems));
}

export function to<E extends Entity, M extends Method<E>, R extends Result>(
  response: Response<E, M, R>
): [Response<E, M, "error"> | undefined, Response<E, M, "result"> | undefined] {
  return [
    "error" in response ? (response as Response<E, M, "error">) : undefined,
    "result" in response ? (response as Response<E, M, "result">) : undefined,
  ];
}
