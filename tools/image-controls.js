(function (window) {
  "use strict";

  window.TibUITools = window.TibUITools || {};

  var state = null;
  var byId = null;
  var setClass = null;
  var refreshImageModels = null;

  var open = false;

  function init(options) {
    state = options.state;
    byId = options.byId;
    setClass = options.setClass;
    refreshImageModels =
      options.refreshImageModels;

    bind();
    updateLabels();
    setOpen(false);
  }

  function isAvailable() {
    return state.provider === "hordeImage";
  }

  function setAvailable(available) {
    var button =
      byId("image-controls-button");

    if (!button) {
      return;
    }

    button.hidden = !available;

    if (!available) {
      setOpen(false);
    }
  }

  function setOpen(value) {
    open =
      state.provider === "hordeImage" &&
      !!value;

    var panel =
      byId("image-advanced");

    var button =
      byId("image-controls-button");

    if (panel) {
      panel.hidden = !open;
    }

    if (button) {
      button.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );

      setClass(
        button,
        "active",
        open
      );
    }
  }

  function isOpen() {
    return open;
  }

  function updateLabels() {
    var steps =
      byId("horde-image-steps");

    var guidance =
      byId("horde-image-guidance");

    var stepsValue =
      byId("horde-image-steps-value");

    var guidanceValue =
      byId("horde-image-guidance-value");

    if (steps && stepsValue) {
      stepsValue.textContent =
        steps.value;
    }

    if (guidance && guidanceValue) {
      guidanceValue.textContent =
        guidance.value;
    }
  }

  function bind() {
    var button =
      byId("image-controls-button");

    var close =
      byId("close-image-controls");

    var steps =
      byId("horde-image-steps");

    var guidance =
      byId("horde-image-guidance");

    var safety =
      byId("horde-safety");

    if (button) {
      button.onclick = function () {
        setOpen(!open);
      };
    }

    if (close) {
      close.onclick = function () {
        setOpen(false);

        if (button) {
          button.focus();
        }
      };
    }

    if (steps) {
      steps.oninput = updateLabels;
    }

    if (guidance) {
      guidance.oninput = updateLabels;
    }

    if (safety) {
      safety.onchange = function () {
        state.hordeSafety =
          this.checked;

        if (refreshImageModels) {
          refreshImageModels();
        }
      };
    }
  }

  window.TibUITools.register(
    "imageControls",
    {
      init: init,
      setOpen: setOpen,
      isOpen: isOpen,
      setAvailable: setAvailable,
      updateLabels: updateLabels,
      isAvailable: isAvailable,
    }
  );
})(window);
