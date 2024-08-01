import { server, render, read } from "server";
import { recipes } from "./data.js";

server({
  templates: {
    base: read("templates/base.html"),
    recipes: read("templates/recipes.html"),
    recipe: read("templates/recipe.html"),
  },
  routes: {
    "/": () =>
      render("base", {
        title: "Recipes",
        content: "recipes",
        recipes,
      }),
    "/style.css": () => render("public/style.css"),
  },
});
