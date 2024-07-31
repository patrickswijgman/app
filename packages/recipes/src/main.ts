import { server, renderFile, loadFile, renderTemplate } from "server";
import { recipes } from "./data.js";

server({
  templates: {
    base: loadFile("templates/base.html"),
    recipes: loadFile("templates/recipes.html"),
    recipe: loadFile("templates/recipe.html"),
  },
  routes: {
    "/": () =>
      renderTemplate("base", {
        title: "Recipes",
        content: "recipes",
        recipes,
      }),
    "/style.css": () => renderFile("public/style.css"),
  },
});
