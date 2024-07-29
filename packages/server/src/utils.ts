import { readFileSync } from "fs";
import { ServerResponse } from "http";
import { extname } from "path";

export type Templates = Record<string, string>;

export type Content = {
  content: string;
  type: "html" | "css" | "json" | string;
};

const TEMPLATE_VAR_REGEX = /\{([\w.]+)\}/g;
const TEMPLATE_PARTIAL_REGEX = /\{\*(\w+)\}/g;

/**
 * Send a 404 response.
 */
export function notFound(res: ServerResponse) {
  serveContent(res, 404, {
    content: "<h1>404 - Not Found</h1>",
    type: "html",
  });
}

/**
 * Send a 500 response.
 */
export function internalError(res: ServerResponse, e: unknown) {
  serveContent(res, 500, {
    content: `<h1>500 - Internal Server Error</h1><hr/><p>${e}</p>`,
    type: "html",
  });
}

/**
 * Send a response with the given content.
 */
export function serveContent(
  res: ServerResponse,
  code: number,
  { content, type }: Content,
) {
  res
    .setHeader("Content-Type", getContentType(type))
    .setHeader("Content-Length", Buffer.byteLength(content))
    .writeHead(code)
    .end(content);
}

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
 * Load a file from the file system.
 */
export function loadFile(path: string) {
  return readFileSync(path, "utf8");
}

/**
 * Render the content of a file.
 */
export function renderFile(path: string): Content {
  return {
    content: loadFile(path),
    type: extname(path).replace(".", ""),
  };
}

/**
 * Get the value of a nested key in an object.
 */
function getValue(data: Record<string, unknown>, key: string) {
  if (key.includes(".")) {
    const [firstKey, ...rest] = key.split(".");
    const restKey = rest.join(".");
    const nestedData = data[firstKey];

    if (nestedData === undefined) {
      return undefined;
    }

    return getValue(nestedData as Record<string, unknown>, restKey);
  }

  return data[key];
}

/**
 * Get the content of an HTML template file, resolving any partials recursively.
 */
function getTemplateContent(
  templates: Templates,
  key: string,
  data: Record<string, unknown> = {},
): string {
  const template = templates[key];

  if (template === undefined) {
    throw new Error(`Template not found: ${key}`);
  }

  return template
    .replaceAll(TEMPLATE_VAR_REGEX, (_, key) => {
      const value = getValue(data, key);

      if (value === undefined) {
        throw new Error(`Template variable not found: ${key}`);
      }

      return String(value);
    })
    .replaceAll(TEMPLATE_PARTIAL_REGEX, (_, key) => {
      const ref = data[key];

      if (typeof ref === "string") {
        return getTemplateContent(templates, ref, data);
      }

      return getTemplateContent(templates, key, data);
    });
}

/**
 * Render the content of an HTML template file.
 */
export function renderTemplate(
  templates: Templates,
  key: string,
  data: Record<string, unknown> = {},
): Content {
  return {
    content: getTemplateContent(templates, key, data),
    type: "html",
  };
}
