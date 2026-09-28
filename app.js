(function () {
  "use strict";

  var COOKIE = "tibui_state";
  var COOKIE_LIMIT = 3600;
  var state = {
    chats: [], activeId: "", provider: "chat", theme: "system", saveChats: false,
    systemPrompt: "", ollamaUrl: "http://localhost:11434", ollamaModel: "llama3.2",
    customUrl: "https://api.openai.com/v1", customModel: "gpt-4o-mini",
    pollinationsModel: "openai-fast", hordeModel: "stable_diffusion", hordeSafety: true
  };
  var pollinationsModels = [{ value: "openai-fast", label: "OpenAI Fast (anonymous)" }];
  var hordeModels = [{ value: "stable_diffusion", label: "Stable Diffusion", workers: 0, eta: 0 }];
  var activeRequest = null;

  function el(id) { return document.getElementById(id); }
  function trim(value) { return value.replace(/^\s+|\s+$/g, ""); }
  function makeId() { return "c" + new Date().getTime().toString(36) + Math.random().toString(36).slice(2, 7); }
  function newChat() { return { id: makeId(), title: "New chat", updated: new Date().getTime(), messages: [] }; }
  function clear(node) { while (node.firstChild) { node.removeChild(node.firstChild); } }

  function currentChat() {
    var i;
    for (i = 0; i < state.chats.length; i += 1) {
      if (state.chats[i].id === state.activeId) { return state.chats[i]; }
    }
    return null;
  }

  function readCookie() {
    var parts = document.cookie ? document.cookie.split(";") : [];
    var prefix = COOKIE + "=";
    var i;
    for (i = 0; i < parts.length; i += 1) {
      parts[i] = parts[i].replace(/^\s+/, "");
      if (parts[i].indexOf(prefix) === 0) { return parts[i].slice(prefix.length); }
    }
    return "";
  }

  function deleteCookie() { document.cookie = COOKIE + "=; Max-Age=0; Path=/; SameSite=Lax"; }

  function loadSavedState() {
    var raw = readCookie();
    var saved;
    var key;
    if (!raw) { return; }
    try {
      saved = JSON.parse(decodeURIComponent(raw));
      if (!saved || saved.v !== 1 || !saved.saveChats) { return; }
      for (key in state) {
        if (Object.prototype.hasOwnProperty.call(state, key) && typeof saved[key] !== "undefined") {
          state[key] = saved[key];
        }
      }
      state.saveChats = true;
    } catch (error) { deleteCookie(); }
  }

  function savedCopy() {
    return {
      v: 1, chats: state.chats, activeId: state.activeId, provider: state.provider,
      theme: state.theme, saveChats: true, systemPrompt: state.systemPrompt,
      ollamaUrl: state.ollamaUrl, ollamaModel: state.ollamaModel,
      customUrl: state.customUrl, customModel: state.customModel,
      pollinationsModel: state.pollinationsModel, hordeModel: state.hordeModel, hordeSafety: state.hordeSafety
    };
  }

  function saveState() {
    var data;
    var encoded;
    var active;
    var i;
    if (!state.saveChats) { return; }
    data = JSON.parse(JSON.stringify(savedCopy()));
    encoded = encodeURIComponent(JSON.stringify(data));
    while (encoded.length > COOKIE_LIMIT && data.chats.length > 1) {
      for (i = 0; i < data.chats.length; i += 1) {
        if (data.chats[i].id !== data.activeId) { data.chats.splice(i, 1); break; }
      }
      encoded = encodeURIComponent(JSON.stringify(data));
    }
    active = null;
    for (i = 0; i < data.chats.length; i += 1) {
      if (data.chats[i].id === data.activeId) { active = data.chats[i]; }
    }
    while (encoded.length > COOKIE_LIMIT && active && active.messages.length > 2) {
      active.messages.splice(0, 2);
      encoded = encodeURIComponent(JSON.stringify(data));
    }
    document.cookie = COOKIE + "=" + encoded + "; Max-Age=31536000; Path=/; SameSite=Lax";
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    el("theme").value = state.theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", state.theme === "dark" ? "#171815" : "#f6f6f3"); }
  }

  function renderList() {
    var list = el("chat-list");
    var chats = state.chats.slice(0);
    var row;
    var title;
    var remove;
    var i;
    clear(list);
    chats.sort(function (a, b) { return b.updated - a.updated; });
    if (!chats.length || (chats.length === 1 && !chats[0].messages.length)) {
      row = document.createElement("div"); row.className = "chat-empty"; row.textContent = "No saved conversations"; list.appendChild(row); return;
    }
    for (i = 0; i < chats.length; i += 1) {
      if (!chats[i].messages.length) { continue; }
      row = document.createElement("div"); row.className = "chat-item" + (chats[i].id === state.activeId ? " active" : "");
      title = document.createElement("button"); title.type = "button"; title.className = "chat-title";
      title.setAttribute("data-chat", chats[i].id); title.textContent = chats[i].title;
      remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-chat";
      remove.setAttribute("data-delete", chats[i].id); remove.setAttribute("aria-label", "Delete " + chats[i].title); remove.textContent = "×";
      row.appendChild(title); row.appendChild(remove); list.appendChild(row);
    }
  }

  function appendMessage(message, pending) {
    var wrap = document.createElement("article");
    var role = document.createElement("div");
    var content = document.createElement("div");
    var image;
    var link;
    wrap.className = "message " + message.role + (pending ? " pending" : "");
    role.className = "message-role"; role.textContent = message.role === "user" ? "You" : "Assistant";
    content.className = "message-content";
    if (pending) {
      content.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
      wrap.id = "pending-message";
    } else {
      if (message.content) { content.appendChild(document.createTextNode(message.content)); }
      if (message.imageUrl) {
        image = document.createElement("img"); image.className = "generated-image"; image.src = message.imageUrl;
        image.alt = message.prompt ? "Generated image: " + message.prompt : "Generated image"; image.loading = "lazy";
        link = document.createElement("a"); link.className = "image-link"; link.href = message.imageUrl;
        link.target = "_blank"; link.rel = "noopener"; link.textContent = "Open full image";
        content.appendChild(image); content.appendChild(link);
      }
    }
    wrap.appendChild(role); wrap.appendChild(content); el("messages").appendChild(wrap);
  }

  function scrollBottom() {
    window.setTimeout(function () { el("conversation").scrollTop = el("conversation").scrollHeight; }, 0);
  }

  function renderConversation() {
    var chat = currentChat();
    var i;
    clear(el("messages"));
    el("welcome").hidden = !!(chat && chat.messages.length);
    if (chat) { for (i = 0; i < chat.messages.length; i += 1) { appendMessage(chat.messages[i], false); } }
    scrollBottom();
  }

  function setOptions(node, options, chosen) {
    var option;
    var i;
    clear(node);
    for (i = 0; i < options.length; i += 1) {
      option = document.createElement("option"); option.value = options[i].value; option.textContent = options[i].label;
      if (option.value === chosen) { option.selected = true; }
      node.appendChild(option);
    }
  }

  function providerNote() {
    var model;
    var i;
    if (state.provider === "chat") { return "GPT-4o through ch.at. No API key is required."; }
    if (state.provider === "pollinations") { return "Pollinations' anonymous legacy text API. Free models are loaded live."; }
    if (state.provider === "horde") {
      model = null;
      for (i = 0; i < hordeModels.length; i += 1) { if (hordeModels[i].value === state.hordeModel) { model = hordeModels[i]; break; } }
      if (model && model.workers > 0) {
        return "Stable Horde: " + model.workers + " worker" + (model.workers === 1 ? "" : "s") + " available · current estimated ETA " + model.eta + "s · safety filter " + (state.hordeSafety ? "on" : "off") + ".";
      }
      return "Keyless image generation on Stable Horde. Live worker information is refreshing.";
    }
    if (state.provider === "ollama") { return "Local Ollama at " + state.ollamaUrl + ". Messages stay on that server."; }
    return "OpenAI-compatible chat. The optional key stays in memory and is never saved.";
  }

  function updateProvider() {
    var boxes = document.querySelectorAll(".provider-settings");
    var i;
    el("provider").value = state.provider;
    if (state.provider === "chat") { setOptions(el("model"), [{ value: "gpt-4o", label: "GPT-4o" }], "gpt-4o"); }
    else if (state.provider === "pollinations") { setOptions(el("model"), pollinationsModels, state.pollinationsModel); }
    else if (state.provider === "horde") { setOptions(el("model"), hordeModels, state.hordeModel); }
    else if (state.provider === "ollama") { setOptions(el("model"), [{ value: state.ollamaModel, label: state.ollamaModel }], state.ollamaModel); }
    else { setOptions(el("model"), [{ value: state.customModel, label: state.customModel }], state.customModel); }
    el("provider-note").textContent = providerNote(); el("provider-summary").textContent = providerNote();
    el("horde-model-info").textContent = state.provider === "horde" ? providerNote() : "";
    el("prompt-input").placeholder = state.provider === "horde" ? "Describe an image" : "Message TibUI";
    for (i = 0; i < boxes.length; i += 1) { boxes[i].hidden = boxes[i].getAttribute("data-provider") !== state.provider; }
    saveState();
  }

  function updatePrivacy() {
    el("privacy-label").innerHTML = "<span></span> " + (state.saveChats ? "Cookie saving enabled" : "Private session — not saved");
    el("save-chats").checked = state.saveChats;
  }

  function makeNewChat() {
    var chat = currentChat();
    if (!chat || chat.messages.length) { chat = newChat(); state.chats.push(chat); state.activeId = chat.id; }
    renderList(); renderConversation(); saveState(); closeMenu(); el("prompt-input").focus();
  }

  function removeChat(id) {
    var kept = [];
    var i;
    for (i = 0; i < state.chats.length; i += 1) { if (state.chats[i].id !== id) { kept.push(state.chats[i]); } }
    state.chats = kept;
    if (!state.chats.length) { state.chats.push(newChat()); }
    if (!currentChat()) { state.activeId = state.chats[0].id; }
    renderList(); renderConversation(); saveState();
  }

  function selectChat(id) { state.activeId = id; renderList(); renderConversation(); saveState(); closeMenu(); }
  function closeMenu() { document.body.classList.remove("menu-open"); }

  function readSettings() {
    var wasSaving = state.saveChats;
    state.theme = el("theme").value; state.saveChats = el("save-chats").checked;
    state.ollamaUrl = trim(el("ollama-url").value).replace(/\/+$/, "") || "http://localhost:11434";
    state.ollamaModel = trim(el("ollama-model").value) || "llama3.2";
    state.customUrl = trim(el("custom-url").value).replace(/\/+$/, "") || "https://api.openai.com/v1";
    state.customModel = trim(el("custom-model").value) || "gpt-4o-mini";
    state.systemPrompt = trim(el("system-prompt").value);
    state.hordeSafety = el("horde-safety").checked;
    if (!state.saveChats && wasSaving) { deleteCookie(); }
    applyTheme(); updatePrivacy(); updateProvider(); saveState();
  }

  function openSettings() {
    el("theme").value = state.theme; el("save-chats").checked = state.saveChats;
    el("ollama-url").value = state.ollamaUrl; el("ollama-model").value = state.ollamaModel;
    el("custom-url").value = state.customUrl; el("custom-model").value = state.customModel;
    el("horde-safety").checked = state.hordeSafety;
    el("system-prompt").value = state.systemPrompt; el("settings-status").textContent = "";
    updateProvider(); el("settings-modal").hidden = false; document.body.style.overflow = "hidden"; el("close-settings").focus();
  }

  function closeSettings() { el("settings-modal").hidden = true; document.body.style.overflow = ""; }

  function requestJson(method, url, body, headers, callback) {
    var xhr = new XMLHttpRequest();
    var finished = false;
    var key;
    function done(error, data) { if (finished) { return; } finished = true; callback(error, data); }
    xhr.open(method, url, true); xhr.timeout = 120000;
    if (body !== null) { xhr.setRequestHeader("Content-Type", "application/json"); }
    for (key in headers) { if (Object.prototype.hasOwnProperty.call(headers, key)) { xhr.setRequestHeader(key, headers[key]); } }
    xhr.onreadystatechange = function () {
      var data;
      var detail;
      if (xhr.readyState !== 4) { return; }
      try { data = xhr.responseText ? JSON.parse(xhr.responseText) : {}; } catch (error) { data = null; }
      if (xhr.status >= 200 && xhr.status < 300) { done(data ? null : new Error("The provider returned an unreadable response."), data); }
      else if (xhr.status === 0) { done(new Error("Could not reach the provider. Check its URL, CORS settings, and your connection.")); }
      else {
        detail = data && (data.message || (data.error && (data.error.message || data.error)));
        done(new Error(detail || "Provider request failed (HTTP " + xhr.status + ")."));
      }
    };
    xhr.ontimeout = function () { done(new Error("The provider took too long to respond.")); };
    xhr.onabort = function () { done(new Error("Request stopped.")); };
    xhr.send(body === null ? null : JSON.stringify(body));
    return xhr;
  }

  function chatMessages(chat) {
    var messages = [];
    var i;
    if (state.systemPrompt) { messages.push({ role: "system", content: state.systemPrompt }); }
    for (i = 0; i < chat.messages.length; i += 1) {
      if (!chat.messages[i].imageUrl) { messages.push({ role: chat.messages[i].role, content: chat.messages[i].content }); }
    }
    return messages;
  }

  function compatibleUrl(base) {
    base = base.replace(/\/+$/, "");
    if (/\/chat\/completions$/.test(base)) { return base; }
    return /\/v1$/.test(base) ? base + "/chat/completions" : base + "/v1/chat/completions";
  }

  function sendChat(chat, provider, callback) {
    var url;
    var model;
    var headers = {};
    var key;
    if (provider === "chat") { url = "https://ch.at/v1/chat/completions"; model = "gpt-4o"; }
    else if (provider === "pollinations") { url = "https://text.pollinations.ai/openai"; model = state.pollinationsModel; }
    else if (provider === "ollama") { url = state.ollamaUrl + "/api/chat"; model = state.ollamaModel; }
    else {
      url = compatibleUrl(state.customUrl); model = state.customModel; key = trim(el("custom-key").value);
      if (key) { headers.Authorization = "Bearer " + key; }
    }
    return requestJson("POST", url, { model: model, messages: chatMessages(chat), stream: false }, headers, function (error, data) {
      var content;
      if (error) { callback(error); return; }
      content = provider === "ollama" ? data && data.message && data.message.content : data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      callback(typeof content === "string" ? null : new Error("The provider response did not contain an assistant message."), content);
    });
  }

  function sendHorde(prompt, callback) {
    var base = "https://aihorde.net/api/v2/generate";
    var headers = { apikey: "0000000000", "Client-Agent": "TibUI:1.0:anonymous" };
    var controller = { xhr: null, timer: null, id: "", stopped: false, complete: false };
    function finish(error, result) {
      if (controller.complete) { return; }
      controller.complete = true;
      if (controller.timer) { window.clearTimeout(controller.timer); }
      callback(error, result);
    }
    function getResult() {
      controller.xhr = requestJson("GET", base + "/status/" + encodeURIComponent(controller.id), null, headers, function (error, data) {
        var generation;
        if (controller.stopped) { return; }
        if (error) { finish(error); return; }
        generation = data && data.generations && data.generations[0];
        if (!generation || !generation.img) { finish(new Error("Stable Horde finished without returning an image.")); return; }
        finish(null, { content: "Image generated by Stable Horde.", imageUrl: generation.img, prompt: prompt });
      });
    }
    function check() {
      controller.xhr = requestJson("GET", base + "/check/" + encodeURIComponent(controller.id), null, headers, function (error, data) {
        if (controller.stopped) { return; }
        if (error) { finish(error); return; }
        if (data.done) { getResult(); return; }
        el("request-status").className = "request-status info";
        el("request-status").textContent = "Stable Horde queue: " + (typeof data.queue_position === "number" ? data.queue_position + " ahead" : "waiting") + (data.wait_time ? " · about " + data.wait_time + "s" : "");
        controller.timer = window.setTimeout(check, 2500);
      });
    }
    controller.abort = function () {
      controller.stopped = true;
      if (controller.timer) { window.clearTimeout(controller.timer); }
      if (controller.xhr) { controller.xhr.abort(); }
      if (controller.id) { requestJson("DELETE", base + "/status/" + encodeURIComponent(controller.id), null, headers, function () {}); }
      finish(new Error("Request stopped."));
    };
    controller.xhr = requestJson("POST", base + "/async", {
      prompt: prompt,
      params: { sampler_name: "k_euler_a", cfg_scale: 7.5, height: 512, width: 512, steps: 20, n: 1 },
      models: [state.hordeModel], nsfw: !state.hordeSafety, censor_nsfw: state.hordeSafety, trusted_workers: false,
      slow_workers: true, r2: true, shared: false
    }, headers, function (error, data) {
      if (controller.stopped) { return; }
      if (error) { finish(error); return; }
      if (!data || !data.id) { finish(new Error("Stable Horde did not return a job ID.")); return; }
      controller.id = data.id; el("request-status").className = "request-status info";
      el("request-status").textContent = "Stable Horde accepted the image job. Waiting for a volunteer worker…";
      controller.timer = window.setTimeout(check, 1200);
    });
    return controller;
  }

  function setLoading(on) {
    el("send-button").className = "send" + (on ? " loading" : "");
    el("send-button").setAttribute("aria-label", on ? "Stop" : "Send"); el("prompt-input").disabled = on;
  }

  function finishRequest(chat, error, result) {
    var pending = el("pending-message");
    var chatExists = false;
    var i;
    activeRequest = null; setLoading(false);
    if (pending && pending.parentNode) { pending.parentNode.removeChild(pending); }
    el("request-status").className = "request-status";
    if (error) {
      el("request-status").textContent = error.message === "Request stopped." ? "" : error.message;
      el("prompt-input").focus(); return;
    }
    for (i = 0; i < state.chats.length; i += 1) { if (state.chats[i].id === chat.id) { chatExists = true; break; } }
    if (!chatExists) { return; }
    el("request-status").textContent = "";
    if (typeof result === "string") { result = { content: result }; }
    chat.messages.push({ role: "assistant", content: result.content || "", imageUrl: result.imageUrl || "", prompt: result.prompt || "" });
    chat.updated = new Date().getTime();
    if (currentChat() && currentChat().id === chat.id) { appendMessage(chat.messages[chat.messages.length - 1], false); scrollBottom(); }
    renderList(); saveState(); el("prompt-input").focus();
  }

  function submit(event) {
    var input;
    var prompt;
    var chat;
    var provider;
    if (event) { event.preventDefault(); }
    if (activeRequest) { activeRequest.abort(); return; }
    readSettings(); input = el("prompt-input"); prompt = trim(input.value);
    if (!prompt) { input.focus(); return; }
    chat = currentChat(); if (!chat) { makeNewChat(); chat = currentChat(); }
    provider = state.provider; chat.messages.push({ role: "user", content: prompt });
    if (chat.messages.length === 1) { chat.title = prompt.length > 36 ? prompt.slice(0, 36) + "…" : prompt; }
    chat.updated = new Date().getTime(); input.value = ""; input.style.height = "auto";
    el("request-status").textContent = ""; el("welcome").hidden = true;
    appendMessage(chat.messages[chat.messages.length - 1], false); appendMessage({ role: "assistant", content: "" }, true);
    renderList(); saveState(); scrollBottom(); setLoading(true);
    activeRequest = provider === "horde" ? sendHorde(prompt, function (error, result) { finishRequest(chat, error, result); }) : sendChat(chat, provider, function (error, result) { finishRequest(chat, error, result); });
  }

  function loadPollinations() {
    var button = el("load-pollinations"); button.disabled = true; el("settings-status").textContent = "Loading models…";
    requestJson("GET", "https://text.pollinations.ai/models", null, {}, function (error, data) {
      var models = [];
      var i;
      button.disabled = false;
      if (error || !(data instanceof Array)) { el("settings-status").textContent = error ? error.message : "Could not read models."; return; }
      for (i = 0; i < data.length; i += 1) { if (data[i].name) { models.push({ value: data[i].name, label: data[i].name + (data[i].description ? " — " + data[i].description : "") }); } }
      if (!models.length) { el("settings-status").textContent = "No anonymous models are listed."; return; }
      pollinationsModels = models;
      if (!state.pollinationsModel) { state.pollinationsModel = models[0].value; }
      if (state.provider === "pollinations") { updateProvider(); }
      el("settings-status").textContent = models.length + " anonymous model" + (models.length === 1 ? "" : "s") + " available.";
    });
  }

  function loadHorde() {
    var button = el("load-horde"); button.disabled = true; el("settings-status").textContent = "Loading active image models…";
    requestJson("GET", "https://aihorde.net/api/v2/status/models?type=image", null, {}, function (error, data) {
      var models = [];
      var selectedFound = false;
      var i;
      button.disabled = false;
      if (error || !(data instanceof Array)) { el("settings-status").textContent = error ? error.message : "Could not read image models."; return; }
      data.sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
      for (i = 0; i < data.length; i += 1) {
        if (data[i].name && (!state.hordeSafety || !/(nsfw|hentai|yiff|after[ -]?dark|unholy desire|babes)/i.test(data[i].name))) {
          models.push({
            value: data[i].name,
            label: data[i].name + " · " + (data[i].count || 0) + " workers · ETA " + (data[i].eta || 0) + "s",
            workers: data[i].count || 0,
            eta: data[i].eta || 0
          });
        }
      }
      if (!models.length) { el("settings-status").textContent = "No suitable active image models were found."; return; }
      for (i = 0; i < models.length; i += 1) { if (models[i].value === state.hordeModel) { selectedFound = true; break; } }
      if (!selectedFound) { state.hordeModel = models[0].value; }
      hordeModels = models;
      if (state.provider === "horde") { updateProvider(); }
      el("settings-status").textContent = models.length + " active image models found.";
    });
  }

  function loadOllama() {
    var button = el("load-ollama");
    var url = trim(el("ollama-url").value).replace(/\/+$/, "") || "http://localhost:11434";
    button.disabled = true; el("settings-status").textContent = "Loading local models…";
    requestJson("GET", url + "/api/tags", null, {}, function (error, data) {
      var list = el("ollama-models");
      var option;
      var i;
      button.disabled = false;
      if (error || !data || !(data.models instanceof Array)) { el("settings-status").textContent = error ? error.message : "Could not read Ollama models."; return; }
      clear(list);
      for (i = 0; i < data.models.length; i += 1) { option = document.createElement("option"); option.value = data.models[i].name; list.appendChild(option); }
      el("settings-status").textContent = data.models.length + " local model" + (data.models.length === 1 ? "" : "s") + " found.";
    });
  }

  function bind() {
    el("prompt-form").addEventListener("submit", submit);
    el("prompt-input").addEventListener("keydown", function (event) { if (event.keyCode === 13 && !event.shiftKey) { event.preventDefault(); submit(event); } });
    el("prompt-input").addEventListener("input", function () { this.style.height = "auto"; this.style.height = Math.min(this.scrollHeight, 160) + "px"; });
    el("provider").addEventListener("change", function () { state.provider = this.value; updateProvider(); if (state.provider === "pollinations") { loadPollinations(); } if (state.provider === "horde") { loadHorde(); } });
    el("model").addEventListener("change", function () {
      if (state.provider === "pollinations") { state.pollinationsModel = this.value; }
      if (state.provider === "horde") {
        state.hordeModel = this.value;
        el("provider-note").textContent = providerNote();
        el("provider-summary").textContent = providerNote();
        el("horde-model-info").textContent = providerNote();
      }
      saveState();
    });
    el("new-chat").addEventListener("click", makeNewChat);
    el("chat-list").addEventListener("click", function (event) {
      var target = event.target;
      while (target && target !== this) {
        if (target.getAttribute("data-chat")) { selectChat(target.getAttribute("data-chat")); return; }
        if (target.getAttribute("data-delete")) { removeChat(target.getAttribute("data-delete")); return; }
        target = target.parentNode;
      }
    });
    el("menu-button").addEventListener("click", function () { document.body.classList.add("menu-open"); });
    el("close-menu").addEventListener("click", closeMenu); el("scrim").addEventListener("click", closeMenu);
    el("settings-button").addEventListener("click", openSettings); el("settings-top").addEventListener("click", openSettings);
    el("close-settings").addEventListener("click", closeSettings); el("done-settings").addEventListener("click", function () { readSettings(); closeSettings(); });
    el("settings-modal").addEventListener("click", function (event) { if (event.target === this) { closeSettings(); } });
    el("theme").addEventListener("change", function () { state.theme = this.value; applyTheme(); });
    el("horde-safety").addEventListener("change", function () { state.hordeSafety = this.checked; loadHorde(); });
    el("load-pollinations").addEventListener("click", loadPollinations); el("load-horde").addEventListener("click", loadHorde); el("load-ollama").addEventListener("click", loadOllama);
    el("clear-data").addEventListener("click", function () {
      deleteCookie(); state.saveChats = false; state.chats = [newChat()]; state.activeId = state.chats[0].id;
      updatePrivacy(); renderList(); renderConversation(); el("settings-status").textContent = "Saved data cleared.";
    });
    document.addEventListener("keydown", function (event) { if (event.keyCode === 27) { closeMenu(); if (!el("settings-modal").hidden) { closeSettings(); } } });
  }

  function init() {
    loadSavedState();
    if (!(state.chats instanceof Array) || !state.chats.length) { state.chats = [newChat()]; }
    if (!currentChat()) { state.activeId = state.chats[0].id; }
    el("ollama-url").value = state.ollamaUrl; el("ollama-model").value = state.ollamaModel;
    el("custom-url").value = state.customUrl; el("custom-model").value = state.customModel; el("system-prompt").value = state.systemPrompt;
    el("horde-safety").checked = state.hordeSafety;
    applyTheme(); updatePrivacy(); updateProvider(); renderList(); renderConversation(); bind();
    loadPollinations(); loadHorde();
  }

  init();
}());
