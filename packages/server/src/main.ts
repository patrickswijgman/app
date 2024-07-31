import { createServer, ServerResponse } from "http";
import { extname } from "path";
import {
  TEMPLATE_LOOP_REGEX,
  TEMPLATE_PARTIAL_REGEX,
  TEMPLATE_VAR_REGEX,
} from "./consts.js";
import { get, getContentType, loadFile } from "./utils.js";

const templates: Templates = {};

const settings: Settings = {
  server: {
    host: "localhost",
    port: 3000,
  },
};

/**
 * Start the HTTP web server.
 */
export function server(c: Config) {
  Object.assign(templates, c.templates);
  Object.assign(settings, c.settings);

  createServer((req, res) => {
    try {
      const url = new URL(
        `http://${settings.server.host}:${settings.server.port}${req.url}`,
      );

      const route = c.routes[url.pathname];

      if (route) {
        serveContent(res, 200, route());
      } else {
        serveContent(res, 404, {
          content: "<h1>404 - Not Found</h1>",
          type: "html",
        });
      }
    } catch (e) {
      serveContent(res, 500, {
        content: `<h1>500 - Internal Server Error</h1><hr/><p>${e}</p>`,
        type: "html",
      });
    }
  }).listen(
    {
      host: settings.server.host,
      port: settings.server.port,
    },
    () => {
      console.log(
        `Server is running at http://${settings.server.host}:${settings.server.port}`,
      );
    },
  );
}

/**
 * Send a response with the given content.
 */
function serveContent(
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
 * Render the content of a file.
 */
export function renderFile(path: string): Content {
  return {
    content: loadFile(path),
    type: extname(path).replace(".", ""),
  };
}

/**
 * Parse the input string resolving loops, variables, and (referenced) partials.
 */
function parse(input: string, data: Obj): string {
  return input
    .replaceAll(TEMPLATE_LOOP_REGEX, (_, name, key, content) => {
      const list = get(data, key);

      if (list === undefined) {
        throw new Error(`Template variable not found: ${key}`);
      }

      if (!Array.isArray(list)) {
        throw new Error(`Template variable is not an array: ${key}`);
      }

      return list
        .map((value) => parse(content, { ...data, [name]: value }))
        .join("");
    })
    .replaceAll(TEMPLATE_VAR_REGEX, (_, key) => {
      const value = get(data, key);

      if (value === undefined) {
        throw new Error(`Template variable not found: ${key}`);
      }

      return String(value);
    })
    .replaceAll(TEMPLATE_PARTIAL_REGEX, (_, key) => {
      const ref = get(data, key);

      if (typeof ref === "string") {
        return parseTemplate(ref, data);
      }

      return parseTemplate(key, data);
    });
}

/**
 * Parse the content of an HTML template file.
 */
function parseTemplate(id: string, data: Obj): string {
  const template = templates[id];

  if (template === undefined) {
    throw new Error(`Template not found: ${id}`);
  }

  return parse(template, data);
}

/**
 * Render the content of an HTML template file.
 */
export function renderTemplate(id: string, data: Obj = {}): Content {
  return {
    content: parseTemplate(id, data),
    type: "html",
  };
}
