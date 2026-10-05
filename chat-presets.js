(function (window) {
  "use strict";
  var options;
  var storageKey = "tibui_presets_v1";
  var lastStorage = "";
  var storageLoaded = false;
  var keys = [
    "systemPrompt",
    "autoTools",
    "smartTools",
    "ollamaUrl",
    "ollamaTemperature",
    "ollamaTopP",
    "ollamaContext",
    "ollamaSeed",
    "ollamaKeepAlive",
    "customUrl",
    "customTemperature",
    "hordeSafety",
    "hordeImageSize",
    "hordeImageSampler",
    "hordeImageSteps",
    "hordeImageGuidance",
    "hordeImageKarras",
    "hordeImageSeed",
    "wikipediaLanguage",
    "wikipediaResultsCount",
    "historyLimit"
  ];
  function node(id) {
    return options.byId(id);
  }
  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function clean(raw) {
    if (
      !raw ||
      !raw.name ||
      typeof raw.name !== "string" ||
      !/^(chat|pollinations|hordeText|hordeImage|ollama|custom)$/.test(
        raw.provider
      )
    ) {
      throw new Error("Invalid preset.");
    }
    var value = {
      id: String(raw.id || options.makeId()).substring(0, 100),
      name: raw.name.substring(0, 80),
      favorite: raw.favorite === true,
      provider: raw.provider,
      model: String(raw.model || "").substring(0, 200),
      systemPrompt: String(raw.systemPrompt || "").substring(0, 16000),
      contextMode: /^(entire|recent|summary)$/.test(raw.contextMode)
        ? raw.contextMode
        : "recent",
      contextLimit: Math.max(
        512,
        Math.min(2000000, Number(raw.contextLimit) || 8192)
      ),
      recentCount: Math.max(2, Math.min(100, Number(raw.recentCount) || 12)),
      settings: {},
      tools: {},
      policies: {}
    };
    keys.forEach(function (key) {
      if (raw.settings && typeof raw.settings[key] !== "undefined") {
        var setting = raw.settings[key];
        if (
          setting === null ||
          typeof setting === "boolean" ||
          typeof setting === "number" ||
          typeof setting === "string"
        ) {
          value.settings[key] =
            typeof setting === "string" ? setting.substring(0, 16000) : setting;
        }
      }
    });
    window.TibUITools.list().forEach(function (tool) {
      value.tools[tool.id] = !!(raw.tools && raw.tools[tool.id]);
      if (
        raw.policies &&
        /^(auto|manual|ask|disabled)$/.test(raw.policies[tool.id])
      ) {
        value.policies[tool.id] = raw.policies[tool.id];
      }
    });
    return value;
  }
  function builtins() {
    return [
      {
        id: "builtin-coding",
        name: "Coding",
        provider: "chat",
        model: "gpt-4o",
        systemPrompt:
          "Help write and review clear, correct code. Ask about missing requirements and explain relevant tradeoffs.",
        tools: { github: true },
        policies: { github: "manual" },
        settings: {
          autoTools: false,
          smartTools: true,
          ollamaTemperature: 0.2
        },
        contextMode: "recent",
        contextLimit: 8192
      },
      {
        id: "builtin-research",
        name: "Research",
        provider: "chat",
        model: "gpt-4o",
        systemPrompt:
          "Use research sources and cite them. Distinguish paper metadata, abstracts and full text. Explain uncertainty and limitations.",
        tools: { research: true },
        settings: { autoTools: false, smartTools: true },
        contextMode: "recent",
        contextLimit: 16384
      },
      {
        id: "builtin-fast-local",
        name: "Fast local",
        provider: "ollama",
        model: options.state.ollamaModel,
        systemPrompt: "Answer briefly and directly.",
        settings: {
          autoTools: false,
          smartTools: false,
          ollamaContext: 4096,
          ollamaTemperature: 0.3
        },
        contextMode: "recent",
        recentCount: 6,
        contextLimit: 4096
      },
      {
        id: "builtin-deep-research",
        name: "Deep research",
        provider: "chat",
        model: "gpt-4o",
        systemPrompt:
          "Investigate with available sources. Compare evidence, cite sources, identify disagreements and avoid claims unsupported by retrieved material.",
        tools: { research: true, wikipedia: true },
        settings: { autoTools: true, smartTools: true },
        contextMode: "summary",
        contextLimit: 32768
      },
      {
        id: "builtin-estonian",
        name: "Estonian",
        provider: "chat",
        model: "gpt-4o",
        systemPrompt:
          "Vasta eesti keeles. Kasuta selget ja loomulikku eesti keelt ning säilita allikate täpsus.",
        settings: { autoTools: false, smartTools: false },
        contextMode: "recent",
        contextLimit: 8192
      }
    ].map(function (item) {
      var value = clean(item);
      value.builtin = true;
      value.favorite = options.state.presetFavorites.indexOf(value.id) >= 0;
      return value;
    });
  }
  function all() {
    return builtins().concat(options.state.presets);
  }
  function selected() {
    var id = node("chat-preset").value;
    return all().filter(function (item) {
      return item.id === id;
    })[0];
  }
  function update() {
    var select = node("chat-preset");
    var current = select.value;
    select.textContent = "";
    var initial = document.createElement("option");
    initial.value = "";
    initial.textContent = "Choose a preset";
    select.appendChild(initial);
    all()
      .sort(function (a, b) {
        return Number(b.favorite) - Number(a.favorite);
      })
      .forEach(function (preset) {
        var item = document.createElement("option");
        item.value = preset.id;
        item.textContent = (preset.favorite ? "★ " : "") + preset.name;
        select.appendChild(item);
      });
    select.value = current;
    if (select.selectedIndex < 0) {
      select.value = "";
    }
    var value = selected();
    node("apply-preset").disabled = !value;
    node("favorite-preset").disabled = !value;
    node("delete-preset").disabled = !value || value.builtin;
    node("favorite-preset").textContent =
      value && value.favorite ? "★ Favorite" : "☆ Favorite";
  }
  function allowed() {
    if (options.isSending() || window.TibUIWorkspace.busy()) {
      node("preset-status").textContent =
        "Finish or cancel the request before changing presets.";
      return false;
    }
    return true;
  }
  function capture(name) {
    options.syncStateFromInputs();
    var current = options.getChat();
    var value = {
      id: options.makeId(),
      name: name,
      provider: options.state.provider,
      model: options.currentModel(),
      systemPrompt: current.systemPrompt || "",
      contextMode: current.contextMode || "recent",
      contextLimit: current.contextLimit || 8192,
      recentCount: current.recentCount || options.state.historyLimit,
      tools: window.TibUITools.selection(),
      policies: copy(options.state.toolPolicies),
      settings: {}
    };
    keys.forEach(function (key) {
      value.settings[key] = options.state[key];
    });
    return clean(value);
  }
  window.TibUIPresets = {
    init: function (context) {
      options = context;
      options.state.presets = Array.isArray(options.state.presets)
        ? options.state.presets.map(clean).slice(0, 20)
        : [];
      options.state.presetFavorites = Array.isArray(
        options.state.presetFavorites
      )
        ? options.state.presetFavorites
        : [];
      if (options.state.saveChats) {
        try {
          var encoded = window.localStorage.getItem(storageKey);
          if (encoded) {
            if (encoded.length > 1000000) {
              throw new Error("Saved presets too large.");
            }
            var saved = JSON.parse(encoded);
            if (!Array.isArray(saved) || saved.length > 20) {
              throw new Error("Invalid saved presets.");
            }
            options.state.presets = saved.map(clean);
          }
        } catch (ignore) {
          node("preset-status").textContent =
            "Saved presets could not be read. Import a preset export to restore them.";
        }
      }
      storageLoaded = true;
      node("chat-preset").onchange = update;
      node("apply-preset").onclick = function () {
        if (!allowed()) {
          return;
        }
        var value = selected();
        if (!value) {
          return;
        }
        var current = options.getChat();
        if (
          typeof value.settings.customUrl === "string" &&
          value.settings.customUrl !== options.state.customUrl
        ) {
          node("custom-key").value = "";
        }
        keys.forEach(function (key) {
          if (typeof value.settings[key] !== "undefined") {
            options.state[key] = value.settings[key];
          }
        });
        current.systemPrompt = value.systemPrompt;
        current.contextMode = value.contextMode;
        current.contextLimit = value.contextLimit;
        current.recentCount = value.recentCount;
        window.TibUITools.applySelection(value.tools, copy(value.policies));
        options.chooseModel(value.provider, value.model);
        options.refreshSettings();
        options.saveState();
        window.TibUIWorkspace.update();
        node("preset-status").textContent = "Applied " + value.name + ".";
      };
      node("save-preset").onclick = function () {
        if (!allowed()) {
          return;
        }
        var name = window.prompt("Save current configuration as preset");
        if (!name || !name.trim()) {
          return;
        }
        name = name.trim().substring(0, 80);
        var value = capture(name);
        var existing = options.state.presets.filter(function (item) {
          return item.name === name;
        })[0];
        if (existing) {
          value.id = existing.id;
          value.favorite = existing.favorite;
          options.state.presets = options.state.presets.map(function (item) {
            return item === existing ? value : item;
          });
        } else {
          if (options.state.presets.length >= 20) {
            node("preset-status").textContent =
              "Use up to 20 custom presets. Export and remove a preset before adding another.";
            return;
          }
          options.state.presets.push(value);
        }
        options.saveState();
        update();
        node("chat-preset").value = value.id;
        update();
        node("preset-status").textContent = "Saved " + name + ".";
      };
      node("favorite-preset").onclick = function () {
        var value = selected();
        if (!value) {
          return;
        }
        if (value.builtin) {
          var index = options.state.presetFavorites.indexOf(value.id);
          if (index >= 0) {
            options.state.presetFavorites.splice(index, 1);
          } else {
            options.state.presetFavorites.push(value.id);
          }
        } else {
          value.favorite = !value.favorite;
        }
        options.saveState();
        update();
      };
      node("delete-preset").onclick = function () {
        var value = selected();
        if (!value || value.builtin) {
          return;
        }
        options.state.presets = options.state.presets.filter(function (item) {
          return item.id !== value.id;
        });
        options.saveState();
        update();
        node("preset-status").textContent = "Preset removed. Chats were kept.";
      };
      node("export-presets").onclick = function () {
        window.TibUIFiles.download(
          JSON.stringify(
            {
              format: "tibui-presets",
              version: 1,
              presets: options.state.presets,
              presetFavorites: options.state.presetFavorites
            },
            null,
            2
          ),
          "tibui-presets.json",
          "application/json"
        );
      };
      node("import-presets").onclick = function () {
        node("preset-file").click();
      };
      node("preset-file").onchange = function () {
        var file = this.files[0];
        this.value = "";
        if (!file) {
          return;
        }
        if (file.size > 1000000) {
          node("preset-status").textContent =
            "Preset imports must be smaller than 1 MB.";
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(String(reader.result));
            if (
              data.format !== "tibui-presets" ||
              data.version !== 1 ||
              !Array.isArray(data.presets) ||
              data.presets.length + options.state.presets.length > 20
            ) {
              throw new Error(
                "Choose a TibUI preset export with up to 20 custom presets in total."
              );
            }
            var values = data.presets.map(clean);
            values.forEach(function (value) {
              value.id = options.makeId();
            });
            options.state.presets = options.state.presets.concat(values);
            if (Array.isArray(data.presetFavorites)) {
              data.presetFavorites.slice(0, 5).forEach(function (id) {
                if (
                  /^builtin-/.test(id) &&
                  options.state.presetFavorites.indexOf(id) < 0
                ) {
                  options.state.presetFavorites.push(id);
                }
              });
            }
            options.saveState();
            update();
            node("preset-status").textContent =
              "Imported " +
              values.length +
              " presets; existing presets were kept.";
          } catch (error) {
            node("preset-status").textContent = error.message;
          }
        };
        reader.onerror = function () {
          node("preset-status").textContent = "Could not read preset file.";
        };
        reader.readAsText(file);
      };
      update();
    },
    saveStorage: function (enabled) {
      if (!options || !storageLoaded) {
        return;
      }
      var encoded = enabled ? JSON.stringify(options.state.presets) : "";
      var signature = String(enabled) + encoded;
      if (signature === lastStorage) {
        return;
      }
      lastStorage = signature;
      try {
        if (enabled) {
          window.localStorage.setItem(storageKey, encoded);
        } else {
          window.localStorage.removeItem(storageKey);
        }
      } catch (ignore) {
        node("preset-status").textContent =
          "Browser storage is unavailable. Export presets to keep them.";
      }
    }
  };
})(window);
