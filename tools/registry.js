(function (window) {
  "use strict";

  window.TibUITools = window.TibUITools || {};

  window.TibUITools.register = function (name, tool) {
    window.TibUITools[name] = tool;
  };
})(window);
