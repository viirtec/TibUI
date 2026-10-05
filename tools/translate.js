(function(window) {
  "use strict";
  
  var options;
  
  var API_URL = "https://api.mymemory.translated.net/get";
  
  var LANGUAGES = {
    english: "en",
    estonian: "et",
    spanish: "es",
    french: "fr",
    german: "de",
    italian: "it",
    portuguese: "pt",
    dutch: "nl",
    polish: "pl",
    russian: "ru",
    ukrainian: "uk",
    finnish: "fi",
    swedish: "sv",
    norwegian: "no",
    danish: "da",
    icelandic: "is",
    latvian: "lv",
    lithuanian: "lt",
    czech: "cs",
    slovak: "sk",
    slovenian: "sl",
    croatian: "hr",
    serbian: "sr",
    romanian: "ro",
    hungarian: "hu",
    bulgarian: "bg",
    greek: "el",
    turkish: "tr",
    arabic: "ar",
    hebrew: "he",
    persian: "fa",
    hindi: "hi",
    bengali: "bn",
    chinese: "zh",
    japanese: "ja",
    korean: "ko",
    vietnamese: "vi",
    thai: "th",
    indonesian: "id",
    malay: "ms",
    filipino: "tl",
    swahili: "sw",
    afrikaans: "af",
    albanian: "sq",
    armenian: "hy",
    azerbaijani: "az",
    basque: "eu",
    catalan: "ca",
    galician: "gl",
    georgian: "ka",
    irish: "ga",
    welsh: "cy",
    esperanto: "eo",
    latin: "la"
  };
  
  function normalizeLanguage(value) {
    if (!value) {
      return null;
    }
    
    value = String(value)
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, " ");
    
    if (LANGUAGES[value]) {
      return LANGUAGES[value];
    }
    
    if (/^[a-z]{2}$/i.test(value)) {
      return value.toLowerCase();
    }
    
    return null;
  }
  
  function stripQuotes(value) {
    return String(value)
      .trim()
      .replace(/^["“](.*)["”]$/, "$1")
      .replace(/^'(.*)'$/, "$1");
  }
  
  function parseRequest(prompt) {
    var text = String(prompt || "").trim();
    var match;
    var source;
    var target;
    
    if (!text) {
      throw new Error("No text supplied for translation");
    }
    
    match = text.match(
      /^translate\s+["“](.*?)["”]\s+to\s+([a-zA-Z-]+)$/i
    );
    
    if (match) {
      target = normalizeLanguage(match[2]);
      
      if (!target) {
        throw new Error("Unsupported target language: " + match[2]);
      }
      
      return {
        text: match[1],
        source: "auto",
        target: target
      };
    }
    
    match = text.match(
      /^translate\s+(.+?)\s+to\s+([a-zA-Z-]+)$/i
    );
    
    if (match) {
      target = normalizeLanguage(match[2]);
      
      if (!target) {
        throw new Error("Unsupported target language: " + match[2]);
      }
      
      return {
        text: stripQuotes(match[1]),
        source: "auto",
        target: target
      };
    }
    
    match = text.match(
      /^translate\s+from\s+([a-zA-Z-]+)\s+to\s+([a-zA-Z-]+)\s*:\s*(.+)$/i
    );
    
    if (match) {
      source = normalizeLanguage(match[1]);
      target = normalizeLanguage(match[2]);
      
      if (!source) {
        throw new Error("Unsupported source language: " + match[1]);
      }
      
      if (!target) {
        throw new Error("Unsupported target language: " + match[2]);
      }
      
      return {
        text: match[3].trim(),
        source: source,
        target: target
      };
    }
    
    match = text.match(
      /^translate\s+(?:this\s+)?to\s+([a-zA-Z-]+)\s*:\s*(.+)$/i
    );
    
    if (match) {
      target = normalizeLanguage(match[1]);
      
      if (!target) {
        throw new Error("Unsupported target language: " + match[1]);
      }
      
      return {
        text: match[2].trim(),
        source: "auto",
        target: target
      };
    }
    
    throw new Error(
      'Use: translate "text" to language'
    );
  }
  
  async function translate(text, source, target) {
    if (!text || !text.trim()) {
      throw new Error("Nothing to translate");
    }
    
    if (text.length > 5000) {
      throw new Error(
        "Text is too long. Maximum 5000 characters."
      );
    }
    
    var params = new URLSearchParams();
    
    params.set("q", text);
    params.set(
      "langpair",
      (source || "auto") + "|" + target
    );
    
    var response;
    
    try {
      response = await fetch(
        API_URL + "?" + params.toString(),
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        }
      );
    } catch (error) {
      throw new Error(
        "Could not connect to translation service"
      );
    }
    
    if (!response.ok) {
      throw new Error(
        "Translation service returned HTTP " +
        response.status
      );
    }
    
    var data;
    
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "Translation service returned invalid data"
      );
    }
    
    if (
      !data ||
      !data.responseData ||
      !data.responseData.translatedText
    ) {
      throw new Error(
        data && data.responseDetails ?
        data.responseDetails :
        "No translation was returned"
      );
    }
    
    return {
      translatedText: data.responseData.translatedText,
      
      match: typeof data.responseData.match === "number" ?
        data.responseData.match :
        null
    };
  }
  
  window.TibUITools.register("translate", {
    name: "Translation",
    
    planningHint: 'Use this tool for translation requests. Format requests as: translate "TEXT" to LANGUAGE. For an explicit source language use: translate from SOURCE to TARGET: TEXT.',
    
    activeKey: "translationToolActive",
    
    contextTool: true,
    
    init: function(context) {
      options = context;
    },
    
    isActive: function() {
      return !!(
        options &&
        options.state &&
        options.state.translationToolActive
      );
    },
    
    shouldRun: function(prompt) {
      return /^translate\b/i.test(
        String(prompt || "").trim()
      );
    },
    
    validateQuery: function(query) {
      var text = String(query || "").trim();
      
      if (!text) {
        return {
          ok: false,
          error: "No translation request supplied"
        };
      }
      
      if (text.length > 5000) {
        return {
          ok: false,
          error: "Translation text is too long"
        };
      }
      
      return {
        ok: true,
        query: text
      };
    },
    
    run: async function(prompt) {
      try {
        var request = parseRequest(prompt);
        
        var result = await translate(
          request.text,
          request.source,
          request.target
        );
        
        return {
          ok: true,
          original: request.text,
          source: request.source,
          target: request.target,
          translatedText: result.translatedText,
          match: result.match
        };
      } catch (error) {
        return {
          ok: false,
          error: error && error.message ?
            error.message :
            "Translation failed"
        };
      }
    },
    
    formatContext: function(data) {
      if (!data || !data.ok) {
        return (
          "Translation error: " +
          String(
            data && data.error ?
            data.error :
            "Unknown translation error"
          )
        );
      }
      
      return (
        "Translation result:\n" +
        "Original: " +
        data.original +
        "\n" +
        "Translated: " +
        data.translatedText
      );
    }
  });
})(window);