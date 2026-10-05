(function(window) {
  "use strict";
  
  var options;
  

  
  var FUNCTIONS = {
    sqrt: function(x) { return Math.sqrt(x); },
    abs: function(x) { return Math.abs(x); },
    floor: function(x) { return Math.floor(x); },
    ceil: function(x) { return Math.ceil(x); },
    round: function(x) { return Math.round(x); },
    exp: function(x) { return Math.exp(x); },
    
    sin: function(x) { return Math.sin(x); },
    cos: function(x) { return Math.cos(x); },
    tan: function(x) { return Math.tan(x); },
    
    asin: function(x) { return Math.asin(x); },
    acos: function(x) { return Math.acos(x); },
    atan: function(x) { return Math.atan(x); },
    
    sinh: function(x) {
      return (Math.exp(x) - Math.exp(-x)) / 2;
    },
    
    cosh: function(x) {
      return (Math.exp(x) + Math.exp(-x)) / 2;
    },
    
    tanh: function(x) {
      var a = Math.exp(x);
      var b = Math.exp(-x);
      return (a - b) / (a + b);
    },
    
    log: function(x) {
      return Math.log(x) / Math.LN10;
    },
    
    ln: function(x) {
      return Math.log(x);
    },
    
    log2: function(x) {
      return Math.log(x) / Math.LN2;
    },
    
    sign: function(x) {
      if (x > 0) return 1;
      if (x < 0) return -1;
      return 0;
    },
    
    deg: function(x) {
      return x * Math.PI / 180;
    },
    
    rad: function(x) {
      return x * Math.PI / 180;
    },
    
    factorial: function(x) {
      return factorial(x);
    },
    
    fact: function(x) {
      return factorial(x);
    },
    
    pow: function(a, b) {
      return Math.pow(a, b);
    },
    
    min: function() {
      return Math.min.apply(Math, arguments);
    },
    
    max: function() {
      return Math.max.apply(Math, arguments);
    }
  };
  
  var CONSTANTS = {
    pi: Math.PI,
    e: Math.E,
    tau: Math.PI * 2,
    phi: (1 + Math.sqrt(5)) / 2
  };
  
  function factorial(n) {
    if (!isFinite(n) || n < 0 || Math.floor(n) !== n) {
      throw new Error("factorial requires a non-negative integer");
    }
    
    if (n > 170) {
      throw new Error("factorial is too large");
    }
    
    var result = 1;
    var i;
    
    for (i = 2; i <= n; i += 1) {
      result *= i;
    }
    
    return result;
  }
  
  function tokenize(input) {
    var tokens = [];
    var i = 0;
    var ch;
    var number;
    var identifier;
    
    while (i < input.length) {
      ch = input.charAt(i);
      
      if (/\s/.test(ch)) {
        i += 1;
        continue;
      }
      
      if (/[0-9.]/.test(ch)) {
        number = "";
        
        while (
          i < input.length &&
          /[0-9.eE+-]/.test(input.charAt(i))
        ) {

          if (
            (input.charAt(i) === "+" || input.charAt(i) === "-") &&
            i > 0 &&
            input.charAt(i - 1).toLowerCase() !== "e"
          ) {
            break;
          }
          
          number += input.charAt(i);
          i += 1;
        }
        
        if (
          number === "." ||
          number === "e" ||
          number === "E" ||
          !isFinite(Number(number))
        ) {
          throw new Error("Invalid number");
        }
        
        tokens.push({
          type: "number",
          value: Number(number)
        });
        
        continue;
      }
      
      if (/[a-zA-Z_]/.test(ch)) {
        identifier = "";
        
        while (
          i < input.length &&
          /[a-zA-Z0-9_]/.test(input.charAt(i))
        ) {
          identifier += input.charAt(i);
          i += 1;
        }
        
        tokens.push({
          type: "identifier",
          value: identifier.toLowerCase()
        });
        
        continue;
      }
      
      if ("+-*/%^(),!".indexOf(ch) !== -1) {
        tokens.push({
          type: "operator",
          value: ch
        });
        
        i += 1;
        continue;
      }
      
      throw new Error("Unexpected character: " + ch);
    }
    
    return tokens;
  }
  
  function Parser(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  
  Parser.prototype.peek = function() {
    return this.tokens[this.position] || null;
  };
  
  Parser.prototype.consume = function() {
    var token = this.tokens[this.position];
    this.position += 1;
    return token;
  };
  
  Parser.prototype.match = function(value) {
    var token = this.peek();
    
    if (token && token.value === value) {
      this.position += 1;
      return true;
    }
    
    return false;
  };
  
  Parser.prototype.parse = function() {
    var value = this.parseExpression();
    
    if (this.peek()) {
      throw new Error(
        "Unexpected token: " + this.peek().value
      );
    }
    
    if (!isFinite(value)) {
      throw new Error("Result is not a finite number");
    }
    
    return value;
  };
  

  Parser.prototype.parseExpression = function() {
    var value = this.parseTerm();
    var token;
    
    while (true) {
      token = this.peek();
      
      if (!token || (token.value !== "+" && token.value !== "-")) {
        break;
      }
      
      this.consume();
      
      if (token.value === "+") {
        value += this.parseTerm();
      } else {
        value -= this.parseTerm();
      }
    }
    
    return value;
  };
  

  Parser.prototype.parseTerm = function() {
    var value = this.parsePower();
    var token;
    
    while (true) {
      token = this.peek();
      
      if (!token) {
        break;
      }
      
      if (
        token.value === "*" ||
        token.value === "/" ||
        token.value === "%"
      ) {
        this.consume();
        
        if (token.value === "*") {
          value *= this.parsePower();
        } else if (token.value === "/") {
          var divisor = this.parsePower();
          
          if (divisor === 0) {
            throw new Error("Division by zero");
          }
          
          value /= divisor;
        } else {
          var modulo = this.parsePower();
          
          if (modulo === 0) {
            throw new Error("Modulo by zero");
          }
          
          value %= modulo;
        }
        
        continue;
      }
      

      if (
        token.type === "number" ||
        token.type === "identifier" ||
        token.value === "("
      ) {
        value *= this.parsePower();
        continue;
      }
      
      break;
    }
    
    return value;
  };
  

  Parser.prototype.parsePower = function() {
    var value = this.parseUnary();
    
    if (this.match("^")) {
      value = Math.pow(value, this.parsePower());
    }
    
    return value;
  };
  

  Parser.prototype.parseUnary = function() {
    var token = this.peek();
    
    if (token && token.value === "+") {
      this.consume();
      return this.parseUnary();
    }
    
    if (token && token.value === "-") {
      this.consume();
      return -this.parseUnary();
    }
    
    return this.parsePostfix();
  };
  

  Parser.prototype.parsePostfix = function() {
    var value = this.parsePrimary();
    
    while (this.match("!")) {
      value = factorial(value);
    }
    
    return value;
  };
  
  Parser.prototype.parsePrimary = function() {
    var token = this.peek();
    
    if (!token) {
      throw new Error("Expected a value");
    }
    
    if (token.type === "number") {
      this.consume();
      return token.value;
    }
    
    if (token.value === "(") {
      this.consume();
      
      var value = this.parseExpression();
      
      if (!this.match(")")) {
        throw new Error("Missing closing parenthesis");
      }
      
      return value;
    }
    
    if (token.type === "identifier") {
      this.consume();
      
      var name = token.value;
      

      if (this.match("(")) {
        if (!FUNCTIONS[name]) {
          throw new Error("Unknown function: " + name);
        }
        
        var args = [];
        
        if (!this.match(")")) {
          args.push(this.parseExpression());
          
          while (this.match(",")) {
            args.push(this.parseExpression());
          }
          
          if (!this.match(")")) {
            throw new Error("Missing closing parenthesis");
          }
        }
        
        return FUNCTIONS[name].apply(null, args);
      }
      

      if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
        return CONSTANTS[name];
      }
      
      throw new Error("Unknown identifier: " + name);
    }
    
    throw new Error(
      "Unexpected token: " + token.value
    );
  };
  
  function normalizeInput(input) {
    var value = String(input || "").trim();
    

    value = value
      .replace(/^calculate\s+/i, "")
      .replace(/^compute\s+/i, "")
      .replace(/^evaluate\s+/i, "")
      .replace(/^what\s+is\s+/i, "")
      .replace(/^what's\s+/i, "")
      .replace(/^solve\s+/i, "")
      .trim();
    

    value = value
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, "pi")
      .replace(/√\s*/g, "sqrt")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3");
    

    value = value.replace(
      /([0-9]+(?:\.[0-9]+)?)\s*%/g,
      "($1/100)"
    );
    
    return value;
  }
  
  function formatNumber(value) {
    if (!isFinite(value)) {
      return String(value);
    }
    
    if (Math.abs(value) < 1e-12) {
      value = 0;
    }
    

    var rounded = Number(value.toPrecision(14));
    
    return String(rounded);
  }
  
  function calculate(expression) {
    var normalized = normalizeInput(expression);
    
    if (!normalized) {
      throw new Error("No mathematical expression supplied");
    }
    
    if (normalized.length > 500) {
      throw new Error("Expression is too long");
    }
    
    var tokens = tokenize(normalized);
    var parser = new Parser(tokens);
    var result = parser.parse();
    
    return {
      expression: normalized,
      value: result,
      formatted: formatNumber(result)
    };
  }
  
  function isLikelyMath(input) {
    var text = String(input || "").toLowerCase();
    
    return (
      /[0-9]/.test(text) &&
      /[+\-*/%^()=]/.test(text)
    ) || (
      /\b(sqrt|sin|cos|tan|asin|acos|atan|log|ln|abs|factorial|fact|pow|exp)\b/
      .test(text)
    ) || (
      /\b(pi|tau|phi|e)\b/.test(text) &&
      /[0-9]/.test(text)
    );
  }
  
  window.TibUITools.register("math", {
    name: "Math",
    planningHint: "Prepare one concise mathematical expression for a deterministic calculator. " +
      "Use standard operators + - * / % ^, parentheses, constants pi/e/tau/phi, " +
      "and functions such as sqrt, sin, cos, tan, log, ln, abs, factorial, pow. " +
      "Angles are in radians. Do not include explanatory prose.",
    
    activeKey: "mathToolActive",
    contextTool: true,
    
    init: function(context) {
      options = context;
    },
    
    isActive: function() {
      return (
        options.state.mathToolActive &&
        options.state.provider !== "hordeImage"
      );
    },
    
    shouldRun: function(prompt) {
      return isLikelyMath(prompt);
    },
    
    validateQuery: function(query) {
      var text = String(query || "").trim();
      
      if (!text) {
        return {
          ok: false,
          error: "Empty mathematical expression"
        };
      }
      
      if (text.length > 500) {
        return {
          ok: false,
          error: "Expression is too long"
        };
      }
      
      return {
        ok: true,
        query: text
      };
    },
    
    run: function(prompt) {
      return new Promise(function(resolve) {
        try {
          var result = calculate(prompt);
          
          resolve({
            ok: true,
            expression: result.expression,
            value: result.value,
            result: result.formatted
          });
        } catch (error) {
          resolve({
            ok: false,
            expression: String(prompt || ""),
            error: error && error.message ?
              error.message :
              "Unable to evaluate expression"
          });
        }
      });
    },
    
    formatContext: function(data) {
      if (!data || !data.ok) {
        return (
          "Math calculator error: " +
          String(data && data.error || "Unknown error")
        );
      }
      
      return (
        "Math calculation result (deterministic local calculation):\n" +
        "Expression: " + data.expression + "\n" +
        "Result: " + data.result
      );
    }
  });
  
})(window);