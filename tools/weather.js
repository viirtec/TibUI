(function(window) {
  "use strict";
  
  window.TibUITools = window.TibUITools || {};
  
  var state;
  var byId;
  var requestJson;
  var saveState;
  var setClass;
  
  var GEOCODING_URL =
    "https://geocoding-api.open-meteo.com/v1/search";
  
  var FORECAST_URL =
    "https://api.open-meteo.com/v1/forecast";
  
  var WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  function init(options) {
    options = options || {};
    
    state = options.state;
    byId = options.byId;
    requestJson = options.requestJson;
    saveState = options.saveState;
    setClass = options.setClass;
    
    if (typeof state.weatherEnabled !== "boolean") {
      state.weatherEnabled = true;
    }
    
    if (typeof state.weatherToolActive !== "boolean") {
      state.weatherToolActive = false;
    }
    
    bind();
    updateUI();
  }
  
  function updateUI() {
    var button = byId("weather-tool-button");
    
    if (!button) {
      return;
    }
    
    button.hidden = !state.weatherEnabled;
    
    button.disabled = !state.weatherEnabled;
    
    button.setAttribute(
      "aria-pressed",
      state.weatherToolActive ? "true" : "false"
    );
    
    if (setClass) {
      setClass(
        button,
        "active",
        state.weatherToolActive
      );
    }
  }
  
  function toggle() {
    if (!state.weatherEnabled) {
      return;
    }
    
    state.weatherToolActive = !state.weatherToolActive;
    
    updateUI();
    
    if (typeof saveState === "function") {
      saveState();
    }
  }
  
  function isActive() {
    return (
      state.weatherEnabled === true &&
      state.weatherToolActive === true
    );
  }
  
  function getJson(url) {
    if (typeof requestJson === "function") {
      return requestJson(
        "GET",
        url,
        null,
        null
      );
    }
    
    return fetch(url).then(function(response) {
      if (!response.ok) {
        throw new Error(
          "Weather request failed: HTTP " +
          response.status
        );
      }
      
      return response.json();
    });
  }
  
  function geocode(place) {
    var url =
      GEOCODING_URL +
      "?name=" +
      encodeURIComponent(place) +
      "&count=1" +
      "&language=en" +
      "&format=json";
    
    return getJson(url).then(function(data) {
      if (
        !data ||
        !data.results ||
        !data.results.length
      ) {
        throw new Error(
          "Location not found: " + place
        );
      }
      
      return data.results[0];
    });
  }
  
  function getForecast(location) {
    var current = [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m"
    ].join(",");
    
    var daily = [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "sunrise",
      "sunset"
    ].join(",");
    
    var url =
      FORECAST_URL +
      "?latitude=" +
      encodeURIComponent(location.latitude) +
      "&longitude=" +
      encodeURIComponent(location.longitude) +
      "&current=" +
      encodeURIComponent(current) +
      "&daily=" +
      encodeURIComponent(daily) +
      "&forecast_days=7" +
      "&temperature_unit=celsius" +
      "&wind_speed_unit=kmh" +
      "&precipitation_unit=mm" +
      "&timezone=auto";
    
    return getJson(url);
  }
  
  function description(code) {
    return (
      WEATHER_CODES[Number(code)] ||
      "Unknown conditions"
    );
  }
  
  function round(value) {
    var n = Number(value);
    
    if (!isFinite(n)) {
      return null;
    }
    
    return Math.round(n * 10) / 10;
  }
  
  function direction(degrees) {
    var n = Number(degrees);
    
    if (!isFinite(n)) {
      return "";
    }
    
    var directions = [
      "N",
      "NE",
      "E",
      "SE",
      "S",
      "SW",
      "W",
      "NW"
    ];
    
    return directions[
      Math.round(n / 45) % 8
    ];
  }
  
  function parse(prompt) {
    var text =
      String(prompt || "").trim();
    
    var patterns = [
      /weather\s+(?:in|for|at|near)\s+(.+)/i,
      /forecast\s+(?:in|for|at|near)\s+(.+)/i,
      /temperature\s+(?:in|for|at|near)\s+(.+)/i,
      /conditions\s+(?:in|for|at|near)\s+(.+)/i,
      /will\s+it\s+rain\s+(?:in|at|near)\s+(.+)/i,
      /what(?:'s| is)\s+(?:the\s+)?weather\s+(?:in|for|at|near)\s+(.+)/i
    ];
    
    var i;
    var match;
    var location;
    
    for (i = 0; i < patterns.length; i += 1) {
      match = text.match(patterns[i]);
      
      if (match && match[1]) {
        location = match[1]
          .replace(
            /\s+(today|tonight|tomorrow|this week|this weekend|next week)$/i,
            ""
          )
          .trim();
        
        if (location) {
          return location;
        }
      }
    }
    
    return "";
  }
  
  function shouldRun(prompt) {
    return (
      isActive() &&
      !!parse(prompt)
    );
  }
  
  function run(prompt) {
    var place = parse(prompt);
    
    if (!place) {
      return Promise.reject(
        new Error(
          "I couldn't determine the weather location."
        )
      );
    }
    
    return geocode(place).then(function(location) {
      return getForecast(location).then(function(data) {
        return {
          location: location,
          forecast: data
        };
      });
    });
  }
  
  function formatContext(result) {
    var location = result.location;
    var data = result.forecast;
    var current = data.current || {};
    var daily = data.daily || {};
    
    var lines = [];
    
    lines.push(
      "Live weather data from Open-Meteo."
    );
    
    lines.push(
      "Location: " +
      location.name +
      (
        location.admin1 ?
        ", " + location.admin1 :
        ""
      ) +
      (
        location.country ?
        ", " + location.country :
        ""
      )
    );
    
    lines.push(
      "Timezone: " +
      (data.timezone || location.timezone || "")
    );
    
    lines.push(
      "Current conditions: " +
      round(current.temperature_2m) +
      "°C, " +
      description(current.weather_code) +
      ", feels like " +
      round(current.apparent_temperature) +
      "°C."
    );
    
    lines.push(
      "Humidity: " +
      round(current.relative_humidity_2m) +
      "%."
    );
    
    lines.push(
      "Wind: " +
      round(current.wind_speed_10m) +
      " km/h " +
      direction(current.wind_direction_10m) +
      ", gusts " +
      round(current.wind_gusts_10m) +
      " km/h."
    );
    
    lines.push(
      "Precipitation: " +
      round(current.precipitation) +
      " mm."
    );
    
    lines.push("");
    lines.push("7-day forecast:");
    
    if (Array.isArray(daily.time)) {
      daily.time.forEach(function(date, index) {
        lines.push(
          date +
          ": " +
          description(
            daily.weather_code &&
            daily.weather_code[index]
          ) +
          ", high " +
          round(
            daily.temperature_2m_max &&
            daily.temperature_2m_max[index]
          ) +
          "°C, low " +
          round(
            daily.temperature_2m_min &&
            daily.temperature_2m_min[index]
          ) +
          "°C, precipitation probability " +
          round(
            daily.precipitation_probability_max &&
            daily.precipitation_probability_max[index]
          ) +
          "%, precipitation " +
          round(
            daily.precipitation_sum &&
            daily.precipitation_sum[index]
          ) +
          " mm."
        );
      });
    }
    
    return lines.join("\n");
  }
  
  function bind() {
    var button =
      byId("weather-tool-button");
    
    if (!button) {
      return;
    }
    
    button.onclick = function() {
      toggle();
    };
    
    button.onkeydown = function(event) {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        toggle();
      }
    };
  }
  
  window.TibUITools.register(
    "weather",
    {
      init: init,
      updateUI: updateUI,
      toggle: toggle,
      isActive: isActive,
      shouldRun: shouldRun,
      run: run,
      formatContext: formatContext,
      extractLocation: parse
    }
  );
})(window);