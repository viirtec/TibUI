(function() {
  "use strict";
  
  var COOKIE = "tibui_state";
  var COOKIE_LIMIT = 3600;
  
  var state = {
    chats: [],
    activeId: "",
    provider: "chat",
    theme: "system",
    saveChats: false,
    systemPrompt: "",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3.2",
    customUrl: "https://api.openai.com/v1",
    customModel: "gpt-4o-mini",
    pollinationsModel: "openai-fast",
    hordeModel: "stable_diffusion",
    hordeSafety: true
  };
  
  var pollinationsModels = [
  {
    value: "openai-fast",
    label: "OpenAI Fast (anonymous)"
  }];
  
  var hordeModels = [
  {
    value: "stable_diffusion",
    label: "Stable Diffusion",
    workers: 0,
    eta: 0
  }];
  
  var activeRequest = null;
  
  function el(id) {
    return document.getElementById(id);
  }
  
  function trim(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }
  
  function makeId() {
    return "c" +
      new Date().getTime().toString(36) +
      Math.random().toString(36).slice(2, 7);
  }
  
  function newChat() {
    return {
      id: makeId(),
      title: "New chat",
      updated: new Date().getTime(),
      messages: []
    };
  }
  
  function clear(node) {
    if (!node) {
      return;
    }
    
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }
  
  function currentChat() {
    var i;
    
    for (i = 0; i < state.chats.length; i += 1) {
      if (state.chats[i].id === state.activeId) {
        return state.chats[i];
      }
    }
    
    return null;
  }
  
  function readCookie() {
    var parts = document.cookie ? document.cookie.split(";") : [];
    var prefix = COOKIE + "=";
    var i;
    
    for (i = 0; i < parts.length; i += 1) {
      parts[i] = parts[i].replace(/^\s+/, "");
      
      if (parts[i].indexOf(prefix) === 0) {
        return parts[i].slice(prefix.length);
      }
    }
    
    return "";
  }
  
  function deleteCookie() {
    document.cookie =
      COOKIE +
      "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/";
  }
  
  function loadSavedState() {
    var raw = readCookie();
    var saved;
    var key;
    
    if (!raw) {
      return;
    }
    
    try {
      saved = JSON.parse(decodeURIComponent(raw));
      
      if (!saved || saved.v !== 1 || !saved.saveChats) {
        return;
      }
      
      for (key in state) {
        if (
          Object.prototype.hasOwnProperty.call(state, key) &&
          typeof saved[key] !== "undefined"
        ) {
          state[key] = saved[key];
        }
      }
      
      state.saveChats = true;
    } catch (error) {
      deleteCookie();
    }
  }
  
  function savedCopy() {
    return {
      v: 1,
      chats: state.chats,
      activeId: state.activeId,
      provider: state.provider,
      theme: state.theme,
      saveChats: true,
      systemPrompt: state.systemPrompt,
      ollamaUrl: state.ollamaUrl,
      ollamaModel: state.ollamaModel,
      customUrl: state.customUrl,
      customModel: state.customModel,
      pollinationsModel: state.pollinationsModel,
      hordeModel: state.hordeModel,
      hordeSafety: state.hordeSafety
    };
  }
  
  function saveState() {
    var data;
    var encoded;
    var active;
    var i;
    
    if (!state.saveChats) {
      return;
    }
    
    try {
      data = JSON.parse(JSON.stringify(savedCopy()));
      encoded = encodeURIComponent(JSON.stringify(data));
      
      while (
        encoded.length > COOKIE_LIMIT &&
        data.chats.length > 1
      ) {
        for (i = 0; i < data.chats.length; i += 1) {
          if (data.chats[i].id !== data.activeId) {
            data.chats.splice(i, 1);
            break;
          }
        }
        
        encoded = encodeURIComponent(JSON.stringify(data));
      }
      
      active = null;
      
      for (i = 0; i < data.chats.length; i += 1) {
        if (data.chats[i].id === data.activeId) {
          active = data.chats[i];
          break;
        }
      }
      
      while (
        encoded.length > COOKIE_LIMIT &&
        active &&
        active.messages.length > 2
      ) {
        active.messages.splice(0, 2);
        encoded = encodeURIComponent(JSON.stringify(data));
      }
      
      document.cookie =
        COOKIE +
        "=" +
        encoded +
        "; expires=" +
        new Date(
          new Date().getTime() + 31536000000
        ).toUTCString() +
        "; Path=/";
    } catch (error) {
      /* Ignore storage errors. */
    }
  }
  
  function applyTheme() {
    var meta;
    
    document.documentElement.setAttribute(
      "data-theme",
      state.theme
    );
    
    if (el("theme")) {
      el("theme").value = state.theme;
    }
    
    meta = document.querySelector(
      'meta[name="theme-color"]'
    );
    
    if (meta) {
      meta.setAttribute(
        "content",
        state.theme === "dark" ? "#171815" : "#f6f6f3"
      );
    }
  }
  
  function renderList() {
    var list = el("chat-list");
    var chats;
    var row;
    var title;
    var remove;
    var i;
    
    if (!list) {
      return;
    }
    
    chats = state.chats.slice(0);
    clear(list);
    
    chats.sort(function(a, b) {
      return b.updated - a.updated;
    });
    
    if (
      !chats.length ||
      (chats.length === 1 && !chats[0].messages.length)
    ) {
      row = document.createElement("div");
      row.className = "chat-empty";
      row.textContent = "No saved conversations";
      list.appendChild(row);
      return;
    }
    
    for (i = 0; i < chats.length; i += 1) {
      if (!chats[i].messages.length) {
        continue;
      }
      
      row = document.createElement("div");
      row.className =
        "chat-item" +
        (chats[i].id === state.activeId ? " active" : "");
      
      title = document.createElement("button");
      title.type = "button";
      title.className = "chat-title";
      title.setAttribute("data-chat", chats[i].id);
      title.textContent = chats[i].title;
      
      remove = document.createElement("button");
      remove.type = "button";
      remove.className = "delete-chat";
      remove.setAttribute("data-delete", chats[i].id);
      remove.setAttribute(
        "aria-label",
        "Delete " + chats[i].title
      );
      remove.textContent = "×";
      
      row.appendChild(title);
      row.appendChild(remove);
      list.appendChild(row);
    }
  }
  
  function appendMessage(message, pending) {
    var wrap = document.createElement("article");
    var role = document.createElement("div");
    var content = document.createElement("div");
    var toolbar;
    var copyButton;
    var image;
    var link;
    
    wrap.className =
      "message " +
      message.role +
      (pending ? " pending" : "");
    
    role.className = "message-role";
    role.textContent =
      message.role === "user" ? "You" : "Assistant";
    
    content.className = "message-content";
    
    if (pending) {
      content.innerHTML =
        '<span class="dot"></span>' +
        '<span class="dot"></span>' +
        '<span class="dot"></span>';
      
      wrap.id = "pending-message";
    } else {
      if (message.content) {
        if (message.role === "assistant") {
          content.innerHTML =
            renderMarkdown(message.content);
        } else {
          content.textContent = message.content;
        }
      }
      
      if (message.imageUrl) {
        image = document.createElement("img");
        image.className = "generated-image";
        image.src = message.imageUrl;
        image.alt = message.prompt ?
          "Generated image: " + message.prompt :
          "Generated image";
        
        if ("loading" in image) {
          image.loading = "lazy";
        }
        
        link = document.createElement("a");
        link.className = "image-link";
        link.href = message.imageUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "Open full image";
        
        content.appendChild(image);
        content.appendChild(link);
      }
      
      toolbar = document.createElement("div");
      toolbar.className = "message-toolbar";
      
      copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "copy-message-button";
      copyButton.textContent = "Copy";
      copyButton.setAttribute(
        "aria-label",
        "Copy message"
      );
      
      copyButton.addEventListener("click", function() {
        copyToClipboard(
          message.content || "",
          copyButton
        );
      });
      
      toolbar.appendChild(copyButton);
    }
    
    wrap.appendChild(role);
    wrap.appendChild(content);
    
    if (!pending) {
      wrap.appendChild(toolbar);
    }
    
    if (el("messages")) {
      el("messages").appendChild(wrap);
    }
    
    if (
      !pending &&
      message.role === "assistant"
    ) {
      addCodeBlockButtons(content);
    }
  }
  
  function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(markdown) {
  var source = String(markdown || "");
  var codeBlocks = [];

  /*
   * Extract fenced code blocks before processing
   * the rest of the Markdown.
   */
  source = source.replace(
    /```([a-zA-Z0-9_+#.-]*)[ \t]*\n([\s\S]*?)```/g,
    function (match, language, code) {
      var index = codeBlocks.length;

      codeBlocks.push({
        language: language || "code",
        code: code.replace(/\n$/, "")
      });

      return "___CODE_BLOCK_" + index + "___";
    }
  );

  /*
   * Escape all ordinary response text.
   */
  source = escapeHtml(source);

  /*
   * Headings.
   */
  source = source.replace(
    /^### (.+)$/gm,
    "<h3>$1</h3>"
  );

  source = source.replace(
    /^## (.+)$/gm,
    "<h2>$1</h2>"
  );

  source = source.replace(
    /^# (.+)$/gm,
    "<h1>$1</h1>"
  );

  /*
   * Bold and italic.
   */
  source = source.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  source = source.replace(
    /(^|[^*])\*([^*\n]+)\*/g,
    "$1<em>$2</em>"
  );

  /*
   * Inline code.
   */
  source = source.replace(
    /`([^`\n]+)`/g,
    '<code class="inline-code">$1</code>'
  );

  /*
   * Links.
   */
  source = source.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  /*
   * Unordered lists.
   */
  source = source.replace(
    /^[ \t]*[-*+] (.+)$/gm,
    "<li>$1</li>"
  );

  source = source.replace(
    /(<li>.*<\/li>)/g,
    "<ul>$1</ul>"
  );

  /*
   * Blockquotes.
   */
  source = source.replace(
    /^&gt; ?(.+)$/gm,
    "<blockquote>$1</blockquote>"
  );

  /*
   * Paragraphs and line breaks.
   */
  source = source.replace(
    /\n{2,}/g,
    "</p><p>"
  );

  source = source.replace(
    /\n/g,
    "<br>"
  );

  source = "<p>" + source + "</p>";

  /*
   * Avoid unnecessary paragraph tags around block elements.
   */
  source = source.replace(
    /<p>(<h[1-3]>)/g,
    "$1"
  );

  source = source.replace(
    /(<\/h[1-3]>)<\/p>/g,
    "$1"
  );

  source = source.replace(
    /<p>(<ul>)/g,
    "$1"
  );

  source = source.replace(
    /(<\/ul>)<\/p>/g,
    "$1"
  );

  source = source.replace(
    /<p>(<blockquote>)/g,
    "$1"
  );

  source = source.replace(
    /(<\/blockquote>)<\/p>/g,
    "$1"
  );

  /*
   * Restore code blocks.
   */
  source = source.replace(
    /___CODE_BLOCK_(\d+)___/g,
    function (match, index) {
      var block = codeBlocks[Number(index)];

      return (
        '<div class="code-block">' +
          '<div class="code-block-header">' +
            '<span class="code-language">' +
              escapeHtml(block.language) +
            "</span>" +
            '<button type="button" ' +
              'class="copy-code-button">' +
              "Copy" +
            "</button>" +
          "</div>" +
          "<pre><code>" +
            escapeHtml(block.code) +
          "</code></pre>" +
        "</div>"
      );
    }
  );

  return source;
}

function copyToClipboard(text, button) {
  var oldText = button.textContent;

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {
    navigator.clipboard.writeText(text).then(
      function () {
        button.textContent = "Copied";

        window.setTimeout(function () {
          button.textContent = oldText;
        }, 1200);
      },
      function () {
        fallbackCopy(text, button, oldText);
      }
    );

    return;
  }

  fallbackCopy(text, button, oldText);
}

function fallbackCopy(text, button, oldText) {
  var textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } catch (error) {
    console.error("Copy failed:", error);
  }

  document.body.removeChild(textarea);

  button.textContent = "Copied";

  window.setTimeout(function () {
    button.textContent = oldText;
  }, 1200);
}

function addCodeBlockButtons(container) {
  var buttons = container.querySelectorAll(
    ".copy-code-button"
  );
  var i;

  for (i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener("click", function () {
      var block = this.parentNode.parentNode;
      var code = block.querySelector("code");

      if (code) {
        copyToClipboard(code.textContent, this);
      }
    });
  }
}

  
  
  function scrollBottom() {
    window.setTimeout(function() {
      var conversation = el("conversation");
      
      if (conversation) {
        conversation.scrollTop =
          conversation.scrollHeight;
      }
    }, 0);
  }
  
  function renderConversation() {
    var chat = currentChat();
    var i;
    
    clear(el("messages"));
    
    if (el("welcome")) {
      el("welcome").hidden = !!(chat && chat.messages.length);
    }
    
    if (chat) {
      for (
        i = 0; i < chat.messages.length; i += 1
      ) {
        appendMessage(chat.messages[i], false);
      }
    }
    
    scrollBottom();
  }
  
  function setOptions(node, options, chosen) {
    var option;
    var i;
    
    if (!node) {
      return;
    }
    
    clear(node);
    
    for (i = 0; i < options.length; i += 1) {
      option = document.createElement("option");
      option.value = options[i].value;
      option.textContent = options[i].label;
      
      if (option.value === chosen) {
        option.selected = true;
      }
      
      node.appendChild(option);
    }
  }
  
  function providerNote() {
    var model;
    var i;
    
    if (state.provider === "chat") {
      return "GPT-4o through ch.at. No API key is required.";
    }
    
    if (state.provider === "pollinations") {
      return "Pollinations' anonymous legacy text API. Free models are loaded live.";
    }
    
    if (state.provider === "horde") {
      model = null;
      
      for (i = 0; i < hordeModels.length; i += 1) {
        if (
          hordeModels[i].value ===
          state.hordeModel
        ) {
          model = hordeModels[i];
          break;
        }
      }
      
      if (model && model.workers > 0) {
        return (
          "Stable Horde: " +
          model.workers +
          " worker" +
          (model.workers === 1 ? "" : "s") +
          " available · current estimated ETA " +
          model.eta +
          "s · safety filter " +
          (state.hordeSafety ? "on" : "off") +
          "."
        );
      }
      
      return "Keyless image generation on Stable Horde. Live worker information is refreshing.";
    }
    
    if (state.provider === "ollama") {
      return (
        "Local Ollama at " +
        state.ollamaUrl +
        ". Messages stay on that server."
      );
    }
    
    return "OpenAI-compatible chat. The optional key stays in memory and is never saved.";
  }
  
  function updateProvider() {
    var boxes = document.querySelectorAll(
      ".provider-settings"
    );
    var i;
    
    if (el("provider")) {
      el("provider").value = state.provider;
    }
    
    if (state.provider === "chat") {
      setOptions(
        el("model"),
        [
        {
          value: "gpt-4o",
          label: "GPT-4o"
        }],
        "gpt-4o"
      );
    } else if (state.provider === "pollinations") {
      setOptions(
        el("model"),
        pollinationsModels,
        state.pollinationsModel
      );
    } else if (state.provider === "horde") {
      setOptions(
        el("model"),
        hordeModels,
        state.hordeModel
      );
    } else if (state.provider === "ollama") {
      setOptions(
        el("model"),
        [
        {
          value: state.ollamaModel,
          label: state.ollamaModel
        }],
        state.ollamaModel
      );
    } else {
      setOptions(
        el("model"),
        [
        {
          value: state.customModel,
          label: state.customModel
        }],
        state.customModel
      );
    }
    
    if (el("provider-note")) {
      el("provider-note").textContent =
        providerNote();
    }
    
    if (el("provider-summary")) {
      el("provider-summary").textContent =
        providerNote();
    }
    
    if (el("horde-model-info")) {
      el("horde-model-info").textContent =
        state.provider === "horde" ?
        providerNote() :
        "";
    }
    
    if (el("prompt-input")) {
      el("prompt-input").placeholder =
        state.provider === "horde" ?
        "Describe an image" :
        "Message TibUI";
    }
    
    for (i = 0; i < boxes.length; i += 1) {
      boxes[i].hidden =
        boxes[i].getAttribute("data-provider") !==
        state.provider;
    }
    
    saveState();
  }
  
  function updatePrivacy() {
    if (el("privacy-label")) {
      el("privacy-label").innerHTML =
        "<span></span> " +
        (
          state.saveChats ?
          "Cookie saving enabled" :
          "Private session — not saved"
        );
    }
    
    if (el("save-chats")) {
      el("save-chats").checked =
        state.saveChats;
    }
  }
  
  function makeNewChat() {
    var chat = currentChat();
    
    if (!chat || chat.messages.length) {
      chat = newChat();
      state.chats.push(chat);
      state.activeId = chat.id;
    }
    
    renderList();
    renderConversation();
    saveState();
    closeMenu();
    
    if (el("prompt-input")) {
      el("prompt-input").focus();
    }
  }
  
  function removeChat(id) {
    var kept = [];
    var i;
    
    for (i = 0; i < state.chats.length; i += 1) {
      if (state.chats[i].id !== id) {
        kept.push(state.chats[i]);
      }
    }
    
    state.chats = kept;
    
    if (!state.chats.length) {
      state.chats.push(newChat());
    }
    
    if (!currentChat()) {
      state.activeId = state.chats[0].id;
    }
    
    renderList();
    renderConversation();
    saveState();
  }
  
  function selectChat(id) {
    state.activeId = id;
    renderList();
    renderConversation();
    saveState();
    closeMenu();
  }
  
  function closeMenu() {
    document.body.classList.remove(
      "menu-open"
    );
  }
  
  function readSettings() {
    var wasSaving = state.saveChats;
    
    state.theme = el("theme").value;
    state.saveChats =
      el("save-chats").checked;
    
    state.ollamaUrl =
      trim(el("ollama-url").value)
      .replace(/\/+$/, "") ||
      "http://localhost:11434";
    
    state.ollamaModel =
      trim(el("ollama-model").value) ||
      "llama3.2";
    
    state.customUrl =
      trim(el("custom-url").value)
      .replace(/\/+$/, "") ||
      "https://api.openai.com/v1";
    
    state.customModel =
      trim(el("custom-model").value) ||
      "gpt-4o-mini";
    
    state.systemPrompt =
      trim(el("system-prompt").value);
    
    state.hordeSafety =
      el("horde-safety").checked;
    
    if (!state.saveChats && wasSaving) {
      deleteCookie();
    }
    
    applyTheme();
    updatePrivacy();
    updateProvider();
    saveState();
  }
  
  function openSettings() {
    el("theme").value = state.theme;
    el("save-chats").checked =
      state.saveChats;
    
    el("ollama-url").value =
      state.ollamaUrl;
    
    el("ollama-model").value =
      state.ollamaModel;
    
    el("custom-url").value =
      state.customUrl;
    
    el("custom-model").value =
      state.customModel;
    
    el("horde-safety").checked =
      state.hordeSafety;
    
    el("system-prompt").value =
      state.systemPrompt;
    
    el("settings-status").textContent = "";
    
    updateProvider();
    
    el("settings-modal").hidden = false;
    document.body.style.overflow = "hidden";
    
    el("close-settings").focus();
  }
  
  function closeSettings() {
    el("settings-modal").hidden = true;
    document.body.style.overflow = "";
  }
  
  function requestJson(
    method,
    url,
    body,
    headers,
    callback
  ) {
    var xhr = new XMLHttpRequest();
    var finished = false;
    var key;
    
    function done(error, data) {
      if (finished) {
        return;
      }
      
      finished = true;
      callback(error, data);
    }
    
    try {
      xhr.open(method, url, true);
      xhr.timeout = 120000;
      
      if (body !== null) {
        xhr.setRequestHeader(
          "Content-Type",
          "application/json"
        );
      }
      
      headers = headers || {};
      
      for (key in headers) {
        if (
          Object.prototype.hasOwnProperty.call(
            headers,
            key
          )
        ) {
          xhr.setRequestHeader(
            key,
            headers[key]
          );
        }
      }
    } catch (error) {
      done(
        new Error(
          "Could not start the network request: " +
          error.message
        )
      );
      
      return xhr;
    }
    
    xhr.onreadystatechange = function() {
      var data;
      var detail;
      
      if (
        xhr.readyState !== 4 ||
        finished
      ) {
        return;
      }
      
      try {
        data = xhr.responseText ?
          JSON.parse(xhr.responseText) : {};
      } catch (error) {
        data = null;
      }
      
      if (
        xhr.status >= 200 &&
        xhr.status < 300
      ) {
        if (data !== null) {
          done(null, data);
        } else {
          done(
            new Error(
              "The provider returned an unreadable response."
            )
          );
        }
      } else if (xhr.status === 0) {
        done(
          new Error(
            "Could not reach the provider. Check its URL, CORS settings, HTTPS/mixed-content restrictions, and your connection."
          )
        );
      } else {
        detail =
          data &&
          (
            data.message ||
            (
              data.error &&
              (
                data.error.message ||
                data.error
              )
            )
          );
        
        done(
          new Error(
            detail ||
            "Provider request failed (HTTP " +
            xhr.status +
            ")."
          )
        );
      }
    };
    
    xhr.ontimeout = function() {
      done(
        new Error(
          "The provider took too long to respond."
        )
      );
    };
    
    xhr.onerror = function() {
      done(
        new Error(
          "Network error. Check the provider URL and its CORS configuration."
        )
      );
    };
    
    xhr.onabort = function() {
      done(
        new Error("Request stopped.")
      );
    };
    
    try {
      xhr.send(
        body === null ?
        null :
        JSON.stringify(body)
      );
    } catch (error) {
      done(
        new Error(
          "Could not send the request: " +
          error.message
        )
      );
    }
    
    return xhr;
  }
  
  function chatMessages(chat) {
    var messages = [];
    var i;
    
    if (state.systemPrompt) {
      messages.push({
        role: "system",
        content: state.systemPrompt
      });
    }
    
    for (
      i = 0; i < chat.messages.length; i += 1
    ) {
      if (!chat.messages[i].imageUrl) {
        messages.push({
          role: chat.messages[i].role,
          content: chat.messages[i].content
        });
      }
    }
    
    return messages;
  }
  
  function compatibleUrl(base) {
    base = trim(base).replace(/\/+$/, "");
    
    if (
      /\/chat\/completions$/.test(base)
    ) {
      return base;
    }
    
    if (/\/v1$/.test(base)) {
      return base +
        "/chat/completions";
    }
    
    return base +
      "/v1/chat/completions";
  }
  
  function sendChat(
    chat,
    provider,
    callback
  ) {
    var url;
    var model;
    var headers = {};
    var key;
    
    if (provider === "chat") {
      url =
        "https://ch.at/v1/chat/completions";
      model = "gpt-4o";
    } else if (
      provider === "pollinations"
    ) {
      url =
        "https://text.pollinations.ai/openai";
      model =
        state.pollinationsModel;
    } else if (
      provider === "ollama"
    ) {
      url =
        state.ollamaUrl +
        "/api/chat";
      model =
        state.ollamaModel;
    } else {
      url =
        compatibleUrl(state.customUrl);
      
      model =
        state.customModel;
      
      key = trim(
        el("custom-key").value
      );
      
      if (key) {
        headers.Authorization =
          "Bearer " + key;
      }
    }
    
    return requestJson(
      "POST",
      url,
      {
        model: model,
        messages: chatMessages(chat),
        stream: false
      },
      headers,
      function(error, data) {
        var content;
        
        if (error) {
          callback(error);
          return;
        }
        
        if (provider === "ollama") {
          content =
            data &&
            data.message &&
            data.message.content;
        } else {
          content =
            data &&
            data.choices &&
            data.choices[0] &&
            data.choices[0].message &&
            data.choices[0].message.content;
        }
        
        callback(
          typeof content === "string" ?
          null :
          new Error(
            "The provider response did not contain an assistant message."
          ),
          content
        );
      }
    );
  }
  
  function sendHorde(
    prompt,
    callback
  ) {
    var base =
      "https://aihorde.net/api/v2/generate";
    
    var headers = {
      apikey: "0000000000",
      "Client-Agent": "TibUI:1.0:anonymous"
    };
    
    var controller = {
      xhr: null,
      timer: null,
      id: "",
      stopped: false,
      complete: false
    };
    
    function finish(error, result) {
      if (controller.complete) {
        return;
      }
      
      controller.complete = true;
      
      if (controller.timer) {
        window.clearTimeout(
          controller.timer
        );
      }
      
      callback(error, result);
    }
    
    function getResult() {
      controller.xhr = requestJson(
        "GET",
        base +
        "/status/" +
        encodeURIComponent(
          controller.id
        ),
        null,
        headers,
        function(error, data) {
          var generation;
          
          if (controller.stopped) {
            return;
          }
          
          if (error) {
            finish(error);
            return;
          }
          
          generation =
            data &&
            data.generations &&
            data.generations[0];
          
          if (
            !generation ||
            !generation.img
          ) {
            finish(
              new Error(
                "Stable Horde finished without returning an image."
              )
            );
            
            return;
          }
          
          finish(
            null,
            {
              content: "Image generated by Stable Horde.",
              imageUrl: generation.img,
              prompt: prompt
            }
          );
        }
      );
    }
    
    function check() {
      controller.xhr = requestJson(
        "GET",
        base +
        "/check/" +
        encodeURIComponent(
          controller.id
        ),
        null,
        headers,
        function(error, data) {
          if (controller.stopped) {
            return;
          }
          
          if (error) {
            finish(error);
            return;
          }
          
          if (data.done) {
            getResult();
            return;
          }
          
          el("request-status").className =
            "request-status info";
          
          el("request-status").textContent =
            "Stable Horde queue: " +
            (
              typeof data.queue_position ===
              "number" ?
              data.queue_position +
              " ahead" :
              "waiting"
            ) +
            (
              data.wait_time ?
              " · about " +
              data.wait_time +
              "s" :
              ""
            );
          
          controller.timer =
            window.setTimeout(
              check,
              2500
            );
        }
      );
    }
    
    controller.abort = function() {
      controller.stopped = true;
      
      if (controller.timer) {
        window.clearTimeout(
          controller.timer
        );
      }
      
      if (controller.xhr) {
        controller.xhr.abort();
      }
      
      if (controller.id) {
        requestJson(
          "DELETE",
          base +
          "/status/" +
          encodeURIComponent(
            controller.id
          ),
          null,
          headers,
          function() {}
        );
      }
      
      finish(
        new Error("Request stopped.")
      );
    };
    
    controller.xhr = requestJson(
      "POST",
      base + "/async",
      {
        prompt: prompt,
        
        params: {
          sampler_name: "k_euler_a",
          cfg_scale: 7.5,
          height: 512,
          width: 512,
          steps: 20,
          n: 1
        },
        
        models: [state.hordeModel],
        nsfw: !state.hordeSafety,
        censor_nsfw: state.hordeSafety,
        trusted_workers: false,
        slow_workers: true,
        r2: true,
        shared: false
      },
      headers,
      function(error, data) {
        if (controller.stopped) {
          return;
        }
        
        if (error) {
          finish(error);
          return;
        }
        
        if (!data || !data.id) {
          finish(
            new Error(
              "Stable Horde did not return a job ID."
            )
          );
          
          return;
        }
        
        controller.id = data.id;
        
        el("request-status").className =
          "request-status info";
        
        el("request-status").textContent =
          "Stable Horde accepted the image job. Waiting for a volunteer worker…";
        
        controller.timer =
          window.setTimeout(
            check,
            1200
          );
      }
    );
    
    return controller;
  }
  
  function setLoading(on) {
    var button = el("send-button");
    var input = el("prompt-input");
    
    if (button) {
      button.className =
        "send" +
        (on ? " loading" : "");
      
      button.setAttribute(
        "aria-label",
        on ? "Stop" : "Send"
      );
    }
    
    if (input) {
      input.disabled = on;
    }
  }
  
  function finishRequest(
    chat,
    error,
    result
  ) {
    var pending =
      el("pending-message");
    
    var chatExists = false;
    var i;
    
    activeRequest = null;
    setLoading(false);
    
    if (
      pending &&
      pending.parentNode
    ) {
      pending.parentNode.removeChild(
        pending
      );
    }
    
    el("request-status").className =
      "request-status";
    
    if (error) {
      el("request-status").textContent =
        error.message ===
        "Request stopped." ?
        "" :
        error.message;
      
      el("prompt-input").focus();
      return;
    }
    
    for (
      i = 0; i < state.chats.length; i += 1
    ) {
      if (
        state.chats[i].id === chat.id
      ) {
        chatExists = true;
        break;
      }
    }
    
    if (!chatExists) {
      return;
    }
    
    el("request-status").textContent =
      "";
    
    if (typeof result === "string") {
      result = {
        content: result
      };
    }
    
    chat.messages.push({
      role: "assistant",
      content: result.content || "",
      imageUrl: result.imageUrl || "",
      prompt: result.prompt || ""
    });
    
    chat.updated =
      new Date().getTime();
    
    if (
      currentChat() &&
      currentChat().id === chat.id
    ) {
      appendMessage(
        chat.messages[
          chat.messages.length - 1
        ],
        false
      );
      
      scrollBottom();
    }
    
    renderList();
    saveState();
    
    el("prompt-input").focus();
  }
  
  function submit(event) {
    var input;
    var prompt;
    var chat;
    var provider;
    
    if (event) {
      event.preventDefault();
    }
    
    if (activeRequest) {
      activeRequest.abort();
      return;
    }
    
    readSettings();
    
    input = el("prompt-input");
    prompt = trim(input.value);
    
    if (!prompt) {
      input.focus();
      return;
    }
    
    chat = currentChat();
    
    if (!chat) {
      makeNewChat();
      chat = currentChat();
    }
    
    provider = state.provider;
    
    chat.messages.push({
      role: "user",
      content: prompt
    });
    
    if (chat.messages.length === 1) {
      chat.title =
        prompt.length > 36 ?
        prompt.slice(0, 36) + "…" :
        prompt;
    }
    
    chat.updated =
      new Date().getTime();
    
    input.value = "";
    input.style.height = "auto";
    
    el("request-status").textContent =
      "";
    
    el("welcome").hidden = true;
    
    appendMessage(
      chat.messages[
        chat.messages.length - 1
      ],
      false
    );
    
    appendMessage(
      {
        role: "assistant",
        content: ""
      },
      true
    );
    
    renderList();
    saveState();
    scrollBottom();
    setLoading(true);
    
    if (provider === "horde") {
      activeRequest =
        sendHorde(
          prompt,
          function(
            error,
            result
          ) {
            finishRequest(
              chat,
              error,
              result
            );
          }
        );
    } else {
      activeRequest =
        sendChat(
          chat,
          provider,
          function(
            error,
            result
          ) {
            finishRequest(
              chat,
              error,
              result
            );
          }
        );
    }
  }
  
  function loadPollinations() {
    var button =
      el("load-pollinations");
    
    button.disabled = true;
    
    el("settings-status").textContent =
      "Loading models…";
    
    requestJson(
      "GET",
      "https://text.pollinations.ai/models",
      null, {},
      function(error, data) {
        var models = [];
        var i;
        
        button.disabled = false;
        
        if (
          error ||
          !Array.isArray(data)
        ) {
          el("settings-status").textContent =
            error ?
            error.message :
            "Could not read models.";
          
          return;
        }
        
        for (
          i = 0; i < data.length; i += 1
        ) {
          if (data[i].name) {
            models.push({
              value: data[i].name,
              label: data[i].name +
                (
                  data[i].description ?
                  " — " +
                  data[i].description :
                  ""
                )
            });
          }
        }
        
        if (!models.length) {
          el("settings-status").textContent =
            "No anonymous models are listed.";
          
          return;
        }
        
        pollinationsModels =
          models;
        
        if (
          !state.pollinationsModel
        ) {
          state.pollinationsModel =
            models[0].value;
        }
        
        if (
          state.provider ===
          "pollinations"
        ) {
          updateProvider();
        }
        
        el("settings-status").textContent =
          models.length +
          " anonymous model" +
          (
            models.length === 1 ?
            "" :
            "s"
          ) +
          " available.";
      }
    );
  }
  
  function loadHorde() {
    var button =
      el("load-horde");
    
    button.disabled = true;
    
    el("settings-status").textContent =
      "Loading active image models…";
    
    requestJson(
      "GET",
      "https://aihorde.net/api/v2/status/models?type=image",
      null, {},
      function(error, data) {
        var models = [];
        var selectedFound =
          false;
        var i;
        
        button.disabled = false;
        
        if (
          error ||
          !Array.isArray(data)
        ) {
          el("settings-status").textContent =
            error ?
            error.message :
            "Could not read image models.";
          
          return;
        }
        
        data.sort(function(a, b) {
          return (
            (b.count || 0) -
            (a.count || 0)
          );
        });
        
        for (
          i = 0; i < data.length; i += 1
        ) {
          if (
            data[i].name &&
            (
              !state.hordeSafety ||
              !/(nsfw|hentai|yiff|after[ -]?dark|unholy desire|babes)/i.test(
                data[i].name
              )
            )
          ) {
            models.push({
              value: data[i].name,
              label: data[i].name +
                " · " +
                (data[i].count || 0) +
                " workers · ETA " +
                (data[i].eta || 0) +
                "s",
              workers: data[i].count || 0,
              eta: data[i].eta || 0
            });
          }
        }
        
        if (!models.length) {
          el("settings-status").textContent =
            "No suitable active image models were found.";
          
          return;
        }
        
        for (
          i = 0; i < models.length; i += 1
        ) {
          if (
            models[i].value ===
            state.hordeModel
          ) {
            selectedFound = true;
            break;
          }
        }
        
        if (!selectedFound) {
          state.hordeModel =
            models[0].value;
        }
        
        hordeModels = models;
        
        if (
          state.provider ===
          "horde"
        ) {
          updateProvider();
        }
        
        el("settings-status").textContent =
          models.length +
          " active image models found.";
      }
    );
  }
  
  function loadOllama() {
    var button =
      el("load-ollama");
    
    var url =
      trim(
        el("ollama-url").value
      ).replace(/\/+$/, "") ||
      "http://localhost:11434";
    
    button.disabled = true;
    
    el("settings-status").textContent =
      "Loading local models…";
    
    requestJson(
      "GET",
      url + "/api/tags",
      null, {},
      function(error, data) {
        var list =
          el("ollama-models");
        
        var option;
        var i;
        
        button.disabled = false;
        
        if (
          error ||
          !data ||
          !Array.isArray(data.models)
        ) {
          el("settings-status").textContent =
            error ?
            error.message :
            "Could not read Ollama models.";
          
          return;
        }
        
        clear(list);
        
        for (
          i = 0; i < data.models.length; i += 1
        ) {
          option =
            document.createElement(
              "option"
            );
          
          option.value =
            data.models[i].name;
          
          list.appendChild(option);
        }
        
        el("settings-status").textContent =
          data.models.length +
          " local model" +
          (
            data.models.length === 1 ?
            "" :
            "s"
          ) +
          " found.";
      }
    );
  }
  
  function bind() {
    el("prompt-form").addEventListener(
      "submit",
      submit
    );
    
    el("prompt-input").addEventListener(
      "keydown",
      function(event) {
        if (
          event.keyCode === 13 &&
          !event.shiftKey
        ) {
          event.preventDefault();
          submit(event);
        }
      }
    );
    
    el("prompt-input").addEventListener(
      "input",
      function() {
        this.style.height = "auto";
        
        this.style.height =
          Math.min(
            this.scrollHeight,
            160
          ) + "px";
      }
    );
    
    el("provider").addEventListener(
      "change",
      function() {
        state.provider =
          this.value;
        
        updateProvider();
        
        if (
          state.provider ===
          "pollinations"
        ) {
          loadPollinations();
        }
        
        if (
          state.provider ===
          "horde"
        ) {
          loadHorde();
        }
      }
    );
    
    el("model").addEventListener(
      "change",
      function() {
        if (
          state.provider ===
          "pollinations"
        ) {
          state.pollinationsModel =
            this.value;
        }
        
        if (
          state.provider ===
          "horde"
        ) {
          state.hordeModel =
            this.value;
          
          el("provider-note").textContent =
            providerNote();
          
          el("provider-summary").textContent =
            providerNote();
          
          el("horde-model-info").textContent =
            providerNote();
        }
        
        saveState();
      }
    );
    
    el("new-chat").addEventListener(
      "click",
      makeNewChat
    );
    
    el("chat-list").addEventListener(
      "click",
      function(event) {
        var target =
          event.target;
        
        while (
          target &&
          target !== this
        ) {
          if (
            target.getAttribute(
              "data-chat"
            )
          ) {
            selectChat(
              target.getAttribute(
                "data-chat"
              )
            );
            
            return;
          }
          
          if (
            target.getAttribute(
              "data-delete"
            )
          ) {
            removeChat(
              target.getAttribute(
                "data-delete"
              )
            );
            
            return;
          }
          
          target =
            target.parentNode;
        }
      }
    );
    
    el("menu-button").addEventListener(
      "click",
      function() {
        document.body.classList.add(
          "menu-open"
        );
      }
    );
    
    el("close-menu").addEventListener(
      "click",
      closeMenu
    );
    
    el("scrim").addEventListener(
      "click",
      closeMenu
    );
    
    el("settings-button").addEventListener(
      "click",
      openSettings
    );
    
    el("settings-top").addEventListener(
      "click",
      openSettings
    );
    
    el("close-settings").addEventListener(
      "click",
      closeSettings
    );
    
    el("done-settings").addEventListener(
      "click",
      function() {
        readSettings();
        closeSettings();
      }
    );
    
    el("settings-modal").addEventListener(
      "click",
      function(event) {
        if (
          event.target === this
        ) {
          closeSettings();
        }
      }
    );
    
    el("theme").addEventListener(
      "change",
      function() {
        state.theme =
          this.value;
        
        applyTheme();
      }
    );
    
    el("horde-safety").addEventListener(
      "change",
      function() {
        state.hordeSafety =
          this.checked;
        
        loadHorde();
      }
    );
    
    el("load-pollinations").addEventListener(
      "click",
      loadPollinations
    );
    
    el("load-horde").addEventListener(
      "click",
      loadHorde
    );
    
    el("load-ollama").addEventListener(
      "click",
      loadOllama
    );
    
    el("clear-data").addEventListener(
      "click",
      function() {
        deleteCookie();
        
        state.saveChats = false;
        
        state.chats = [
          newChat()
        ];
        
        state.activeId =
          state.chats[0].id;
        
        updatePrivacy();
        renderList();
        renderConversation();
        
        el("settings-status").textContent =
          "Saved data cleared.";
      }
    );
    
    document.addEventListener(
      "keydown",
      function(event) {
        if (event.keyCode === 27) {
          closeMenu();
          
          if (
            !el("settings-modal")
            .hidden
          ) {
            closeSettings();
          }
        }
      }
    );
  }
  
  function init() {
    loadSavedState();
    
    if (
      !Array.isArray(state.chats) ||
      !state.chats.length
    ) {
      state.chats = [
        newChat()
      ];
    }
    
    if (!currentChat()) {
      state.activeId =
        state.chats[0].id;
    }
    
    el("ollama-url").value =
      state.ollamaUrl;
    
    el("ollama-model").value =
      state.ollamaModel;
    
    el("custom-url").value =
      state.customUrl;
    
    el("custom-model").value =
      state.customModel;
    
    el("system-prompt").value =
      state.systemPrompt;
    
    el("horde-safety").checked =
      state.hordeSafety;
    
    applyTheme();
    updatePrivacy();
    updateProvider();
    renderList();
    renderConversation();
    bind();
    
    loadPollinations();
    loadHorde();
  }
  
  init();
}());