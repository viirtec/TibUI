(function (window) {
  "use strict";
  var entries = [];
  var options;
  var callbacks = [];
  var loaded = false;
  var automatic = [];
  var registry = (window.TibUITools = {});

  registry.register = function (id, tool) {
    tool.id = id;
    registry[id] = tool;
    entries.push(tool);
  };

  registry.ready = function (callback) {
    if (loaded) {
      callback();
    } else {
      callbacks.push(callback);
    }
  };

  registry.prepare = function (state) {
    entries.forEach(function (tool) {
      if (tool.activeKey && typeof state[tool.activeKey] !== "boolean") {
        state[tool.activeKey] = false;
      }
    });
  };

  registry.init = function (context) {
    options = context;
    entries.forEach(function (tool) {
      if (
        tool.activeKey &&
        typeof options.state[tool.activeKey] !== "boolean"
      ) {
        options.state[tool.activeKey] = false;
      }
      if (tool.init) {
        tool.init(options);
      }
      if (!tool.name) {
        return;
      }
      var label = document.createElement("label");
      label.className = "tool-switch";
      var text = document.createElement("span");
      text.textContent = tool.name;
      var input = document.createElement("input");
      input.type = "checkbox";
      input.id = "tool-" + tool.id;
      input.setAttribute("role", "switch");
      input.onchange = function () {
        if (tool.setActive) {
          tool.setActive(input.checked);
        } else {
          options.state[tool.activeKey] = input.checked;
        }
        registry.updateUI();
        options.saveState();
      };
      label.appendChild(text);
      label.appendChild(input);
      options.byId("tool-switches").appendChild(label);
    });
    var button = options.byId("tools-button");
    var panel = options.byId("tools-menu");
    function close() {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
    button.onclick = function () {
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
      if (!panel.hidden) {
        panel.querySelector("input").focus();
      }
    };
    document.addEventListener(
      "click",
      function (event) {
        if (
          !panel.contains(event.target) &&
          !button.contains(event.target) &&
          !options.byId("enabled-tools").contains(event.target)
        ) {
          close();
        }
      },
      false
    );
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape" && !panel.hidden) {
          close();
          button.focus();
        }
      },
      false
    );
    registry.updateUI();
  };

  registry.updateUI = function () {
    if (!options) {
      return;
    }
    var count = 0;
    if (!options.state.autoTools || options.state.provider === "hordeImage") {
      automatic = [];
    }
    var enabled = options.byId("enabled-tools");
    enabled.textContent = "";
    entries.forEach(function (tool) {
      if (tool.updateUI) {
        tool.updateUI();
      }
      var input = options.byId("tool-" + tool.id);
      if (!input) {
        return;
      }
      var available = !tool.enabledKey || options.state[tool.enabledKey];
      input.disabled =
        !available ||
        (tool.contextTool && options.state.provider === "hordeImage");
      input.checked = tool.isActive
        ? !!tool.isActive()
        : !!options.state[tool.activeKey];
      var auto = !input.disabled && automatic.indexOf(tool.id) >= 0;
      if (input.checked || auto) {
        count += 1;
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "enabled-tool";
        chip.textContent =
          tool.name + (auto && !input.checked ? " · auto" : "");
        chip.setAttribute("aria-label", "Manage " + tool.name);
        chip.onclick = function () {
          options.byId("tools-menu").hidden = false;
          options.byId("tools-button").setAttribute("aria-expanded", "true");
          input.focus();
        };
        enabled.appendChild(chip);
      }
    });
    options
      .byId("tools-button")
      .setAttribute(
        "aria-label",
        "Tools" + (count ? ", " + count + " enabled" : "")
      );
    options.setClass(options.byId("tools-button"), "active", count > 0);
  };

  registry.preparePrompt = function (prompt) {
    if (!options.state.autoTools) {
      return;
    }
    entries.forEach(function (tool) {
      if (
        tool.generationTool &&
        tool.matches &&
        tool.matches(prompt) &&
        !tool.isActive()
      ) {
        tool.setActive(true);
      }
    });
  };

  registry.run = function (prompt, cancelled) {
    automatic = [];
    var selected = entries.filter(function (tool) {
      if (
        !tool.contextTool ||
        options.state.provider === "hordeImage" ||
        (tool.enabledKey && !options.state[tool.enabledKey])
      ) {
        return false;
      }
      var manual = tool.isActive();
      var auto =
        options.state.autoTools && tool.matches && tool.matches(prompt);
      if (auto && !manual) {
        automatic.push(tool.id);
      }
      return manual || auto;
    });
    registry.updateUI();
    var result = { context: "", sources: [], warnings: [] };
    var chain = Promise.resolve();
    selected.forEach(function (tool) {
      chain = chain.then(function () {
        if (cancelled()) {
          throw new Error("Request cancelled.");
        }
        if (tool.shouldRun && !tool.shouldRun(prompt)) {
          return;
        }
        options.byId("request-status").textContent = "Using " + tool.name + "…";
        return tool
          .run(prompt, cancelled)
          .then(function (data) {
            var context = tool.formatContext(data);
            if (context) {
              result.context += (result.context ? "\n\n" : "") + context;
            }
            if (data.results) {
              result.sources = result.sources.concat(data.results);
            }
          })
          .catch(function (error) {
            if (error.message === "Request cancelled.") {
              throw error;
            }
            if (tool.required) {
              throw new Error(tool.name + " lookup failed: " + error.message);
            }
            result.warnings.push(tool.name + ": " + error.message);
          });
      });
    });
    return chain.then(function () {
      return result;
    });
  };

  function load(index) {
    var files = window.TibUIToolFiles || [];
    if (index >= files.length) {
      loaded = true;
      callbacks.forEach(function (callback) {
        callback();
      });
      return;
    }
    var script = document.createElement("script");
    script.src = "tools/" + files[index];
    script.onload = function () {
      load(index + 1);
    };
    script.onerror = function () {
      document.getElementById("request-status").textContent =
        "Could not load tool: " + files[index];
      load(index + 1);
    };
    document.head.appendChild(script);
  }
  load(0);
})(window);
