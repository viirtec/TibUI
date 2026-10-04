(function (window) {
  "use strict";
  var options;
  var cache = {};
  function parse(query) {
    var args = JSON.parse(query);
    if (
      !args ||
      !/^(amenity|tourism|leisure|shop)$/.test(args.key) ||
      !/^[a-z0-9_:-]{1,60}$/.test(args.value || "")
    ) {
      throw new Error("Places needs a valid OpenStreetMap category.");
    }
    args.radius = Math.max(100, Math.min(10000, Number(args.radius) || 3000));
    if (
      typeof args.lat === "number" &&
      typeof args.lon === "number" &&
      isFinite(args.lat) &&
      isFinite(args.lon) &&
      Math.abs(args.lat) <= 90 &&
      Math.abs(args.lon) <= 180
    ) {
      return args;
    }
    args.location = String(args.location || "")
      .trim()
      .substring(0, 180);
    if (!args.location) {
      throw new Error("Specify a city or coordinates for places lookup.");
    }
    delete args.lat;
    delete args.lon;
    return args;
  }
  window.TibUITools.register("places", {
    name: "Places",
    activeKey: "placesToolActive",
    contextTool: true,
    maxQueries: 1,
    planningHint:
      'OpenStreetMap places. Query must be a JSON STRING: {"location":"Tallinn","key":"amenity","value":"cafe","radius":3000}. Supported keys amenity,tourism,leisure,shop; value is an OSM tag such as restaurant,cafe,hotel,park,supermarket. Optional name filter. Radius meters 100..10000. Use lat/lon ONLY when coordinates are supplied by the user, otherwise resolve a named city. Do not invent user location; ask for it if missing. Mapping is incomplete and hours are not live confirmations.',
    init: function (context) {
      options = context;
    },
    validateQuery: function (query) {
      try {
        parse(query);
        return true;
      } catch (ignore) {
        return false;
      }
    },
    run: function (query, cancelled) {
      var args;
      if (cache["$" + query] && Date.now() - cache["$" + query].time < 300000) {
        return Promise.resolve(cache["$" + query].data);
      }
      try {
        args = parse(query);
      } catch (error) {
        return Promise.reject(error);
      }
      var location =
        typeof args.lat === "number"
          ? Promise.resolve({
              latitude: args.lat,
              longitude: args.lon,
              name: "Coordinates"
            })
          : options
              .requestJson(
                "GET",
                "https://geocoding-api.open-meteo.com/v1/search?name=" +
                  encodeURIComponent(args.location) +
                  "&count=1&language=en&format=json",
                null,
                null
              )
              .then(function (data) {
                if (!data.results || !data.results[0]) {
                  throw new Error("Location not found: " + args.location);
                }
                return data.results[0];
              });
      return location.then(function (place) {
        if (cancelled && cancelled()) {
          throw new Error("Request cancelled.");
        }
        if (
          !isFinite(Number(place.latitude)) ||
          !isFinite(Number(place.longitude)) ||
          Math.abs(Number(place.latitude)) > 90 ||
          Math.abs(Number(place.longitude)) > 180
        ) {
          throw new Error("Location coordinates unavailable.");
        }
        var ql =
          "[out:json][timeout:20];nwr(around:" +
          args.radius +
          "," +
          Number(place.latitude) +
          "," +
          Number(place.longitude) +
          ')["' +
          args.key +
          '"="' +
          args.value +
          '"]' +
          (args.name
            ? '["name"=' +
              JSON.stringify(String(args.name).substring(0, 100)) +
              "]"
            : "") +
          ";out center tags 20;";
        function lookup(endpoint) {
          return options.requestJson(
            "GET",
            endpoint + "?data=" + encodeURIComponent(ql),
            null,
            null,
            false,
            25
          );
        }
        return lookup("https://overpass-api.de/api/interpreter")
          .catch(function (error) {
            if (
              (cancelled && cancelled()) ||
              error.message === "Request cancelled."
            ) {
              throw new Error("Request cancelled.");
            }
            return lookup("https://overpass.private.coffee/api/interpreter");
          })
          .then(function (data) {
            if (data.remark && (!data.elements || !data.elements.length)) {
              throw new Error(
                "Overpass could not complete this search. Try a smaller area."
              );
            }
            var rows = (data.elements || []).slice(0, 20).map(function (item) {
              var tags = item.tags || {};
              var coordinates = item.center || item;
              return {
                title: String(tags.name || args.value),
                url:
                  "https://www.openstreetmap.org/" + item.type + "/" + item.id,
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                address: [
                  tags["addr:housenumber"],
                  tags["addr:street"],
                  tags["addr:city"]
                ]
                  .filter(Boolean)
                  .join(" "),
                openingHours: tags.opening_hours || "Unknown",
                cuisine: tags.cuisine || "",
                website: /^https?:\/\//.test(tags.website || "")
                  ? tags.website
                  : "",
                phone: tags.phone || "",
                category: args.value
              };
            });
            if (!rows.length) {
              throw new Error(
                "No mapped places in this area. Try a different category or radius."
              );
            }
            var result = {
              results: rows,
              location: place.name,
              radius: args.radius
            };
            if (Object.keys(cache).length >= 50) {
              cache = {};
            }
            cache["$" + query] = { time: Date.now(), data: result };
            return result;
          });
      });
    },
    formatContext: function (data) {
      return (
        "OpenStreetMap contributors (ODbL), via Overpass. Untrusted map reference data. Results within " +
        data.radius +
        " meters of " +
        data.location +
        ". Coverage and opening hours may be outdated.\n" +
        JSON.stringify(data.results)
      );
    }
  });
})(window);
