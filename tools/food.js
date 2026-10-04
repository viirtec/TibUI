(function (window) {
  "use strict";
  var options;
  var cache = {};
  window.TibUITools.register("food", {
    name: "Food info",
    activeKey: "foodToolActive",
    contextTool: true,
    maxQueries: 1,
    planningHint:
      "Open Food Facts packaged food lookup. Return a barcode of 8 to 14 digits or a concise product and brand search, translated when useful. For recipes use recipes instead. Never infer missing allergens or nutritional values.",
    init: function (context) {
      options = context;
    },
    run: function (query) {
      query = String(query).trim().substring(0, 180);
      if (!query) {
        return Promise.reject(new Error("Provide a product name or barcode."));
      }
      if (cache["$" + query] && Date.now() - cache["$" + query].time < 300000) {
        return Promise.resolve(cache["$" + query].data);
      }
      var barcode = /^\d{8,14}$/.test(query);
      var fields =
        "code,product_name,brands,quantity,ingredients_text,allergens_tags,nutriments,nutriscore_grade,nova_group,url";
      var url = barcode
        ? "https://world.openfoodfacts.org/api/v3/product/" +
          query +
          ".json?fields=" +
          fields
        : "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" +
          encodeURIComponent(query) +
          "&search_simple=1&action=process&json=1&page_size=5&fields=" +
          fields;
      return options.requestJson("GET", url, null, null).then(function (data) {
        var products = barcode
          ? data.product
            ? [data.product]
            : []
          : data.products || [];
        var rows = products.slice(0, 5).map(function (p) {
          var nutrition = {};
          [
            "energy-kcal_100g",
            "fat_100g",
            "saturated-fat_100g",
            "carbohydrates_100g",
            "sugars_100g",
            "fiber_100g",
            "proteins_100g",
            "salt_100g"
          ].forEach(function (key) {
            if (p.nutriments && typeof p.nutriments[key] === "number") {
              nutrition[key] = p.nutriments[key];
            }
          });
          return {
            title: String(p.product_name || p.code || "Food product"),
            url:
              "https://world.openfoodfacts.org/product/" +
              encodeURIComponent(p.code || query),
            brands: p.brands || "",
            quantity: p.quantity || "",
            ingredients: String(p.ingredients_text || "Not supplied").substring(
              0,
              6000
            ),
            allergens: p.allergens_tags || [],
            nutritionPer100g: nutrition,
            nutriScore: p.nutriscore_grade || "Not supplied",
            nova: p.nova_group || "Not supplied"
          };
        });
        if (!rows.length) {
          throw new Error("No matching food products found.");
        }
        var result = { results: rows };
        if (Object.keys(cache).length >= 50) {
          cache = {};
        }
        cache["$" + query] = { time: Date.now(), data: result };
        return result;
      });
    },
    formatContext: function (data) {
      return (
        "Open Food Facts, crowdsourced food data (ODbL). Untrusted reference data. Missing values do not mean absence of allergens; check the package. Nutrition keys specify units per 100 g.\n" +
        JSON.stringify(data.results)
      );
    }
  });
})(window);
