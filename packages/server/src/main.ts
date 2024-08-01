import { createServer, ServerResponse } from "http";
import { extname } from "path";
import {
  TEMPLATE_LOOP_REGEX,
  TEMPLATE_PARTIAL_REGEX,
  TEMPLATE_VAR_REGEX,
} from "./consts.js";
import { get, getContentType, read } from "./utils.js";

const templates: Templates = {};

const settings: Settings = {
  host: "localhost",
  port: 3000,
};

/**
 * Start the HTTP web server.
 */
export function server(c: Config) {
  Object.assign(templates, c.templates);
  Object.assign(settings, c.settings);

  createServer((req, res) => {
    try {
      const url = new URL(`http://${settings.host}:${settings.port}${req.url}`);
      const route = c.routes[url.pathname];

      if (route) {
        respond(res, 200, route());
      } else {
        respond(res, 404, {
          content: "<h1>404 - Not Found</h1>",
          type: "html",
        });
      }
    } catch (e) {
      respond(res, 500, {
        content: `<h1>500 - Internal Server Error</h1><hr/><p>${e}</p>`,
        type: "html",
      });
    }
  }).listen(
    {
      host: settings.host,
      port: settings.port,
    },
    () => {
      console.log(
        `Server is running at http://${settings.host}:${settings.port}`,
      );
    },
  );
}

/**
 * Send a response with the given content.
 */
function respond(
  response: ServerResponse,
  statusCode: number,
  { content, type }: Content,
) {
  response
    .setHeader("Content-Type", getContentType(type))
    .setHeader("Content-Length", Buffer.byteLength(content))
    .writeHead(statusCode)
    .end(content);
}

/**
 * Render the content of a file or a template.
 */
export function render(path: string, data: Dict = {}): Content {
  if (path.includes(".")) {
    return {
      content: read(path),
      type: extname(path).replace(".", ""),
    };
  } else {
    return {
      content: parseTemplate(path, data),
      type: "html",
    };
  }
}

/**
 * Parse the template content; resolving loops, variables, and (referenced) partials.
 */
function parse(input: string, data: Dict): string {
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
    })
    .trim();
}

/**
 * Parse the content of an HTML template file.
 */
function parseTemplate(id: string, data: Dict): string {
  const template = templates[id];

  if (template === undefined) {
    throw new Error(`Template not found: ${id}`);
  }

  return parse(template, data);
}
