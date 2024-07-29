import {
  server,
  renderFile,
  loadFile,
  renderTemplate,
  Templates,
} from "server";

const templates: Templates = {
  base: loadFile("templates/base.html"),
  greeting: loadFile("templates/greeting.html"),
};

server({
  server: {
    host: "localhost",
    port: 3000,
  },
  routes: {
    "/": () => {
      return renderTemplate(templates, "base", {
        title: "Hello",
        content: "greeting",
        data: {
          name: ["Patrick"],
        },
      });
    },
    "/style.css": () => {
      return renderFile("public/style.css");
    },
  },
});
