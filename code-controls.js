(function (window) {
  "use strict";
  var extensions = {
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    python: "py",
    py: "py",
    html: "html",
    css: "css",
    json: "json",
    bash: "sh",
    sh: "sh",
    shell: "sh",
    markdown: "md",
    md: "md",
    yaml: "yaml",
    sql: "sql",
    java: "java",
    c: "c",
    cpp: "cpp",
    rust: "rs",
    go: "go",
    xml: "xml"
  };
  window.TibUICode = {
    enhance: function (container, copyText) {
      Array.prototype.forEach.call(
        container.querySelectorAll("pre"),
        function (pre) {
          var code = pre.querySelector("code");
          if (!code) {
            return;
          }
          var language =
            String(code.className || "").replace(/^language-/, "") || "text";
          var box = document.createElement("div");
          box.className = "code-block";
          var toolbar = document.createElement("div");
          toolbar.className = "code-toolbar";
          var label = document.createElement("span");
          label.textContent = language;
          toolbar.appendChild(label);
          function button(text, action) {
            var node = document.createElement("button");
            node.type = "button";
            node.textContent = text;
            node.setAttribute("aria-label", text + " code");
            node.onclick = action;
            toolbar.appendChild(node);
            return node;
          }
          var copy = button("Copy", function () {
            copyText(code.textContent, copy);
          });
          button("Download", function () {
            window.TibUIFiles.download(
              code.textContent,
              "code." + (extensions[language.toLowerCase()] || "txt"),
              "text/plain;charset=utf-8"
            );
          });
          var wrap = button("Wrap", function () {
            var active = wrap.getAttribute("aria-pressed") !== "true";
            wrap.setAttribute("aria-pressed", active ? "true" : "false");
            pre.className = active ? "code-wrapped" : "";
          });
          wrap.setAttribute("aria-pressed", "false");
          pre.parentNode.insertBefore(box, pre);
          box.appendChild(toolbar);
          box.appendChild(pre);
        }
      );
    }
  };
})(window);
