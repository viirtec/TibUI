(function (window) {
  "use strict";
  var base = "https://aihorde.net/api/v2/status/models";
  var cache = {};
  var liveRequests = {};
  function request(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = 20000;
      xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(
            new Error("Horde model lookup failed (HTTP " + xhr.status + ").")
          );
          return;
        }
        try {
          var data = JSON.parse(xhr.responseText);
          if (!Array.isArray(data)) {
            throw new Error("Invalid Horde model list.");
          }
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      xhr.onerror = xhr.ontimeout = function () {
        reject(new Error("Could not load Horde models."));
      };
      xhr.send(null);
    });
  }
  window.TibUIHordeModels = {
    load: function (type, force) {
      var entry = cache[type] || (cache[type] = {});
      var now = new Date().getTime();
      if (entry.pending) {
        return entry.pending;
      }
      if (!force && entry.data && now - entry.time < 120000) {
        return Promise.resolve(entry.data);
      }
      if (!force && entry.retryAfter > now) {
        return Promise.reject(entry.error);
      }
      entry.pending = request(
        base + "?type=" + encodeURIComponent(type) + "&_=" + now
      ).then(
        function (data) {
          entry.data = data;
          entry.time = new Date().getTime();
          entry.retryAfter = 0;
          entry.pending = null;
          return data;
        },
        function (error) {
          entry.pending = null;
          entry.error = error;
          entry.retryAfter = new Date().getTime() + 15000;
          throw error;
        }
      );
      return entry.pending;
    },
    live: function (name) {
      var key = "model:" + name;
      if (liveRequests[key]) {
        return liveRequests[key];
      }
      liveRequests[key] = request(
        base + "/" + encodeURIComponent(name) + "?_=" + new Date().getTime()
      ).then(
        function (data) {
          delete liveRequests[key];
          return data;
        },
        function (error) {
          delete liveRequests[key];
          throw error;
        }
      );
      return liveRequests[key];
    }
  };
})(window);
