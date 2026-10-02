(function() {
  "use strict";
  
  var COOKIE_NAME = "tibui_state_v2";
  var HORDE_API = "https://aihorde.net/api/v2";
  var ANON_KEY = "0000000000";
  var state = {
    chats: [],
    activeId: "",
    provider: "chat",
    theme: "dark",
    saveChats: false,
    systemPrompt: "",
    pollinationsModel: "openai-fast",
    hordeTextModel: "",
    hordeImageModel: "stable_diffusion",
    hordeSafety: true,
    hordeImageSize: "512x512",
    hordeImageSampler: "k_euler_a",
    hordeImageSteps: 25,
    hordeImageGuidance: 7.5,
    hordeImageKarras: true,
    hordeImageSeed: "",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3.2",
    ollamaTemperature: 0.8,
    ollamaTopP: 0.9,
    ollamaContext: 4096,
    ollamaSeed: -1,
    ollamaKeepAlive: "5m",
    customUrl: "https://api.openai.com/v1",
    customModel: "gpt-4o-mini",
    showModelLogos: true,
    webSearchEnabled: false,
    webSearchToolActive: false,
    webSearchMode: "auto",
    webSearchRelay: "/searxng",
    webSearchInstances: ["https://severian-searxng.hf.space"],
    webSearchResultsCount: 5,
    compatPreset: "maximum",
    maxCompatibility: true,
    reduceMotion: true,
    visualEffects: false,
    autoModelRefresh: false,
    requestTimeout: 180,
    historyLimit: 12,
  };
  var pollinationsModels = [];
  var hordeTextModels = [];
  var hordeImageModels = [];
  var ollamaModels = [];
  var activeXhr = null;
  var activeTimer = null;
  var activeHordeJob = null;
  var sending = false;
  var lastFocus = null;
  
  function byId(id) {
    return document.getElementById(id);
  }
  
  function addClass(node, name) {
    if (node && (" " + node.className + " ").indexOf(" " + name + " ") < 0) {
      node.className = node.className ? node.className + " " + name : name;
    }
  }
  
  function removeClass(node, name) {
    if (node) {
      node.className = (" " + node.className + " ")
        .replace(" " + name + " ", " ")
        .replace(/^\s+|\s+$/g, "");
    }
  }
  
  function setClass(node, name, enabled) {
    if (enabled) {
      addClass(node, name);
    } else {
      removeClass(node, name);
    }
  }
  
  function clampNumber(value, fallback, minimum, maximum) {
    var number = Number(value);
    if (!isFinite(number)) {
      return fallback;
    }
    return Math.max(minimum, Math.min(maximum, number));
  }
  
  function stripSlash(value) {
    return String(value || "").replace(/\/+$/, "");
  }
  
  function parseLines(value) {
    var lines = String(value || "").split(/\r?\n/);
    var clean = [];
    var seen = {};
    var i;
    var item;
    for (i = 0; i < lines.length; i += 1) {
      item = stripSlash(lines[i].replace(/^\s+|\s+$/g, ""));
      if (item && !seen[item]) {
        seen[item] = true;
        clean.push(item);
      }
    }
    return clean;
  }
  
  function cookieValue(name) {
    var parts = document.cookie ? document.cookie.split(";") : [];
    var i;
    var pair;
    for (i = 0; i < parts.length; i += 1) {
      pair = parts[i].replace(/^\s+/, "");
      if (pair.indexOf(name + "=") === 0) {
        return pair.substring(name.length + 1);
      }
    }
    return "";
  }
  
  function loadState() {
    var raw = cookieValue(COOKIE_NAME) || cookieValue("tibui_state_v1");
    var saved;
    var key;
    var cleanInstances;
    var i;
    if (!raw) {
      return;
    }
    try {
      saved = JSON.parse(decodeURIComponent(raw));
      for (key in state) {
        if (
          Object.prototype.hasOwnProperty.call(state, key) &&
          typeof saved[key] !== "undefined"
        ) {
          state[key] = saved[key];
        }
      }
      state.saveChats = true;
      if (!Array.isArray(state.chats)) {
        state.chats = [];
      }
      if (!Array.isArray(state.webSearchInstances)) {
        state.webSearchInstances = [];
      }
      cleanInstances = [];
      for (i = 0; i < state.webSearchInstances.length; i += 1) {
        if (stripSlash(state.webSearchInstances[i]) !== "https://sx.xo.st") {
          cleanInstances.push(state.webSearchInstances[i]);
        }
      }
      state.webSearchInstances = cleanInstances;
    } catch (ignore) {
      state.chats = [];
    }
  }
  
  function stateForCookie() {
    var copy = {};
    var key;
    for (key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        copy[key] = state[key];
      }
    }
    copy.chats = JSON.parse(JSON.stringify(state.chats.slice(-8)));
    while (
      encodeURIComponent(JSON.stringify(copy)).length > 3500 &&
      copy.chats.length
    ) {
      if (copy.chats[0].messages && copy.chats[0].messages.length) {
        copy.chats[0].messages.shift();
      } else if (copy.chats.length > 1) {
        copy.chats.shift();
      } else {
        break;
      }
    }
    return copy;
  }
  
  function saveState() {
    if (!state.saveChats) {
      document.cookie = COOKIE_NAME + "=; Max-Age=0; Path=/; SameSite=Lax";
      document.cookie = "tibui_state_v1=; Max-Age=0; Path=/; SameSite=Lax";
      updatePrivacy();
      return;
    }
    try {
      document.cookie =
        COOKIE_NAME +
        "=" +
        encodeURIComponent(JSON.stringify(stateForCookie())) +
        "; Max-Age=31536000; Path=/; SameSite=Lax";
    } catch (ignore) {
      byId("settings-status").textContent =
        "Cookie storage is full. Newer chats may not be saved.";
    }
    updatePrivacy();
  }
  
  function makeId() {
    return (
      String(new Date().getTime()) + String(Math.floor(Math.random() * 100000))
    );
  }
  
  function newChat() {
    var current = activeChat();
    if (current && (!current.messages || !current.messages.length)) {
      renderChats();
      renderMessages();
      closeMenu();
      byId("prompt-input").focus();
      return;
    }
    var chat = { id: makeId(), title: "New chat", messages: [] };
    state.chats.push(chat);
    state.activeId = chat.id;
    saveState();
    renderChats();
    renderMessages();
    closeMenu();
    byId("prompt-input").focus();
  }
  
  function activeChat() {
    var i;
    for (i = 0; i < state.chats.length; i += 1) {
      if (state.chats[i].id === state.activeId) {
        return state.chats[i];
      }
    }
    return null;
  }
  
  function renderChats() {
    var list = byId("chat-list");
    var i;
    var chat;
    var button;
    var entry;
    var remove;
    list.innerHTML = "";
    for (i = state.chats.length - 1; i >= 0; i -= 1) {
      chat = state.chats[i];
      entry = document.createElement("div");
      entry.className = "chat-entry";
      button = document.createElement("button");
      button.type = "button";
      button.className =
        "chat-item" + (chat.id === state.activeId ? " active" : "");
      button.textContent = chat.title || "New chat";
      button.setAttribute("data-chat-id", chat.id);
      button.onclick = selectChat;
      remove = document.createElement("button");
      remove.type = "button";
      remove.className = "delete-chat";
      remove.setAttribute("data-chat-id", chat.id);
      remove.setAttribute("aria-label", "Delete " + (chat.title || "chat"));
      remove.title = "Delete chat";
      remove.innerHTML = "&#215;";
      remove.onclick = deleteChat;
      entry.appendChild(button);
      entry.appendChild(remove);
      list.appendChild(entry);
    }
  }
  
  function selectChat(event) {
    state.activeId = event.currentTarget.getAttribute("data-chat-id");
    saveState();
    renderChats();
    renderMessages();
    closeMenu();
  }
  
  function deleteChat(event) {
    var id = event.currentTarget.getAttribute("data-chat-id");
    var index = -1;
    var i;
    event.preventDefault();
    event.stopPropagation();
    for (i = 0; i < state.chats.length; i += 1) {
      if (state.chats[i].id === id) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return;
    }
    state.chats.splice(index, 1);
    if (!state.chats.length) {
      state.chats.push({ id: makeId(), title: "New chat", messages: [] });
    }
    if (state.activeId === id) {
      state.activeId = state.chats[Math.min(index, state.chats.length - 1)].id;
    }
    saveState();
    renderChats();
    renderMessages();
  }
  
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  function inlineMarkdown(value) {
    var tokens = [];
    var source = String(value || "");
    var html;
    var i;
    source = source.replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi,
      function(match, text, url) {
        var marker = "\u0001TIB" + tokens.length + "\u0002";
        tokens.push(
          '<a href="' +
          escapeHtml(url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(text) +
          "</a>"
        );
        return marker;
      }
    );
    source = source.replace(/`([^`\n]+)`/g, function(match, code) {
      var marker = "\u0001TIB" + tokens.length + "\u0002";
      tokens.push("<code>" + escapeHtml(code) + "</code>");
      return marker;
    });
    html = escapeHtml(source)
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
      .replace(/~~([^~\n]+)~~/g, "<del>$1</del>")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    for (i = 0; i < tokens.length; i += 1) {
      html = html.replace("\u0001TIB" + i + "\u0002", tokens[i]);
    }
    return html;
  }
  
  function tableCells(line) {
    var value = String(line || "")
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "");
    var cells = value.split("|");
    var i;
    for (i = 0; i < cells.length; i += 1) {
      cells[i] = cells[i].replace(/^\s+|\s+$/g, "");
    }
    return cells;
  }
  
  function isTableDivider(line) {
    var cells = tableCells(line);
    var i;
    if (!cells.length) {
      return false;
    }
    for (i = 0; i < cells.length; i += 1) {
      if (!/^:?-{3,}:?$/.test(cells[i])) {
        return false;
      }
    }
    return true;
  }
  
  function renderText(container, value) {
    var lines = String(value || "")
      .replace(/\r\n?/g, "\n")
      .split("\n");
    var html = "";
    var paragraph = [];
    var listType = "";
    var inCode = false;
    var codeLanguage = "";
    var codeLines = [];
    var i = 0;
    var line;
    var match;
    var cells;
    var row;
    var j;
    
    function closeParagraph() {
      var rendered = [];
      var paragraphIndex;
      if (paragraph.length) {
        for (
          paragraphIndex = 0; paragraphIndex < paragraph.length; paragraphIndex += 1
        ) {
          rendered.push(inlineMarkdown(paragraph[paragraphIndex]));
        }
        html += "<p>" + rendered.join("<br>") + "</p>";
        paragraph = [];
      }
    }
    
    function closeList() {
      if (listType) {
        html += "</" + listType + ">";
        listType = "";
      }
    }
    
    while (i < lines.length) {
      line = lines[i];
      if (inCode) {
        if (/^\s*```/.test(line)) {
          html +=
            '<pre><code class="language-' +
            escapeHtml(codeLanguage) +
            '">' +
            escapeHtml(codeLines.join("\n")) +
            "</code></pre>";
          inCode = false;
          codeLanguage = "";
          codeLines = [];
        } else {
          codeLines.push(line);
        }
        i += 1;
        continue;
      }
      match = line.match(/^\s*```\s*([A-Za-z0-9_-]*)/);
      if (match) {
        closeParagraph();
        closeList();
        inCode = true;
        codeLanguage = match[1] || "plain";
        i += 1;
        continue;
      }
      if (!line.replace(/\s/g, "")) {
        closeParagraph();
        closeList();
        i += 1;
        continue;
      }
      if (
        line.indexOf("|") >= 0 &&
        i + 1 < lines.length &&
        isTableDivider(lines[i + 1])
      ) {
        closeParagraph();
        closeList();
        cells = tableCells(line);
        html += '<div class="table-wrap"><table><thead><tr>';
        for (j = 0; j < cells.length; j += 1) {
          html += "<th>" + inlineMarkdown(cells[j]) + "</th>";
        }
        html += "</tr></thead><tbody>";
        i += 2;
        while (i < lines.length && lines[i].indexOf("|") >= 0) {
          row = tableCells(lines[i]);
          html += "<tr>";
          for (j = 0; j < cells.length; j += 1) {
            html += "<td>" + inlineMarkdown(row[j] || "") + "</td>";
          }
          html += "</tr>";
          i += 1;
        }
        html += "</tbody></table></div>";
        continue;
      }
      match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        closeParagraph();
        closeList();
        html +=
          "<h" +
          match[1].length +
          ">" +
          inlineMarkdown(match[2]) +
          "</h" +
          match[1].length +
          ">";
        i += 1;
        continue;
      }
      if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
        closeParagraph();
        closeList();
        html += "<hr>";
        i += 1;
        continue;
      }
      match = line.match(/^\s*>\s?(.*)$/);
      if (match) {
        closeParagraph();
        closeList();
        html += "<blockquote>" + inlineMarkdown(match[1]) + "</blockquote>";
        i += 1;
        continue;
      }
      match = line.match(/^\s*[-+*]\s+(.+)$/);
      if (match) {
        closeParagraph();
        if (listType !== "ul") {
          closeList();
          listType = "ul";
          html += "<ul>";
        }
        line = match[1].replace(/^\[x\]\s*/i, "☑ ").replace(/^\[ \]\s*/, "☐ ");
        html += "<li>" + inlineMarkdown(line) + "</li>";
        i += 1;
        continue;
      }
      match = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (match) {
        closeParagraph();
        if (listType !== "ol") {
          closeList();
          listType = "ol";
          html += "<ol>";
        }
        html += "<li>" + inlineMarkdown(match[1]) + "</li>";
        i += 1;
        continue;
      }
      closeList();
      paragraph.push(line);
      i += 1;
    }
    if (inCode) {
      html +=
        "<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>";
    }
    closeParagraph();
    closeList();
    container.innerHTML = html;
  }
  
  function appendSources(container, sources) {
    var box;
    var title;
    var i;
    var link;
    if (!sources || !sources.length) {
      return;
    }
    box = document.createElement("div");
    box.className = "sources";
    title = document.createElement("strong");
    title.textContent = "Web sources";
    box.appendChild(title);
    for (i = 0; i < sources.length; i += 1) {
      link = document.createElement("a");
      link.href = sources[i].url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = i + 1 + ". " + sources[i].title;
      box.appendChild(link);
    }
    container.appendChild(box);
  }
  
  function renderMessages() {
    var chat = activeChat();
    var list = byId("messages");
    var welcome = byId("welcome");
    var i;
    var message;
    var row;
    var bubble;
    var label;
    var image;
    list.innerHTML = "";
    if (!chat || !chat.messages.length) {
      welcome.hidden = false;
      return;
    }
    welcome.hidden = true;
    for (i = 0; i < chat.messages.length; i += 1) {
      message = chat.messages[i];
      row = document.createElement("article");
      row.className = "message " + message.role;
      bubble = document.createElement("div");
      bubble.className = "bubble" + (message.error ? " message-error" : "");
      label = document.createElement("div");
      label.className = "message-label";
      label.textContent =
        message.role === "user" ?
        "You" :
        message.label || providerLabel(state.provider);
      if (message.kind === "image") {
        image = document.createElement("img");
        image.className = "generated-image";
        image.src = message.content;
        image.alt = message.alt || "AI-generated image";
        bubble.appendChild(image);
      } else {
        renderText(bubble, message.content);
      }
      appendSources(bubble, message.sources);
      row.appendChild(label);
      row.appendChild(bubble);
      list.appendChild(row);
    }
    scrollConversation();
  }
  
  function scrollConversation() {
    var node = byId("conversation");
    window.setTimeout(function() {
      node.scrollTop = node.scrollHeight;
    }, 0);
  }
  
  function providerLabel(provider) {
    var labels = {
      chat: "GPT-4o",
      pollinations: "Pollinations",
      hordeText: "Stable Horde",
      hordeImage: "Stable Horde image",
      ollama: "Ollama",
      custom: "OpenAI compatible",
    };
    return labels[provider] || "Assistant";
  }
  
  function providerNote(provider) {
    var notes = {
      chat: "Credential-less GPT-4o-compatible access provided by ch.at.",
      pollinations: "Free models from the Pollinations anonymous legacy endpoint.",
      hordeText: "Community-hosted text models. Queue time depends on live workers.",
      hordeImage: "Community-hosted image models with optional safety filtering.",
      ollama: "Connect directly to an Ollama server you control.",
      custom: "Connect to a browser-accessible OpenAI-compatible endpoint.",
    };
    return notes[provider] || "";
  }
  
  function option(select, value, label) {
    var item = document.createElement("option");
    item.value = value;
    item.textContent = label;
    select.appendChild(item);
  }
  
  function etaText(seconds) {
    var value = Number(seconds);
    if (!isFinite(value) || value < 0) {
      return "ETA unknown";
    }
    if (value < 60) {
      return "ETA " + Math.max(1, Math.round(value)) + "s";
    }
    return "ETA " + Math.round(value / 60) + "m";
  }
  
  function simplifyHordeTextName(raw) {
    var name = String(raw || "")
      .split("/")
      .pop();
    name = name.replace(/[-_](?:I?Q\d+[A-Z0-9_]*|Q\d+_[A-Z0-9_]+)$/i, "");
    name = name.replace(/\bMeta[-_]Llama\b/gi, "Llama");
    name = name.replace(/\bLLaMA\b/g, "Llama");
    name = name
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
    return name || raw;
  }
  
  function currentModel() {
    if (state.provider === "chat") {
      return "gpt-4o";
    }
    if (state.provider === "pollinations") {
      return state.pollinationsModel;
    }
    if (state.provider === "hordeText") {
      return state.hordeTextModel;
    }
    if (state.provider === "hordeImage") {
      return state.hordeImageModel;
    }
    if (state.provider === "ollama") {
      return state.ollamaModel;
    }
    return state.customModel;
  }
  
  function currentHordeRecord(list, name) {
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].name === name) {
        return list[i];
      }
    }
    return null;
  }
  
  function updateModelMeta() {
    var meta = "";
    var record;
    if (state.provider === "hordeText") {
      record = currentHordeRecord(hordeTextModels, state.hordeTextModel);
    } else if (state.provider === "hordeImage") {
      record = currentHordeRecord(hordeImageModels, state.hordeImageModel);
    }
    if (record) {
      meta =
        Number(record.count || 0) +
        " worker" +
        (Number(record.count || 0) === 1 ? "" : "s") +
        " · " +
        etaText(record.eta);
    }
    byId("model-meta").textContent = meta;
    updateModelLogo();
  }
  
  function logoFor(provider, model) {
    var value = String(model || "").toLowerCase();
    if (provider === "ollama") {
      return { src: "icons/ollama.svg", fallback: "O" };
    }
    if (value.indexOf("llama") >= 0 || value.indexOf("meta") >= 0) {
      return { src: "icons/meta.svg", fallback: "M" };
    }
    if (
      value.indexOf("gemma") >= 0 ||
      value.indexOf("gemini") >= 0 ||
      value.indexOf("google") >= 0
    ) {
      return { src: "icons/google.svg", fallback: "G" };
    }
    if (value.indexOf("mistral") >= 0 || value.indexOf("mixtral") >= 0) {
      return { src: "icons/mistralai.svg", fallback: "M" };
    }
    if (value.indexOf("deepseek") >= 0) {
      return { src: "icons/deepseek.svg", fallback: "D" };
    }
    if (value.indexOf("claude") >= 0 || value.indexOf("anthropic") >= 0) {
      return { src: "icons/anthropic.svg", fallback: "A" };
    }
    if (value.indexOf("grok") >= 0 || value.indexOf("x-ai") >= 0) {
      return { src: "icons/x.svg", fallback: "X" };
    }
    if (value.indexOf("qwen") >= 0 || value.indexOf("alibaba") >= 0) {
      return { src: "icons/alibabacloud.svg", fallback: "Q" };
    }
    if (value.indexOf("nvidia") >= 0 || value.indexOf("nemotron") >= 0) {
      return { src: "icons/nvidia.svg", fallback: "N" };
    }
    if (value.indexOf("phi") >= 0 || value.indexOf("microsoft") >= 0) {
      return { src: "icons/microsoft.svg", fallback: "MS" };
    }
    if (provider === "hordeImage" || value.indexOf("stable") >= 0) {
      return { fallback: "S" };
    }
    if (provider === "hordeText") {
      return { fallback: "H" };
    }
    if (provider === "pollinations") {
      return { fallback: "P" };
    }
    if (
      provider === "chat" ||
      value.indexOf("openai") >= 0 ||
      value.indexOf("gpt") >= 0
    ) {
      return { src: "icons/openai.svg", fallback: "AI" };
    }
    return { fallback: "AI" };
  }
  
  function updateModelLogo() {
    var holder = byId("model-logo");
    var logo = logoFor(state.provider, currentModel());
    var node;
    holder.innerHTML = "";
    if (logo.src) {
      node = document.createElement("img");
      node.src = logo.src;
      node.alt = "";
      node.onerror = function() {
        holder.innerHTML = "<span>" + escapeHtml(logo.fallback) + "</span>";
      };
    } else {
      node = document.createElement("span");
      node.textContent = logo.fallback;
    }
    holder.appendChild(node);
  }
  
  function rebuildModelSelect() {
    var select = byId("model");
    var i;
    var selected = currentModel();
    select.innerHTML = "";
    if (state.provider === "chat") {
      option(select, "gpt-4o", "GPT-4o");
    } else if (state.provider === "pollinations") {
      if (!pollinationsModels.length) {
        option(
          select,
          state.pollinationsModel || "openai-fast",
          state.pollinationsModel || "openai-fast"
        );
      }
      for (i = 0; i < pollinationsModels.length; i += 1) {
        option(select, pollinationsModels[i].name, pollinationsModels[i].label);
      }
    } else if (state.provider === "hordeText") {
      if (!hordeTextModels.length) {
        option(select, state.hordeTextModel || "", "Load live text models…");
      }
      for (i = 0; i < hordeTextModels.length; i += 1) {
        option(
          select,
          hordeTextModels[i].name,
          simplifyHordeTextName(hordeTextModels[i].name)
        );
      }
    } else if (state.provider === "hordeImage") {
      if (!hordeImageModels.length) {
        option(
          select,
          state.hordeImageModel || "stable_diffusion",
          state.hordeImageModel || "stable_diffusion"
        );
      }
      for (i = 0; i < hordeImageModels.length; i += 1) {
        option(select, hordeImageModels[i].name, hordeImageModels[i].name);
      }
    } else if (state.provider === "ollama") {
      option(select, state.ollamaModel, state.ollamaModel);
      for (i = 0; i < ollamaModels.length; i += 1) {
        if (ollamaModels[i] !== state.ollamaModel) {
          option(select, ollamaModels[i], ollamaModels[i]);
        }
      }
    } else {
      option(select, state.customModel, state.customModel);
    }
    select.value = selected;
    if (select.selectedIndex < 0) {
      select.selectedIndex = 0;
    }
    select.disabled = state.provider === "chat";
    updateModelMeta();
  }
  
  function onModelChange() {
    var value = byId("model").value;
    if (state.provider === "pollinations") {
      state.pollinationsModel = value;
    }
    if (state.provider === "hordeText") {
      state.hordeTextModel = value;
    }
    if (state.provider === "hordeImage") {
      state.hordeImageModel = value;
    }
    if (state.provider === "ollama") {
      state.ollamaModel = value;
      byId("ollama-model").value = value;
    }
    if (state.provider === "custom") {
      state.customModel = value;
      byId("custom-model").value = value;
    }
    saveState();
    updateModelMeta();
  }
  
  function updateProviderUI(loadLive) {
    var panels = document.querySelectorAll(".provider-settings");
    var i;
    state.provider = byId("provider").value;
    for (i = 0; i < panels.length; i += 1) {
      panels[i].hidden =
        panels[i].getAttribute("data-provider") !== state.provider;
    }
    byId("provider-summary").textContent = providerNote(state.provider);
    byId("provider-note").textContent = providerNote(state.provider);
    window.TibUITools.imageControls.setAvailable(
      state.provider === "hordeImage"
    );
    
    window.TibUITools.webSearch.updateUI();
    
    rebuildModelSelect();
    saveState();
    if (loadLive && state.provider === "hordeText" && !hordeTextModels.length) {
      loadHordeModels("text");
    }
    if (
      loadLive &&
      state.provider === "hordeImage" &&
      !hordeImageModels.length
    ) {
      loadHordeModels("image");
    }
    if (
      loadLive &&
      state.provider === "pollinations" &&
      !pollinationsModels.length
    ) {
      loadPollinationsModels();
    }
  }
  
  function updateWebToolUI() {
    if (
      window.TibUITools &&
      window.TibUITools.webSearch
    ) {
      window.TibUITools.webSearch.updateUI();
    }
  }
  
  
  function requestJson(method, url, body, headers) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var key;
      activeXhr = xhr;
      xhr.open(method, url, true);
      xhr.timeout = clampNumber(state.requestTimeout, 180, 30, 300) * 1000;
      if (body !== null && typeof body !== "undefined") {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      if (headers) {
        for (key in headers) {
          if (
            Object.prototype.hasOwnProperty.call(headers, key) &&
            headers[key]
          ) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      }
      xhr.onreadystatechange = function() {
        var parsed;
        var message;
        if (xhr.readyState !== 4) {
          return;
        }
        if (activeXhr === xhr) {
          activeXhr = null;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            parsed = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            resolve(parsed);
          } catch (error) {
            reject(new Error("The server returned a non-JSON response."));
          }
          return;
        }
        if (xhr.status === 429) {
          message = "The server rate-limited the request (HTTP 429).";
        } else if (xhr.status === 403) {
          message =
            "The server refused the request (HTTP 403). JSON output may be disabled.";
        } else if (xhr.status === 0) {
          message =
            "The browser could not reach the server. Check CORS, HTTPS, its certificate, and private-network access.";
        } else {
          message = "The server returned HTTP " + xhr.status + ".";
        }
        reject(new Error(message));
      };
      xhr.ontimeout = function() {
        if (activeXhr === xhr) {
          activeXhr = null;
        }
        reject(new Error("The request timed out."));
      };
      xhr.onerror = function() {
        if (activeXhr === xhr) {
          activeXhr = null;
        }
        reject(
          new Error(
            "The browser blocked or could not reach the request. Check CORS, HTTPS, and private-network access."
          )
        );
      };
      xhr.onabort = function() {
        if (activeXhr === xhr) {
          activeXhr = null;
        }
        reject(new Error("Request cancelled."));
      };
      xhr.send(
        body === null || typeof body === "undefined" ?
        null :
        JSON.stringify(body)
      );
    });
  }
  
  function loadPollinationsModels() {
    var button = byId("load-pollinations");
    button.disabled = true;
    button.textContent = "Loading…";
    requestJson("GET", "https://text.pollinations.ai/models", null, null)
      .then(function(data) {
        var list = Array.isArray(data) ? data : data.models || [];
        var found = [];
        var i;
        var item;
        var name;
        for (i = 0; i < list.length; i += 1) {
          item = list[i];
          name = typeof item === "string" ? item : item.name || item.id;
          if (name) {
            found.push({
              name: name,
              label: typeof item === "string" ?
                item : item.description || item.name || item.id,
            });
          }
        }
        pollinationsModels = found;
        if (found.length && !state.pollinationsModel) {
          state.pollinationsModel = found[0].name;
        }
        rebuildModelSelect();
        byId("settings-status").textContent =
          found.length + " Pollinations models loaded.";
      })
      .catch(function(error) {
        byId("settings-status").textContent = error.message;
      })
      .then(function() {
        button.disabled = false;
        button.textContent = "Refresh models";
      });
  }
  
  function isAdultModel(name) {
    return /\bnsfw\b|porn|hentai|explicit|uncensored|nudity/i.test(
      String(name || "")
    );
  }
  
  function loadHordeModels(type) {
    var isText = type === "text";
    var button = byId(isText ? "load-horde-text" : "load-horde-image");
    var info = byId(
      isText ? "horde-text-model-info" : "horde-image-model-info"
    );
    button.disabled = true;
    button.textContent = "Loading…";
    info.textContent = "Loading live worker information…";
    requestJson(
        "GET",
        HORDE_API + "/status/models?type=" + encodeURIComponent(type),
        null,
        null
      )
      .then(function(data) {
        var list = Array.isArray(data) ? data : [];
        var clean = [];
        var i;
        for (i = 0; i < list.length; i += 1) {
          if (
            !list[i].name ||
            (!isText && state.hordeSafety && isAdultModel(list[i].name))
          ) {
            continue;
          }
          clean.push({
            name: list[i].name,
            count: Number(list[i].count || 0),
            eta: Number(list[i].eta || 0),
            queued: Number(list[i].queued || 0),
            performance: Number(list[i].performance || 0),
          });
        }
        clean.sort(function(a, b) {
          return (
            b.count - a.count || a.eta - b.eta || a.name.localeCompare(b.name)
          );
        });
        if (isText) {
          hordeTextModels = clean;
          if (
            clean.length &&
            !currentHordeRecord(clean, state.hordeTextModel)
          ) {
            state.hordeTextModel = clean[0].name;
          }
        } else {
          hordeImageModels = clean;
          if (
            clean.length &&
            !currentHordeRecord(clean, state.hordeImageModel)
          ) {
            state.hordeImageModel = clean[0].name;
          }
        }
        info.textContent = clean.length ?
          clean.length +
          " live models. Worker count and ETA update whenever this list is refreshed." :
          "No compatible workers are currently available.";
        rebuildModelSelect();
        saveState();
      })
      .catch(function(error) {
        info.textContent = error.message;
      })
      .then(function() {
        button.disabled = false;
        button.textContent = isText ?
          "Refresh text models" :
          "Refresh image models";
      });
  }
  
  function loadOllamaModels() {
    var button = byId("load-ollama");
    var base = stripSlash(byId("ollama-url").value);
    button.disabled = true;
    button.textContent = "Loading…";
    requestJson("GET", base + "/api/tags", null, null)
      .then(function(data) {
        var list = data.models || [];
        var datalist = byId("ollama-models");
        var i;
        var name;
        datalist.innerHTML = "";
        ollamaModels = [];
        for (i = 0; i < list.length; i += 1) {
          name = list[i].name || list[i].model;
          if (name) {
            ollamaModels.push(name);
            option(datalist, name, name);
          }
        }
        rebuildModelSelect();
        byId("settings-status").textContent =
          ollamaModels.length + " Ollama models found.";
      })
      .catch(function(error) {
        byId("settings-status").textContent =
          error.message +
          " Configure OLLAMA_ORIGINS when connecting across origins.";
      })
      .then(function() {
        button.disabled = false;
        button.textContent = "Load models";
      });
  }
  
  
  
  
  
  function historyMessages(webContext) {
    var chat = activeChat();
    var history = chat ? chat.messages : [];
    var filtered = [];
    var start;
    var i;
    var system = String(state.systemPrompt || "").trim();
    
    if (webContext) {
      system += (system ? "\n\n" : "") + webContext;
    }
    
    start = Math.max(0, history.length - state.historyLimit);
    
    for (i = start; i < history.length; i += 1) {
      if (history[i].kind === "image" || history[i].error) {
        continue;
      }
      
      if (history[i].role === "user" && system) {
        filtered.push({
          role: "user",
          content: "[SYSTEM INSTRUCTIONS]\n" +
            system +
            "\n\n[END SYSTEM INSTRUCTIONS]\n\n" +
            history[i].content
        });
      } else {
        filtered.push({
          role: history[i].role,
          content: history[i].content
        });
      }
    }
    
    return filtered;
  }
  
  
  function openAIRequest(url, model, webContext, headers) {
    return requestJson(
      "POST",
      url, { model: model, messages: historyMessages(webContext), stream: false },
      headers
    ).then(function(data) {
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("The provider returned no message.");
      }
      return String(data.choices[0].message.content || "");
    });
  }
  
  function ollamaRequest(webContext) {
    var options = {
      temperature: state.ollamaTemperature,
      top_p: state.ollamaTopP,
      num_ctx: state.ollamaContext,
    };
    if (state.ollamaSeed >= 0) {
      options.seed = state.ollamaSeed;
    }
    return requestJson(
      "POST",
      stripSlash(state.ollamaUrl) + "/api/chat",
      {
        model: state.ollamaModel,
        messages: historyMessages(webContext),
        stream: false,
        keep_alive: state.ollamaKeepAlive,
        options: options,
      },
      null
    ).then(function(data) {
      if (!data.message) {
        throw new Error("Ollama returned no message.");
      }
      return String(data.message.content || "");
    });
  }
  
  function customChatUrl() {
    var base = stripSlash(state.customUrl);
    if (/\/chat\/completions$/i.test(base)) {
      return base;
    }
    return base + "/chat/completions";
  }
  
  function hordePrompt(webContext) {
    var messages = historyMessages(webContext);
    var parts = [];
    var i;
    for (i = 0; i < messages.length; i += 1) {
      parts.push(
        (messages[i].role === "assistant" ?
          "Assistant" :
          messages[i].role === "system" ?
          "System" :
          "User") +
        ": " +
        messages[i].content
      );
    }
    parts.push("Assistant:");
    return parts.join("\n\n");
  }
  
  function clearActiveJob() {
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      activeTimer = null;
    }
    activeHordeJob = null;
  }
  
  function hordeGenerationPath(kind, action, id) {
    var path = kind === "text" ? "/generate/text/" : "/generate/";
    return HORDE_API + path + action + (id ? "/" + encodeURIComponent(id) : "");
  }
  
  function pollHordeJob(id, kind, resolve, reject) {
    requestJson("GET", hordeGenerationPath(kind, "status", id), null, {
        "Client-Agent": "TibUI:2.0:viirtec",
      })
      .then(function(data) {
        var generation;
        if (data.faulted) {
          throw new Error("Stable Horde reported that the job failed.");
        }
        if (data.done) {
          clearActiveJob();
          generation = data.generations && data.generations[0];
          if (!generation) {
            throw new Error("Stable Horde finished without an output.");
          }
          resolve(
            kind === "text" ?
            String(generation.text || "") :
            String(generation.img || "")
          );
          return;
        }
        byId("request-status").textContent =
          "Stable Horde queue: " +
          Number(data.queue_position || 0) +
          " ahead · " +
          etaText(data.wait_time);
        activeTimer = window.setTimeout(
          function() {
            pollHordeJob(id, kind, resolve, reject);
          },
          state.maxCompatibility ? 3500 : 2500
        );
      })
      .catch(function(error) {
        clearActiveJob();
        reject(error);
      });
  }
  
  function hordeRequest(kind, prompt, webContext) {
    var isText = kind === "text";
    var body;
    var dimensions;
    var imageParams;
    if (isText) {
      body = {
        prompt: hordePrompt(webContext),
        params: {
          n: 1,
          max_context_length: Math.max(1024, state.ollamaContext),
          max_length: 512,
          temperature: state.ollamaTemperature,
          top_p: state.ollamaTopP,
        },
        models: [state.hordeTextModel],
        trusted_workers: false,
        validated_backends: true,
        slow_workers: true,
      };
    } else {
      dimensions = String(state.hordeImageSize || "512x512").split("x");
      imageParams = {
        n: 1,
        width: clampNumber(dimensions[0], 512, 64, 3072),
        height: clampNumber(dimensions[1], 512, 64, 3072),
        steps: state.hordeImageSteps,
        cfg_scale: state.hordeImageGuidance,
        sampler_name: state.hordeImageSampler,
        karras: state.hordeImageKarras,
      };
      if (state.hordeImageSeed) {
        imageParams.seed = state.hordeImageSeed;
      }
      body = {
        prompt: prompt,
        params: imageParams,
        models: [state.hordeImageModel],
        nsfw: !state.hordeSafety,
        censor_nsfw: state.hordeSafety,
        trusted_workers: false,
        slow_workers: true,
        r2: true,
        shared: true,
      };
    }
    return requestJson("POST", hordeGenerationPath(kind, "async", ""), body, {
      apikey: ANON_KEY,
      "Client-Agent": "TibUI:2.0:viirtec",
    }).then(function(data) {
      if (!data.id) {
        throw new Error("Stable Horde did not accept the job.");
      }
      activeHordeJob = { id: data.id, kind: kind };
      return new Promise(function(resolve, reject) {
        pollHordeJob(data.id, kind, resolve, reject);
      });
    });
  }
  
  function providerRequest(prompt, webContext) {
    var headers = {};
    if (state.provider === "chat") {
      return openAIRequest(
        "https://ch.at/v1/chat/completions",
        "gpt-4o",
        webContext,
        null
      );
    }
    if (state.provider === "pollinations") {
      return openAIRequest(
        "https://text.pollinations.ai/openai",
        state.pollinationsModel,
        webContext,
        null
      );
    }
    if (state.provider === "hordeText") {
      return hordeRequest("text", prompt, webContext);
    }
    if (state.provider === "hordeImage") {
      return hordeRequest("image", prompt, "");
    }
    if (state.provider === "ollama") {
      return ollamaRequest(webContext);
    }
    if (byId("custom-key").value) {
      headers.Authorization = "Bearer " + byId("custom-key").value;
    }
    return openAIRequest(
      customChatUrl(),
      state.customModel,
      webContext,
      headers
    );
  }
  
  function setSending(value) {
    sending = value;
    byId("conversation").setAttribute("aria-busy", value ? "true" : "false");
    byId("send-button").textContent = value ? "×" : "↑";
    byId("send-button").setAttribute(
      "aria-label",
      value ? "Cancel request" : "Send"
    );
    byId("prompt-input").disabled = value;
  }
  
  function abortActive() {
    var job = activeHordeJob;
    if (activeXhr) {
      activeXhr.abort();
    }
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      activeTimer = null;
    }
    if (job) {
      activeHordeJob = null;
      requestJson(
        "DELETE",
        hordeGenerationPath(job.kind, "status", job.id),
        null, { apikey: ANON_KEY, "Client-Agent": "TibUI:2.0:viirtec" }
      ).catch(function() {});
    }
    setSending(false);
    byId("request-status").textContent = "Request cancelled.";
  }
  
  function submitPrompt(event) {
    var prompt;
    var chat;
    var useWeb;
    var sources = [];
    var context = "";
    event.preventDefault();
    if (sending) {
      abortActive();
      return;
    }
    syncStateFromInputs();
    prompt = byId("prompt-input").value.replace(/^\s+|\s+$/g, "");
    if (!prompt) {
      return;
    }
    if (
      (state.provider === "hordeText" && !state.hordeTextModel) ||
      (state.provider === "hordeImage" && !state.hordeImageModel)
    ) {
      byId("request-status").textContent =
        "Load and select a Stable Horde model first.";
      return;
    }
    chat = activeChat();
    if (!chat) {
      newChat();
      chat = activeChat();
    }
    chat.messages.push({ role: "user", content: prompt });
    if (chat.title === "New chat") {
      chat.title = prompt.substring(0, 48);
    }
    byId("prompt-input").value = "";
    resizePrompt();
    renderChats();
    renderMessages();
    setSending(true);
    useWeb =
      window.TibUITools.webSearch.isActive();
    
    byId("request-status").textContent =
      useWeb ?
      "Searching the web…" :
      "Contacting " +
      providerLabel(state.provider) +
      "…";
    
    Promise.resolve()
      .then(function() {
        if (!useWeb) {
          return null;
        }
        
        return window.TibUITools.webSearch
          .run(
            prompt.substring(0, 300),
            false
          )
          .then(function(data) {
            sources = data.results;
            
            context =
              window.TibUITools.webSearch
              .searchContext(sources);
            
            byId("request-status").textContent =
              "Found " +
              sources.length +
              " web sources through " +
              data.route +
              ". Contacting model…";
          })
          .catch(function(error) {
            byId("request-status").textContent =
              "Web search unavailable; sending without it. " +
              error.message;
          });
      })
      .then(function() {
        return providerRequest(
          prompt,
          context
        );
      })
      
      .then(function(content) {
        chat.messages.push({
          role: "assistant",
          content: content,
          kind: state.provider === "hordeImage" ? "image" : "text",
          alt: state.provider === "hordeImage" ? prompt : "",
          label: providerLabel(state.provider),
          sources: sources,
        });
        byId("request-status").textContent = "";
        saveState();
        renderMessages();
      })
      .catch(function(error) {
        if (error.message !== "Request cancelled.") {
          chat.messages.push({
            role: "assistant",
            content: error.message,
            error: true,
            label: providerLabel(state.provider),
          });
          byId("request-status").textContent = "";
          renderMessages();
        }
      })
      .then(function() {
        clearActiveJob();
        setSending(false);
        byId("prompt-input").focus();
      });
  }
  
  function resizePrompt() {
    var input = byId("prompt-input");
    input.style.height = "38px";
    input.style.height = Math.min(170, input.scrollHeight) + "px";
  }
  
  function applyTheme() {
    var isDark;
    var themeColor = document.querySelector('meta[name="theme-color"]');
    document.documentElement.setAttribute("data-theme", state.theme);
    byId("theme").value = state.theme;
    isDark =
      state.theme === "dark" ||
      (state.theme === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    byId("theme-toggle").innerHTML = isDark ? "&#9728;" : "&#9790;";
    byId("theme-toggle").setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    byId("theme-toggle").title = isDark ?
      "Switch to light mode" :
      "Switch to dark mode";
    if (themeColor) {
      themeColor.setAttribute("content", isDark ? "#171815" : "#f6f6f3");
    }
  }
  
  function applyCompatibility() {
    setClass(document.body, "max-compat", state.maxCompatibility);
    setClass(document.body, "reduce-motion", state.reduceMotion);
    setClass(
      document.body,
      "visual-effects",
      state.visualEffects && !state.maxCompatibility
    );
    setClass(document.body, "logos-hidden", !state.showModelLogos);
  }
  
  function applyPreset(name) {
    state.compatPreset = name;
    if (name === "maximum") {
      state.maxCompatibility = true;
      state.reduceMotion = true;
      state.visualEffects = false;
      state.autoModelRefresh = false;
      state.requestTimeout = 180;
      state.historyLimit = 12;
    } else if (name === "balanced") {
      state.maxCompatibility = false;
      state.reduceMotion = false;
      state.visualEffects = true;
      state.autoModelRefresh = true;
      state.requestTimeout = 120;
      state.historyLimit = 24;
    } else {
      state.maxCompatibility = false;
      state.reduceMotion = true;
      state.visualEffects = false;
      state.autoModelRefresh = false;
      state.requestTimeout = 90;
      state.historyLimit = 8;
    }
    fillSettings();
    applyCompatibility();
    saveState();
  }
  
  function syncStateFromInputs() {
    state.theme = byId("theme").value;
    state.saveChats = byId("save-chats").checked;
    state.showModelLogos = byId("show-model-logos").checked;
    state.systemPrompt = byId("system-prompt").value;
    state.hordeSafety = byId("horde-safety").checked;
    state.hordeImageSize = byId("horde-image-size").value;
    state.hordeImageSampler = byId("horde-image-sampler").value;
    state.hordeImageSteps = Math.round(
      clampNumber(byId("horde-image-steps").value, 25, 10, 50)
    );
    state.hordeImageGuidance = clampNumber(
      byId("horde-image-guidance").value,
      7.5,
      1,
      20
    );
    state.hordeImageKarras = byId("horde-image-karras").checked;
    state.hordeImageSeed = byId("horde-image-seed")
      .value.replace(/[^0-9]/g, "")
      .substring(0, 20);
    state.ollamaUrl =
      stripSlash(byId("ollama-url").value) || "http://localhost:11434";
    state.ollamaModel =
      byId("ollama-model").value.replace(/^\s+|\s+$/g, "") || "llama3.2";
    state.ollamaTemperature = clampNumber(
      byId("ollama-temperature").value,
      0.8,
      0,
      2
    );
    state.ollamaTopP = clampNumber(byId("ollama-top-p").value, 0.9, 0, 1);
    state.ollamaContext = Math.round(
      clampNumber(byId("ollama-context").value, 4096, 512, 131072)
    );
    state.ollamaSeed = Math.round(
      clampNumber(byId("ollama-seed").value, -1, -1, 2147483647)
    );
    state.ollamaKeepAlive =
      byId("ollama-keep-alive").value.replace(/^\s+|\s+$/g, "") || "5m";
    state.customUrl =
      stripSlash(byId("custom-url").value) || "https://api.openai.com/v1";
    state.customModel =
      byId("custom-model").value.replace(/^\s+|\s+$/g, "") || "gpt-4o-mini";
    state.webSearchEnabled = byId("web-search-enabled").checked;
    if (!state.webSearchEnabled) {
      state.webSearchToolActive = false;
    }
    state.webSearchMode = byId("web-search-mode").value;
    state.webSearchRelay =
      stripSlash(byId("web-search-relay").value) || "/searxng";
    state.webSearchInstances = parseLines(byId("web-search-instances").value);
    state.webSearchResultsCount = Math.round(
      clampNumber(byId("web-search-results-count").value, 5, 1, 10)
    );
    state.compatPreset = byId("compat-preset").value;
    state.maxCompatibility = byId("max-compatibility").checked;
    state.reduceMotion = byId("reduce-motion").checked;
    state.visualEffects = byId("visual-effects").checked;
    state.autoModelRefresh = byId("auto-model-refresh").checked;
    state.requestTimeout = Math.round(
      clampNumber(byId("request-timeout").value, 180, 30, 300)
    );
    state.historyLimit = Math.round(
      clampNumber(byId("history-limit").value, 12, 2, 100)
    );
    updateWebToolUI();
    applyTheme();
    applyCompatibility();
  }
  
  function fillSettings() {
    byId("theme").value = state.theme;
    byId("save-chats").checked = state.saveChats;
    byId("show-model-logos").checked = state.showModelLogos;
    byId("system-prompt").value = state.systemPrompt;
    byId("horde-safety").checked = state.hordeSafety;
    byId("horde-image-size").value = state.hordeImageSize;
    byId("horde-image-sampler").value = state.hordeImageSampler;
    byId("horde-image-steps").value = state.hordeImageSteps;
    byId("horde-image-guidance").value = state.hordeImageGuidance;
    byId("horde-image-karras").checked = state.hordeImageKarras;
    byId("horde-image-seed").value = state.hordeImageSeed;
    window.TibUITools.imageControls.updateLabels();
    
    byId("ollama-url").value = state.ollamaUrl;
    byId("ollama-model").value = state.ollamaModel;
    byId("ollama-temperature").value = state.ollamaTemperature;
    byId("ollama-top-p").value = state.ollamaTopP;
    byId("ollama-context").value = state.ollamaContext;
    byId("ollama-seed").value = state.ollamaSeed;
    byId("ollama-keep-alive").value = state.ollamaKeepAlive;
    byId("custom-url").value = state.customUrl;
    byId("custom-model").value = state.customModel;
    byId("web-search-enabled").checked = state.webSearchEnabled;
    byId("web-search-mode").value = state.webSearchMode;
    byId("web-search-relay").value = state.webSearchRelay;
    byId("web-search-instances").value = state.webSearchInstances.join("\n");
    byId("web-search-results-count").value = state.webSearchResultsCount;
    byId("compat-preset").value = state.compatPreset;
    byId("max-compatibility").checked = state.maxCompatibility;
    byId("reduce-motion").checked = state.reduceMotion;
    byId("visual-effects").checked = state.visualEffects;
    byId("auto-model-refresh").checked = state.autoModelRefresh;
    byId("request-timeout").value = state.requestTimeout;
    byId("history-limit").value = state.historyLimit;
    updateWebToolUI();
  }
  
  function updatePrivacy() {
    byId("privacy-label").innerHTML =
      "<span></span>" +
      (state.saveChats ?
        "Chats saved in a cookie" :
        "Private session — not saved");
  }
  
  
  
  function openMenu() {
    addClass(document.body, "menu-open");
    byId("menu-button").setAttribute("aria-expanded", "true");
  }
  
  function closeMenu() {
    removeClass(document.body, "menu-open");
    byId("menu-button").setAttribute("aria-expanded", "false");
  }
  
  function openSettings() {
    lastFocus = document.activeElement;
    fillSettings();
    byId("settings-status").textContent = "";
    byId("settings-modal").hidden = false;
    closeMenu();
    byId("close-settings").focus();
  }
  
  function closeSettings(save) {
    if (save) {
      syncStateFromInputs();
      saveState();
      rebuildModelSelect();
    }
    byId("settings-modal").hidden = true;
    if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }
  
  function clearData() {
    state.chats = [];
    state.activeId = "";
    state.saveChats = false;
    document.cookie = COOKIE_NAME + "=; Max-Age=0; Path=/; SameSite=Lax";
    document.cookie = "tibui_state_v1=; Max-Age=0; Path=/; SameSite=Lax";
    byId("save-chats").checked = false;
    newChat();
    byId("settings-status").textContent =
      "Saved chats and cookie data cleared.";
  }
  
  function trapModal(event) {
    var modal;
    var focusable;
    var first;
    var last;
    if (event.key !== "Tab" || byId("settings-modal").hidden) {
      return;
    }
    modal = byId("settings-modal");
    focusable = modal.querySelectorAll(
      "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, a[href]"
    );
    if (!focusable.length) {
      return;
    }
    first = focusable[0];
    last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  
  function updateViewport() {
    document.documentElement.style.setProperty(
      "--app-height",
      window.innerHeight + "px"
    );
  }
  
  function bind() {
    byId("new-chat").onclick = newChat;
    byId("menu-button").onclick = openMenu;
    byId("close-menu").onclick = closeMenu;
    byId("scrim").onclick = closeMenu;
    byId("settings-button").onclick = openSettings;
    byId("settings-top").onclick = openSettings;
    byId("theme-toggle").onclick = function() {
      var currentDark =
        state.theme === "dark" ||
        (state.theme === "system" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      state.theme = currentDark ? "light" : "dark";
      applyTheme();
      saveState();
    };
    byId("close-settings").onclick = function() {
      closeSettings(false);
    };
    byId("done-settings").onclick = function() {
      closeSettings(true);
    };
    byId("settings-modal").onclick = function(event) {
      if (event.target === byId("settings-modal")) {
        closeSettings(true);
      }
    };
    byId("provider").onchange = function() {
      updateProviderUI(true);
    };
    byId("model").onchange = onModelChange;
    byId("prompt-form").onsubmit = submitPrompt;
    byId("prompt-input").oninput = resizePrompt;
    byId("prompt-input").onkeydown = function(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        byId("prompt-form").dispatchEvent(
          new Event("submit", { cancelable: true })
        );
      }
    };
    byId("load-pollinations").onclick = loadPollinationsModels;
    byId("load-horde-text").onclick = function() {
      loadHordeModels("text");
    };
    byId("load-horde-image").onclick = function() {
      loadHordeModels("image");
    };
    byId("load-ollama").onclick = loadOllamaModels;
    byId("clear-data").onclick = clearData;
    byId("theme").onchange = function() {
      state.theme = this.value;
      applyTheme();
    };
    byId("show-model-logos").onchange = function() {
      state.showModelLogos = this.checked;
      applyCompatibility();
    };
    byId("compat-preset").onchange = function() {
      applyPreset(this.value);
    };
    byId("max-compatibility").onchange = function() {
      if (this.checked) {
        applyPreset("maximum");
      } else if (byId("compat-preset").value === "maximum") {
        applyPreset("balanced");
      }
    };
    document.onkeydown = function(event) {
      if (event.key === "Escape") {
        if (!byId("settings-modal").hidden) {
          closeSettings(true);
        } else {
          closeMenu();
        }
      }
      trapModal(event);
    };
    window.addEventListener("resize", updateViewport, false);
    window.addEventListener("orientationchange", updateViewport, false);
  }
  
  function init() {
    loadState();
    state.requestTimeout = clampNumber(state.requestTimeout, 180, 30, 300);
    state.historyLimit = clampNumber(state.historyLimit, 12, 2, 100);
    if (!state.chats.length) {
      state.chats.push({ id: makeId(), title: "New chat", messages: [] });
      state.activeId = state.chats[0].id;
    }
    if (!activeChat()) {
      state.activeId = state.chats[state.chats.length - 1].id;
    }
    updateViewport();
    
    window.TibUITools.webSearch.init({
      state: state,
      byId: byId,
      stripSlash: stripSlash,
      requestJson: requestJson,
      saveState: saveState,
      setClass: setClass,
      syncStateFromInputs: syncStateFromInputs,
    });
    
    window.TibUITools.imageControls.init({
      state: state,
      byId: byId,
      setClass: setClass,
      refreshImageModels: function() {
        loadHordeModels("image");
      },
    });
    
    bind();
    fillSettings();
    
    applyTheme();
    applyCompatibility();
    byId("provider").value = state.provider;
    if (byId("provider").selectedIndex < 0) {
      state.provider = "chat";
      byId("provider").value = "chat";
    }
    updateProviderUI(false);
    updatePrivacy();
    renderChats();
    renderMessages();
    if (state.autoModelRefresh) {
      loadPollinationsModels();
      loadHordeModels("text");
      loadHordeModels("image");
    }
  }
  
  init();
})();