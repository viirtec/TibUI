(function (window) {
  "use strict";
  var cache = {};
  var fields =
    "cht chd chds choe chld chxr chof chs chdl chdls chg chco chtt chts chxt chxl chxs chm chls chl chlps chma chdlp chf chbr chan chli icff icfs iclocale icqrb icqrf chbh chxp chdh chdp".split(
      " "
    );
  function parse(query) {
    var value = JSON.parse(query);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Charts needs a JSON chart specification.");
    }
    var parameters = {};
    var endpoint = "https://image-charts.com/chart";
    if (value.chart) {
      if (
        typeof value.chart !== "object" ||
        !value.chart.type ||
        !value.chart.data
      ) {
        throw new Error("A Chart.js specification needs type and data.");
      }
      var config = JSON.stringify(value.chart);
      if (/function\s*\(|=>|https?:\/\//i.test(config)) {
        throw new Error(
          "Charts accepts JSON data, without functions or external assets."
        );
      }
      endpoint += ".js/2.8.0";
      parameters.c = config;
      parameters.width = Math.max(
        100,
        Math.min(999, Number(value.width) || 700)
      );
      parameters.height = Math.max(
        100,
        Math.min(999, Number(value.height) || 400)
      );
      if (typeof value.background === "string") {
        parameters.bkg = value.background.substring(0, 100);
      }
    } else {
      var native = value.parameters || value;
      fields.forEach(function (key) {
        if (
          typeof native[key] === "string" ||
          typeof native[key] === "number"
        ) {
          parameters[key] = String(native[key]);
        }
      });
      if (!parameters.cht || (!parameters.chd && !parameters.chl)) {
        throw new Error(
          "Native charts needs cht and chd, or chl for QR/Graphviz."
        );
      }
      parameters.chs = parameters.chs || "700x400";
      if (
        !/^\d{2,4}x\d{2,4}$/.test(parameters.chs) ||
        parameters.chs.split("x").some(function (size) {
          return Number(size) > 999 || Number(size) < 10;
        })
      ) {
        throw new Error("Chart dimensions must be between 10 and 999 pixels.");
      }
    }
    var body = Object.keys(parameters)
      .map(function (key) {
        return (
          encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
        );
      })
      .join("&");
    if ((endpoint + "?" + body).length > 2000) {
      throw new Error(
        "Chart exceeds the free API URL limit. Use fewer data points, shorter labels or compact native encoding."
      );
    }
    return {
      endpoint: endpoint,
      body: body,
      title: String(value.title || parameters.chtt || "Chart").substring(0, 200)
    };
  }
  function run(query, cancelled) {
    if (cancelled && cancelled()) {
      return Promise.reject(new Error("Request cancelled."));
    }
    var spec;
    try {
      spec = parse(query);
    } catch (error) {
      return Promise.reject(error);
    }
    var key = spec.endpoint + spec.body;
    if (cache[key] && Date.now() - cache[key].time < 300000) {
      return Promise.resolve(cache[key].data);
    }
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var reader;
      var finished = false;
      var timer = window.setInterval(function () {
        if (cancelled && cancelled()) {
          xhr.abort();
          if (reader && reader.readyState === 1) {
            reader.abort();
          }
          finish(new Error("Request cancelled."));
        }
      }, 100);
      function finish(error, data) {
        if (finished) {
          return;
        }
        finished = true;
        window.clearInterval(timer);
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      }
      xhr.open("GET", spec.endpoint + "?" + spec.body, true);
      xhr.timeout = 25000;
      xhr.responseType = "blob";

      xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) {
          finish(
            new Error(
              "Image-Charts returned HTTP " +
                xhr.status +
                (xhr.status === 429 ? ": free-tier rate limit reached." : ".")
            )
          );
          return;
        }
        var blob = xhr.response;
        if (
          !blob ||
          !/^image\/(png|gif|jpeg)$/.test(blob.type) ||
          blob.size > 2000000
        ) {
          finish(
            new Error(
              "Image-Charts returned an unsupported or oversized image."
            )
          );
          return;
        }
        reader = new FileReader();
        reader.onerror = function () {
          finish(new Error("Unable to read chart image."));
        };
        reader.onload = function () {
          if (cancelled && cancelled()) {
            finish(new Error("Request cancelled."));
            return;
          }
          var data = {
            charts: [{ image: reader.result, title: spec.title }],
            results: [
              { title: "Image-Charts", url: "https://www.image-charts.com/" }
            ],
            title: spec.title,
            specification: JSON.parse(query)
          };
          if (Object.keys(cache).length >= 10) {
            cache = {};
          }
          cache[key] = { time: Date.now(), data: data };
          finish(null, data);
        };
        reader.readAsDataURL(blob);
      };
      xhr.onerror = function () {
        finish(
          new Error(
            "Image-Charts could not be reached. Check connectivity and browser access."
          )
        );
      };
      xhr.ontimeout = function () {
        finish(new Error("Image-Charts request timed out."));
      };
      xhr.onabort = function () {
        finish(new Error("Request cancelled."));
      };
      xhr.send(null);
    });
  }
  window.TibUITools.register("charts", {
    name: "Charts",
    group: "Generate",
    activeKey: "chartsToolActive",
    contextTool: true,
    resultDependent: true,
    maxQueries: 1,
    maxQueryLength: 290000,
    planningHint:
      'Generate a chart with Image-Charts free API. Return a JSON STRING with {"title":"caption","chart":{"type":"bar","data":{"labels":["A","B"],"datasets":[{"label":"Values","data":[10,20]}]},"options":{}},"width":700,"height":400,"background":"white"}. All JSON-compatible Chart.js 2.8.0 dataset and options configuration is supported: line, bar, horizontalBar, pie, doughnut, radar, polarArea, bubble, scatter, mixed charts; axes, stacked series, scales, ticks, legends, titles, colors, fonts, fills, borders, tension, points and datalabels. Alternatively use {"title":"caption","parameters":{...}} with native parameters: ' +
      fields.join(", ") +
      ". Native chart types include lc/ls/lxy lines, bvg/bvs/bhg/bhs bars, p/p3/pc pies, r/rs radar, v Venn, qr QR and gv Graphviz. Native parameters cover text/simple/extended/awesome data encoding and scaling, size, labels, axes and ranges, colors, backgrounds/gradients, legends, grid, markers, line styles, margins, rounded bars, animation (chan), QR options, font and locale. Use only documented combinations; PNG for ordinary charts, GIF for animation. Free images have a watermark and a 10/minute rate limit. No account/signature/retina enterprise parameters, functions or remote assets. Use factual numbers from the conversation or tool results; never invent actual measurements. Clearly identify user-requested illustrative data. Ask for missing data rather than fabricate it. Match the requested chart, language, series, units, appearance and dimensions; max 999 pixels per dimension. Free API supports only GET; encoded URL must fit 2000 characters. Prefer compact native encoding for larger datasets and shorten unnecessary styling; never silently discard requested data.",
    validateQuery: function (query) {
      try {
        parse(query);
        return true;
      } catch (ignore) {
        return false;
      }
    },
    run: run,
    formatContext: function (data) {
      return (
        "Chart generated and attached to this answer: " +
        data.title +
        ". Image-Charts free watermarked image. Explain the chart using its actual input data; do not claim independently verified facts. Specification: " +
        JSON.stringify(data.specification)
      );
    }
  });
})(window);
