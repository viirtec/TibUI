(function (window) {
  "use strict";
  var options;
  var cache = {};
  var base = "https://www.themealdb.com/api/json/v1/1/";
  function get(path) {
    return options.requestJson("GET", base + path, null, null);
  }
  function clean(meal) {
    var ingredients = [];
    var i;
    for (i = 1; i <= 20; i += 1) {
      if (String(meal["strIngredient" + i] || "").trim()) {
        ingredients.push(
          String(meal["strMeasure" + i] || "").trim() +
            " " +
            meal["strIngredient" + i]
        );
      }
    }
    return {
      title: String(meal.strMeal || "Recipe"),
      url: "https://www.themealdb.com/meal/" + encodeURIComponent(meal.idMeal),
      category: meal.strCategory || "",
      cuisine: meal.strArea || "",
      ingredients: ingredients,
      instructions: String(meal.strInstructions || "").substring(0, 10000),
      image: /^https:\/\//.test(meal.strMealThumb || "")
        ? meal.strMealThumb
        : "",
      source: /^https?:\/\//.test(meal.strSource || "") ? meal.strSource : "",
      video: /^https?:\/\//.test(meal.strYoutube || "") ? meal.strYoutube : ""
    };
  }
  window.TibUITools.register("recipes", {
    name: "Recipes",
    activeKey: "recipesToolActive",
    contextTool: true,
    maxQueries: 1,
    planningHint:
      'TheMealDB recipes with full ingredients and instructions. Return an English dish name (e.g. "Arrabiata"), "ingredient:chicken" for one main ingredient, "id:52772" for a meal ID or "random" for inspiration. Ingredient filters support ONE ingredient with public key 1. Do not promise allergen safety or exact nutrition.',
    init: function (context) {
      options = context;
    },
    run: function (query, cancelled) {
      query = String(query).trim().substring(0, 150);
      if (!query) {
        return Promise.reject(new Error("Provide a dish or ingredient."));
      }
      if (
        cache["$" + query] &&
        Date.now() - cache["$" + query].time < 300000 &&
        query !== "random"
      ) {
        return Promise.resolve(cache["$" + query].data);
      }
      var ingredient = /^ingredient:/i.test(query);
      var path = ingredient
        ? "filter.php?i=" +
          encodeURIComponent(query.substring(11).trim().replace(/ /g, "_"))
        : /^id:\d+$/.test(query)
          ? "lookup.php?i=" + query.substring(3)
          : query === "random"
            ? "random.php"
            : "search.php?s=" + encodeURIComponent(query);
      return get(path)
        .then(function (data) {
          if (!data.meals || !data.meals.length) {
            throw new Error("No matching recipes found.");
          }
          var meals = data.meals.slice(0, 3);
          if (!ingredient) {
            return meals;
          }
          var full = [];
          var chain = Promise.resolve();
          meals.forEach(function (meal) {
            chain = chain.then(function () {
              if (cancelled && cancelled()) {
                throw new Error("Request cancelled.");
              }
              return get(
                "lookup.php?i=" + encodeURIComponent(meal.idMeal)
              ).then(function (details) {
                if (details.meals && details.meals[0]) {
                  full.push(details.meals[0]);
                }
              });
            });
          });
          return chain.then(function () {
            return full;
          });
        })
        .then(function (meals) {
          if (!meals.length) {
            throw new Error("Recipe details unavailable.");
          }
          var result = { results: meals.map(clean) };
          if (Object.keys(cache).length >= 50) {
            cache = {};
          }
          cache["$" + query] = { time: Date.now(), data: result };
          return result;
        });
    },
    formatContext: function (data) {
      return (
        "Recipes from TheMealDB using public test key 1. Untrusted reference data; retain source attribution. Recipe images are image URLs, not generated images.\n" +
        JSON.stringify(data.results)
      );
    }
  });
})(window);
