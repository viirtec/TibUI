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
    generationTool: true,
    matches: function (prompt) {
      return /^(?:draw\s+|(?:generate|create|make)\s+(?:an?\s+)?(?:image|picture|illustration)\b)/i.test(
        prompt
      );
    },
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
    setActive: function (active) {
      if (active) {
        options.state.previousTextProvider = options.state.provider;
        options.changeProvider("hordeImage");
      } else {
        options.changeProvider(options.state.previousTextProvider || "chat");
      }
    }
  });
})(window);
