import { readFileSync } from "fs";

/**
 * Convert to the appropriate MIME type.
 */
export function getContentType(type: string) {
  if (!type) {
    throw new Error("Content type is required.");
  }

  switch (type) {
    case "html":
      return "text/html";

    case "css":
      return "text/css";

    case "json":
      return "application/json";

    default:
      throw new Error(`Unknown content type: ${type}`);
  }
}

/**
 * Get the value of a nested key in an object.
 */
export function get<T>(obj: Dict, key: string) {
  return key.split(".").reduce((v, k) => v[k], obj) as T;
}

/**
 * Load a file from the file system.
 */
export function read(path: string) {
  return readFileSync(path, "utf8");
}
