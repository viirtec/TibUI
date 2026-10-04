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
  window.TibUITools.register("imageControls", {
    name: "Image generation",
    planningHint:
      "Return one improved image-generation prompt preserving the requested subjects, style and constraints. Do not answer the user or add unrelated subjects.",
    generationTool: true,
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
