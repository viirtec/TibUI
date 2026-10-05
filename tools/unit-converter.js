(function(window) {
  "use strict";
  
  var categories = {
    length: {
      base: "m",
      units: {
        mm: ["Millimeter", 0.001],
        cm: ["Centimeter", 0.01],
        m: ["Meter", 1],
        km: ["Kilometer", 1000],
        in: ["Inch", 0.0254],
        ft: ["Foot", 0.3048],
        yd: ["Yard", 0.9144],
        mi: ["Mile", 1609.344],
        nmi: ["Nautical mile", 1852]
      }
    },
    mass: {
      base: "g",
      units: {
        mg: ["Milligram", 0.001],
        g: ["Gram", 1],
        kg: ["Kilogram", 1000],
        t: ["Metric ton", 1000000],
        oz: ["Ounce", 28.349523125],
        lb: ["Pound", 453.59237],
        st: ["Stone", 6350.29318]
      }
    },
    volume: {
      base: "l",
      units: {
        ml: ["Milliliter", 0.001],
        cl: ["Centiliter", 0.01],
        dl: ["Deciliter", 0.1],
        l: ["Liter", 1],
        tsp: ["US teaspoon", 0.00492892159375],
        tbsp: ["US tablespoon", 0.01478676478125],
        floz: ["US fluid ounce", 0.0295735295625],
        cup: ["US cup", 0.2365882365],
        pt: ["US pint", 0.473176473],
        qt: ["US quart", 0.946352946],
        gal: ["US gallon", 3.785411784]
      }
    },
    area: {
      base: "m2",
      units: {
        mm2: ["Square millimeter", 0.000001],
        cm2: ["Square centimeter", 0.0001],
        m2: ["Square meter", 1],
        km2: ["Square kilometer", 1000000],
        in2: ["Square inch", 0.00064516],
        ft2: ["Square foot", 0.09290304],
        yd2: ["Square yard", 0.83612736],
        acre: ["Acre", 4046.8564224],
        hectare: ["Hectare", 10000],
        mi2: ["Square mile", 2589988.110336]
      }
    },
    speed: {
      base: "mps",
      units: {
        mps: ["Meter per second", 1],
        kph: ["Kilometer per hour", 0.2777777777777778],
        mph: ["Mile per hour", 0.44704],
        knot: ["Knot", 0.5144444444444445],
        fps: ["Foot per second", 0.3048]
      }
    },
    time: {
      base: "s",
      units: {
        ms: ["Millisecond", 0.001],
        s: ["Second", 1],
        min: ["Minute", 60],
        h: ["Hour", 3600],
        d: ["Day", 86400],
        wk: ["Week", 604800],
        yr: ["Year", 31557600]
      }
    },
    pressure: {
      base: "pa",
      units: {
        pa: ["Pascal", 1],
        kpa: ["Kilopascal", 1000],
        mpa: ["Megapascal", 1000000],
        bar: ["Bar", 100000],
        atm: ["Atmosphere", 101325],
        psi: ["Pound per square inch", 6894.757293168],
        mmhg: ["Millimeter of mercury", 133.322387415]
      }
    },
    energy: {
      base: "j",
      units: {
        j: ["Joule", 1],
        kj: ["Kilojoule", 1000],
        mj: ["Megajoule", 1000000],
        cal: ["Calorie", 4.184],
        kcal: ["Kilocalorie", 4184],
        wh: ["Watt-hour", 3600],
        kwh: ["Kilowatt-hour", 3600000],
        btu: ["BTU", 1055.05585262]
      }
    },
    power: {
      base: "w",
      units: {
        w: ["Watt", 1],
        kw: ["Kilowatt", 1000],
        mw: ["Megawatt", 1000000],
        hp: ["Horsepower", 745.6998715822702]
      }
    },
    angle: {
      base: "deg",
      units: {
        deg: ["Degree", 1],
        rad: ["Radian", 57.29577951308232],
        grad: ["Gradian", 0.9],
        arcmin: ["Arc minute", 1 / 60],
        arcsec: ["Arc second", 1 / 3600]
      }
    },
    frequency: {
      base: "hz",
      units: {
        hz: ["Hertz", 1],
        khz: ["Kilohertz", 1000],
        mhz: ["Megahertz", 1000000],
        ghz: ["Gigahertz", 1000000000]
      }
    },
    data: {
      base: "byte",
      units: {
        bit: ["Bit", 0.125],
        byte: ["Byte", 1],
        kb: ["Kilobyte", 1000],
        mb: ["Megabyte", 1000000],
        gb: ["Gigabyte", 1000000000],
        tb: ["Terabyte", 1000000000000],
        kib: ["Kibibyte", 1024],
        mib: ["Mebibyte", 1048576],
        gib: ["Gibibyte", 1073741824],
        tib: ["Tebibyte", 1099511627776]
      }
    }
  };
  
  var aliases = {
    millimeter: "mm",
    millimeters: "mm",
    centimeter: "cm",
    centimeters: "cm",
    meter: "m",
    meters: "m",
    metre: "m",
    metres: "m",
    kilometer: "km",
    kilometers: "km",
    kilometre: "km",
    kilometres: "km",
    inch: "in",
    inches: "in",
    foot: "ft",
    feet: "ft",
    yard: "yd",
    yards: "yd",
    mile: "mi",
    miles: "mi",
    nauticalmile: "nmi",
    nauticalmiles: "nmi",
    gram: "g",
    grams: "g",
    kilogram: "kg",
    kilograms: "kg",
    milligram: "mg",
    milligrams: "mg",
    tonne: "t",
    ton: "t",
    tons: "t",
    ounce: "oz",
    ounces: "oz",
    pound: "lb",
    pounds: "lb",
    stone: "st",
    stones: "st",
    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    "fluidounce": "floz",
    "fluidounces": "floz",
    cup: "cup",
    cups: "cup",
    pint: "pt",
    pints: "pt",
    quart: "qt",
    quarts: "qt",
    gallon: "gal",
    gallons: "gal",
    "squaremillimeter": "mm2",
    "squaremillimeters": "mm2",
    "squarecentimeter": "cm2",
    "squarecentimeters": "cm2",
    "squaremeter": "m2",
    "squaremeters": "m2",
    "squarekilometer": "km2",
    "squarekilometers": "km2",
    "squareinch": "in2",
    "squareinches": "in2",
    "squarefoot": "ft2",
    "squarefeet": "ft2",
    "squareyard": "yd2",
    "squareyards": "yd2",
    acre: "acre",
    acres: "acre",
    hectare: "hectare",
    hectares: "hectare",
    "squaremile": "mi2",
    "squaremiles": "mi2",
    "meterpersecond": "mps",
    "meterspersecond": "mps",
    "kilometerperhour": "kph",
    "kilometersperhour": "kph",
    "mileperhour": "mph",
    "milesperhour": "mph",
    knot: "knot",
    knots: "knot",
    "footpersecond": "fps",
    "feetpersecond": "fps",
    millisecond: "ms",
    milliseconds: "ms",
    second: "s",
    seconds: "s",
    minute: "min",
    minutes: "min",
    hour: "h",
    hours: "h",
    day: "d",
    days: "d",
    week: "wk",
    weeks: "wk",
    year: "yr",
    years: "yr",
    pascal: "pa",
    pascals: "pa",
    kilopascal: "kpa",
    kilopascals: "kpa",
    megapascal: "mpa",
    megapascals: "mpa",
    bar: "bar",
    bars: "bar",
    atmosphere: "atm",
    atmospheres: "atm",
    psi: "psi",
    "poundsquareinch": "psi",
    "poundsquareinches": "psi",
    millimetermercury: "mmhg",
    joule: "j",
    joules: "j",
    kilojoule: "kj",
    kilojoules: "kj",
    megajoule: "mj",
    megajoules: "mj",
    calorie: "cal",
    calories: "cal",
    kilocalorie: "kcal",
    kilocalories: "kcal",
    watthour: "wh",
    watthours: "wh",
    kilowatthour: "kwh",
    kilowatthours: "kwh",
    btu: "btu",
    watt: "w",
    watts: "w",
    kilowatt: "kw",
    kilowatts: "kw",
    megawatt: "mw",
    megawatts: "mw",
    horsepower: "hp",
    degree: "deg",
    degrees: "deg",
    radian: "rad",
    radians: "rad",
    gradian: "grad",
    gradians: "grad",
    "arcminute": "arcmin",
    "arcminutes": "arcmin",
    "arcsecond": "arcsec",
    "arcseconds": "arcsec",
    hertz: "hz",
    kilohertz: "khz",
    megahertz: "mhz",
    gigahertz: "ghz",
    bit: "bit",
    bits: "bit",
    byte: "byte",
    bytes: "byte",
    kilobyte: "kb",
    kilobytes: "kb",
    megabyte: "mb",
    megabytes: "mb",
    gigabyte: "gb",
    gigabytes: "gb",
    terabyte: "tb",
    terabytes: "tb",
    kibibyte: "kib",
    kibibytes: "kib",
    mebibyte: "mib",
    mebibytes: "mib",
    gibibyte: "gib",
    gibibytes: "gib",
    tebibyte: "tib",
    tebibytes: "tib",
    c: "c",
    f: "f",
    k: "k",
    celsius: "c",
    fahrenheit: "f",
    kelvin: "k"
  };
  
  var temperature = {
    c: ["Celsius"],
    f: ["Fahrenheit"],
    k: ["Kelvin"]
  };
  
  function normalizeUnit(value) {
    var key = String(value || "")
      .toLowerCase()
      .replace(/°/g, "")
      .replace(/[\s_-]+/g, "");
    return aliases[key] || key;
  }
  
  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/°/g, "")
      .replace(/[\s_-]+/g, "");
  }
  
  function findUnit(unit) {
    var normalized = normalizeUnit(unit);
    if (temperature[normalized]) {
      return { category: "temperature", unit: normalized };
    }
    
    for (var category in categories) {
      if (
        Object.prototype.hasOwnProperty.call(categories, category) &&
        categories[category].units[normalized]
      ) {
        return { category: category, unit: normalized };
      }
    }
    
    return null;
  }
  
  function parse(prompt) {
    var text = String(prompt || "").trim();
    var match = text.match(
      /^(?:convert\s+)?(-?(?:\d+(?:,\d{3})*|\d+)(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Zµμ²³0-9._-]+)\s+(?:to|into|in|as|=)\s+([a-zA-Zµμ²³0-9._-]+)$/i
    );
    
    if (!match) {
      return null;
    }
    
    var amount = Number(match[1].replace(/,/g, ""));
    
    if (!isFinite(amount)) {
      return null;
    }
    
    var from = findUnit(match[2]);
    var to = findUnit(match[3]);
    
    if (!from || !to || from.category !== to.category) {
      return null;
    }
    
    return {
      amount: amount,
      from: from,
      to: to
    };
  }
  
  function convertTemperature(value, from, to) {
    var celsius;
    
    if (from === "c") {
      celsius = value;
    } else if (from === "f") {
      celsius = (value - 32) * 5 / 9;
    } else {
      celsius = value - 273.15;
    }
    
    if (to === "c") {
      return celsius;
    }
    
    if (to === "f") {
      return celsius * 9 / 5 + 32;
    }
    
    return celsius + 273.15;
  }
  
  function convert(value, from, to) {
    if (from.category === "temperature") {
      return convertTemperature(value, from.unit, to.unit);
    }
    
    var category = categories[from.category];
    return value * category.units[from.unit][1] / category.units[to.unit][1];
  }
  
  function formatNumber(value) {
    if (!isFinite(value)) {
      return "undefined";
    }
    
    if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
      return value.toExponential(10).replace(/\.?0+e/, "e");
    }
    
    return Number(value.toPrecision(12)).toString();
  }
  
  function run(prompt) {
    var args = parse(prompt);
    
    if (!args) {
      return Promise.reject(
        new Error(
          "Use a conversion such as \"convert 10 km to mi\" or \"25 celsius to fahrenheit\"."
        )
      );
    }
    
    var value = convert(args.amount, args.from, args.to);
    var fromName =
      args.from.category === "temperature" ?
      temperature[args.from.unit][0] :
      categories[args.from.category].units[args.from.unit][0];
    var toName =
      args.to.category === "temperature" ?
      temperature[args.to.unit][0] :
      categories[args.to.category].units[args.to.unit][0];
    
    if (!isFinite(value)) {
      throw new Error("The conversion result is outside the supported numeric range.");
    }
    
    var content =
      formatNumber(args.amount) +
      " " +
      fromName +
      " = " +
      formatNumber(value) +
      " " +
      toName +
      ".";
    
    return Promise.resolve({
      context: "Local unit conversion. No network request or external API was used.\n" +
        content,
      results: []
    });
  }
  
  window.TibUITools.register("unit-converter", {
    name: "Unit Converter",
    planningHint: 'Return one query in the exact form "convert VALUE UNIT to UNIT". Use the units and amount requested by the user. Do not invent values.',
    activeKey: "unitConverterActive",
    contextTool: true,
    required: true,
    init: function() {},
    isActive: function() {
      return !!window.TibUITools.options?.state?.unitConverterActive;
    },
    run: run,
    formatContext: function(data) {
      return data.context;
    },
    validateQuery: function(query, original) {
      var args = parse(query);
      var requested = parse(original);
      
      if (!args) {
        return false;
      }
      
      if (!requested) {
        return true;
      }
      
      return (
        args.amount === requested.amount &&
        args.from.category === requested.from.category &&
        args.from.unit === requested.from.unit &&
        args.to.category === requested.to.category &&
        args.to.unit === requested.to.unit
      );
    },
    extractConversion: parse
  });
})(window);