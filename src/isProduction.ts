declare const process:
  | { env?: { NODE_ENV?: string } }
  | undefined;

export function isProduction(): boolean {
  if (typeof process === "undefined") return false;
  return process.env?.NODE_ENV === "production";
}
