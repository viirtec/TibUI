(function (window) {
  "use strict";
  var options;
  function updateLabels() {
    options.byId("horde-image-steps-value").textContent =
      options.byId("horde-image-steps").value;
    options.byId("horde-image-guidance-value").textContent = options.byId(
      "horde-image-guidance"
    ).value;
  }
  function waitOrder(a, b) {
    function value(record, key) {
      return typeof record[key] === "number" && isFinite(record[key])
        ? Math.max(0, record[key])
        : Infinity;
    }
    return (
      value(a, "eta") - value(b, "eta") ||
      value(a, "jobs") - value(b, "jobs") ||
      value(a, "queued") - value(b, "queued") ||
      b.count - a.count ||
      a.name.localeCompare(b.name)
    );
  }

  function prepareGeneration(prompt, cancelled, result, original) {
    if (!options.state.autoTools) {
      return Promise.resolve();
    }
    var candidates;
    var request = original || prompt;
    function check() {
      if (cancelled()) {
        throw new Error("Request cancelled.");
      }
    }
    return options
      .getImageModels()
      .then(function (models) {
        check();
        candidates = models
          .filter(function (model) {
            return model.count > 0;
          })
          .sort(waitOrder)
          .slice(0, 80);
        models.forEach(function (model) {
          if (
            model.count > 0 &&
            request.toLowerCase().indexOf(model.name.toLowerCase()) >= 0 &&
            candidates.indexOf(model) < 0 &&
            candidates.length < 84
          ) {
            candidates.push(model);
          }
        });
        if (!candidates.length) {
          throw new Error("No active image models are available.");
        }
        if (candidates.length === 1) {
          return { models: [candidates[0].name] };
        }
        options.byId("request-status").textContent = "Choosing an image model…";
        return options
          .modelRequest(
            'TibUI image model selection. Return only JSON: {"models":["exact model name"]}. ' +
              "Select at most eight models from the supplied catalog that best fit the requested subject, medium, style and quality. " +
              "Include only the best matching tier of suitable models; the application chooses the shortest reported wait within it. " +
              "If the user requests a specific available model, return only that model. Do not invent model names. " +
              "Image request: " +
              JSON.stringify(request) +
              "\nPrepared prompt: " +
              JSON.stringify(prompt) +
              "\n" +
              "Shape: " +
              options.state.hordeImageSize +
              "\n" +
              "Available active models: " +
              JSON.stringify(candidates)
          )
          .then(function (text) {
            check();
            text = String(text);
            if (text.length > 16000) {
              throw new Error("Image model plan is too large.");
            }
            return JSON.parse(
              text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
            );
          });
      })
      .then(function (plan) {
        check();
        var models =
          plan && Array.isArray(plan.models) ? plan.models.slice(0, 8) : [];
        var suitable = candidates
          .filter(function (model) {
            return models.indexOf(model.name) >= 0;
          })
          .sort(waitOrder);
        if (!suitable.length) {
          throw new Error(
            "The model returned no suitable available image models."
          );
        }
        options.selectImageModel(suitable[0].name);
      })
      .catch(function (error) {
        check();
        if (candidates && !candidates.length) {
          throw error;
        }
        if (candidates && candidates.length) {
          options.selectImageModel(candidates[0].name);
        }
        result.warnings.push(
          "Automatic image model selection: " +
            error.message +
            (candidates && candidates.length
              ? " Using the fastest available model."
              : " Keeping the selected model.")
        );
      });
  }

  window.TibUITools.register("imageControls", {
    name: "Image generation",
    planningHint:
      "Return one improved image-generation prompt preserving the requested subjects, style and constraints. Do not answer the user or add unrelated subjects.",
    generationTool: true,
    prepareGeneration: prepareGeneration,
    init: function (context) {
      options = context;
      options.byId("horde-image-steps").oninput = updateLabels;
      options.byId("horde-image-guidance").oninput = updateLabels;
      options.byId("horde-safety").onchange = function () {
        options.state.hordeSafety = this.checked;
        options.refreshImageModels();
      };
      updateLabels();
    },
    updateLabels: updateLabels,
    isActive: function () {
      return options.state.provider === "hordeImage";
    },
    setActive: function (active, preserveRequest) {
      if (active) {
        options.state.previousTextProvider = options.state.provider;
        options.changeProvider("hordeImage", preserveRequest);
      } else {
        options.changeProvider(
          options.state.previousTextProvider || "chat",
          preserveRequest
        );
      }
    }
  });
})(window);
