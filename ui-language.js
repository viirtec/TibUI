(function (window) {
  "use strict";
  var language = "en";
  var translations = {
    "New chat": "Uus vestlus",
    Chats: "Vestlused",
    "Search chats": "Otsi vestlusi",
    "Chat archive": "Vestluste arhiiv",
    "Active chats": "Aktiivsed vestlused",
    "Archived chats": "Arhiveeritud vestlused",
    "All chats": "Kõik vestlused",
    "Chat folder": "Vestluse kaust",
    "All folders": "Kõik kaustad",
    "New folder": "Uus kaust",
    Rename: "Nimeta ümber",
    Remove: "Eemalda",
    "Private session — not saved": "Privaatne seanss — ei salvestata",
    Settings: "Seaded",
    "Chat settings": "Vestluse seaded",
    "How can I help?": "Kuidas saan aidata?",
    "A small interface for local and compatible AI APIs.":
      "Lihtne kasutajaliides kohalikele ja ühilduvatele tehisintellekti API-dele.",
    Context: "Kontekst",
    "Use these tools for this message?":
      "Kas kasutada selle sõnumi jaoks neid tööriistu?",
    "Run selected tools": "Käivita valitud tööriistad",
    "Skip these tools": "Jäta need tööriistad vahele",
    Message: "Sõnum",
    Attach: "Lisa fail",
    "Paste as text": "Kleebi tekstina",
    Cancel: "Tühista",
    Tools: "Tööriistad",
    "Attach text files (experimental)": "Lisa tekstifaile (katsetuslik)",
    Provider: "Teenusepakkuja",
    "Horde text": "Horde tekst",
    "Horde images": "Horde pildid",
    Model: "Mudel",
    "Your selected provider receives the messages or image prompts you send.":
      "Valitud teenusepakkuja saab teie saadetud sõnumid või pildikirjeldused.",
    "Credits:": "Teenused:",
    "Local preferences and provider connections.":
      "Kohalikud eelistused ja ühendused teenusepakkujatega.",
    Appearance: "Välimus",
    "Interface language": "Kasutajaliidese keel",
    English: "Inglise",
    Theme: "Teema",
    System: "Süsteemi järgi",
    Light: "Hele",
    Dark: "Tume",
    Privacy: "Privaatsus",
    "Save chats in a cookie": "Salvesta vestlused küpsisesse",
    "Off by default. Custom presets also stay in browser storage. Old chats are removed when cookie space is full.":
      "Vaikimisi välja lülitatud. Oma seadistusprofiilid salvestatakse samuti brauserisse. Küpsise täitumisel eemaldatakse vanad vestlused.",
    "Export current chat": "Ekspordi käesolev vestlus",
    "Export chats": "Ekspordi vestlused",
    "Import chats": "Impordi vestlused",
    "Select the chats to import:": "Valige imporditavad vestlused:",
    "Import selected chats": "Impordi valitud vestlused",
    "Cancel import": "Tühista import",
    "Clear saved data": "Kustuta salvestatud andmed",
    "Image generation": "Piltide loomine",
    "Image controls": "Pildi seaded",
    "Simple controls for the generated image.": "Loodava pildi lihtsad seaded.",
    "Image shape": "Pildi kuju",
    "Square — 512 × 512": "Ruut — 512 × 512",
    "Portrait — 512 × 768": "Püstine — 512 × 768",
    "Landscape — 768 × 512": "Rõhtne — 768 × 512",
    "Large square — 768 × 768": "Suur ruut — 768 × 768",
    "Drawing method": "Joonistusmeetod",
    "Creative — recommended": "Loominguline — soovitatav",
    Detailed: "Üksikasjalik",
    Steady: "Ühtlane",
    "Detail passes:": "Detailisamme:",
    "More can add detail but takes longer.":
      "Rohkem samme võib lisada detaile, kuid võtab kauem aega.",
    "Prompt strength:": "Kirjelduse mõju:",
    "Higher follows your wording more strictly.":
      "Suurem väärtus järgib teie kirjeldust täpsemalt.",
    "Safety filter": "Ohutusfilter",
    "Smoother detail": "Sujuvamad detailid",
    "Repeatable seed": "Korratav juhuarvuseeme",
    Connection: "Ühendus",
    "GPT-4o via ch.at": "GPT-4o ch.at kaudu",
    "No credential is required.": "Pääsuvõtit pole vaja.",
    "Pollinations anonymous text API": "Pollinationsi anonüümne teksti-API",
    "Uses the legacy keyless endpoint and its live free-model list.":
      "Kasutab võtmeta pärandaadressi ja tasuta mudelite ajakohast loendit.",
    "Refresh models": "Värskenda mudeleid",
    "Stable Horde text": "Stable Horde tekst",
    "Anonymous text jobs run on community workers and may wait in a queue.":
      "Anonüümseid tekstipäringuid töötleb kogukond; päring võib oodata järjekorras.",
    "Loading live worker information…": "Laadin töötajate ajakohast teavet…",
    "Refresh text models": "Värskenda tekstimudeleid",
    "Stable Horde images": "Stable Horde pildid",
    "Anonymous image jobs run on community workers and may wait in a queue.":
      "Anonüümseid pildipäringuid töötleb kogukond; päring võib oodata järjekorras.",
    "Safety filtering is available in the Image generation settings. It hides adult-focused models and asks Horde to censor detected adult output.":
      "Ohutusfilter asub piltide loomise seadetes. See peidab täiskasvanutele mõeldud mudelid ja palub Hordel sobimatu väljundi filtreerida.",
    "Refresh image models": "Värskenda pildimudeleid",
    "Ollama URL": "Ollama aadress",
    "Load models": "Laadi mudelid",
    "Ollama generation parameters": "Ollama genereerimisseaded",
    Temperature: "Temperatuur",
    "Top P": "Top P",
    "Context tokens": "Konteksti tokenid",
    Seed: "Juhuarvuseeme",
    "Keep alive": "Hoia mudel mälus",
    "Remote pages need an HTTPS Ollama endpoint with matching CORS. Local HTTP addresses can be blocked by browser security.":
      "Välisel lehel peab Ollama aadress kasutama HTTPS-i ja lubama CORS-päringuid. Brauser võib kohaliku HTTP-aadressi blokeerida.",
    "API base URL": "API põhiaadress",
    "API key (optional)": "API võti (valikuline)",
    "The endpoint must allow browser requests. Keys are never saved.":
      "API peab lubama brauseripäringuid. Võtmeid ei salvestata.",
    "Chat & experimental search": "Vestlus ja katsetuslik otsing",
    "Automatic tool selection": "Automaatne tööriistavalik",
    "Off by default. Let AI use the conversation to select available tools and prepare their queries in any language. Includes Smart tools automatically. Manual selections still apply.":
      "Vaikimisi välja lülitatud. AI valib vestluse põhjal sobivad tööriistad ja koostab päringud mis tahes keeles. Nutikad tööriistad rakenduvad automaatselt. Käsitsi tehtud valikud jäävad kehtima.",
    "Smart tools": "Nutikad tööriistad",
    "On by default. Expand manual tool lookups with multiple focused searches. Basic query preparation uses conversation context even when off. Automatic selection includes this feature; image prompts use the previous text provider.":
      "Vaikimisi sisse lülitatud. Täiendab käsitsi valitud tööriistade päringuid mitme täpse otsinguga. Päringute koostamine arvestab vestluse konteksti ka väljalülitatult. Automaatne valik hõlmab seda funktsiooni; pildikirjeldusi koostab eelmine tekstiteenus.",
    "System prompt (optional)": "Süsteemijuhis (valikuline)",
    "Experimental web search": "Katsetuslik veebiotsing",
    "Makes Web search available in the + tools menu. Search runs only when you also switch that tool on for a message.":
      "Lisab veebiotsingu + tööriistamenüüsse. Otsing käivitub, kui lülitate tööriista sõnumi jaoks sisse.",
    "Connection mode": "Ühendusrežiim",
    Auto: "Automaatne",
    "Same-origin relay": "Sama päritoluga vahendaja",
    "Direct browser request": "Otsene brauseripäring",
    Results: "Tulemused",
    "Same-origin relay path": "Vahendaja tee",
    "SearXNG base URLs": "SearXNG põhiaadressid",
    "One URL per line. Auto mode tries the same-origin relay first, then direct HTTPS endpoints. A private HTTP address cannot be called from a public HTTPS page without a relay.":
      "Üks aadress rea kohta. Automaatrežiim proovib esmalt sama päritoluga vahendajat, seejärel HTTPS-aadresse. Avalik HTTPS-leht ei saa kohaliku HTTP-aadressiga ilma vahendajata ühenduda.",
    "Test search connection": "Kontrolli otsinguühendust",
    "Wikipedia knowledge lookup": "Wikipedia teabeotsing",
    "Free Wikipedia search. Enable Wikipedia in the + tools menu when you want article context added to a request.":
      "Tasuta Wikipedia otsing. Lülitage Wikipedia + tööriistamenüüs sisse, et lisada päringule artiklite teavet.",
    "Wikipedia language": "Wikipedia keel",
    "Compatibility & performance": "Ühilduvus ja jõudlus",
    "Show model company logos": "Näita mudelite ettevõtete logosid",
    "Uses small local SVG files and makes no additional network request.":
      "Kasutab väikeseid kohalikke SVG-faile, ilma lisapäringuteta.",
    Preset: "Seadistusprofiil",
    "Maximum compatibility": "Maksimaalne ühilduvus",
    Balanced: "Tasakaalustatud",
    "Fast and minimal": "Kiire ja lihtne",
    "Uses conservative rendering and request behavior for older browsers and devices.":
      "Kasutab vanematele brauseritele ja seadmetele sobivat kuvamist ja päringuid.",
    "Reduce motion": "Vähenda liikumist",
    "Disable interface animations and transitions.":
      "Lülitab kasutajaliidese animatsioonid ja üleminekud välja.",
    "Visual effects": "Visuaalsed efektid",
    "Enable shadows and decorative effects.":
      "Lubab varjud ja kujundusefektid.",
    "Refresh model lists on startup":
      "Värskenda käivitamisel mudelite loendeid",
    "Disable to save bandwidth and speed up first paint.":
      "Lülitage välja, et säästa andmemahtu ja kiirendada käivitumist.",
    "Request timeout (seconds)": "Päringu ajalimiit (sekundites)",
    "Messages sent per request": "Sõnumeid päringu kohta",
    "Free provider credits": "Tasuta teenused",
    "provides credential-less GPT-4o-compatible chat access.":
      "pakub pääsuvõtmeta GPT-4o-ga ühilduvat vestlust.",
    "provides community-powered text and image generation.":
      "pakub kogukonna toel teksti ja piltide loomist.",
    "provides the anonymous legacy text endpoint.":
      "pakub anonüümset teksti-API pärandaadressi.",
    "powers optional self-hosted web search.":
      "võimaldab valikulist isemajutatud veebiotsingut.",
    "TibUI on GitHub": "TibUI GitHubis",
    Done: "Valmis",
    "TibUI needs JavaScript to connect to an AI provider.":
      "TibUI vajab AI teenusega ühendamiseks JavaScripti.",
    "Configuration preset": "Seadistusprofiil",
    Apply: "Rakenda",
    "Save current": "Salvesta praegune",
    "☆ Favorite": "☆ Lemmik",
    "★ Favorite": "★ Lemmik",
    "Export presets": "Ekspordi profiilid",
    "Import presets": "Impordi profiilid",
    "Chat title": "Vestluse pealkiri",
    "Automatic AI titles": "Automaatsed AI pealkirjad",
    Folder: "Kaust",
    "System prompt for this chat": "Selle vestluse süsteemijuhis",
    "Entire conversation": "Kogu vestlus",
    "Recent messages": "Viimased sõnumid",
    "Recent + summary": "Viimased ja kokkuvõte",
    "Context limit (approximate tokens)":
      "Konteksti piir (ligikaudsed tokenid)",
    "Ollama uses its configured context size. Other limits are estimates you set; they do not change provider limits.":
      "Ollama kasutab määratud konteksti suurust. Teiste mudelite piirid on teie määratud hinnangud; need ei muuda teenuse piiranguid.",
    "Summarize older messages": "Tee vanemate sõnumite kokkuvõte",
    "Clear summary": "Kustuta kokkuvõte",
    "System context summary": "Süsteemikonteksti kokkuvõte",
    Search: "Otsing",
    Everyday: "Igapäevased",
    Developer: "Arendajale",
    Utilities: "Abivahendid",
    Generate: "Loomine",
    Weather: "Ilm",
    Places: "Kohad",
    Recipes: "Retseptid",
    Food: "Toiduinfo",
    Translate: "Tõlge",
    Shopping: "Ostlemine",
    Math: "Matemaatika",
    Currency: "Valuutad",
    "Unit converter": "Ühikute teisendaja",
    "Unit conversion": "Ühikute teisendamine",
    Images: "Pildid",
    Charts: "Diagrammid",
    "Web search": "Veebiotsing",
    "Web Search": "Veebiotsing",
    News: "Uudised",
    Research: "Teadustööd",
    "Manual only": "Ainult käsitsi",
    "Ask first": "Küsi enne",
    Disabled: "Välja lülitatud",
    Copy: "Kopeeri",
    Copied: "Kopeeritud",
    "Copy failed": "Kopeerimine nurjus",
    Download: "Laadi alla",
    Wrap: "Reamurdmine",
    Unwrap: "Ilma reamurdmiseta",
    Branch: "Loo haru",
    "Edit & resend": "Muuda ja saada uuesti",
    "Edit and resend": "Muuda ja saada uuesti",
    Regenerate: "Genereeri uuesti",
    "Another model": "Teine mudel",
    "Regenerate with another model": "Genereeri teise mudeliga",
    Send: "Saada",
    "Send message": "Saada sõnum",
    "Stop generation": "Peata genereerimine",
    "Copy message": "Kopeeri sõnum",
    "Edit message": "Muuda sõnumit",
    "Close settings": "Sulge seaded",
    "Close chat settings": "Sulge vestluse seaded",
    "Open settings": "Ava seaded",
    "Open chats": "Ava vestlused",
    "Close chats": "Sulge vestlused",
    "Toggle theme": "Muuda teemat",
    "Choose model": "Vali mudel",
    "Choose tools": "Vali tööriistad",
    "Delete chat": "Kustuta vestlus",
    "Archive chat": "Arhiveeri vestlus",
    "Restore chat": "Taasta vestlus",
    "Previous response version": "Eelmine vastuseversioon",
    "Next response version": "Järgmine vastuseversioon",
    "Regeneration provider": "Uue vastuse teenusepakkuja",
    "Regeneration model": "Uue vastuse mudel",
    "Used tools": "Kasutatud tööriistad",
    Sources: "Allikad",
    You: "Teie",
    "Loading…": "Laadin…",
    "Live queue unavailable": "Järjekorrateave pole saadaval",
    "Reading…": "Loen…",
    "Cancel summary": "Tühista kokkuvõte",
    "Summarizing older messages…": "Koostan vanemate sõnumite kokkuvõtet…",
    "Conversation is approaching the configured context limit.":
      "Vestlus läheneb määratud konteksti piirile.",
    "No folder": "Kaust puudub",
    "No preset": "Profiil puudub",
    Coding: "Programmeerimine",
    "Fast local": "Kiire kohalik",
    "Deep research": "Põhjalik uurimine",
    Estonian: "Eesti keel",
    "Saved in a cookie": "Salvestatud küpsisesse",
    "Use up to 5 text files, totaling at most 100 KB.":
      "Kasutage kuni 5 tekstifaili kogumahuga kuni 100 KB.",
    "Wait for the chat title or summary request to finish.":
      "Oodake vestluse pealkirja või kokkuvõtte päringu lõppu.",
    "Request cancelled.": "Päring tühistatud.",
    "Tool selection skipped.": "Tööriistavalik jäeti vahele."
  };
  translations["Edit"] = "Muuda";
  translations["Other model"] = "Teine mudel";
  translations["Chats saved in a cookie"] =
    "Vestlused salvestatakse küpsisesse";
  translations[
    "Conversation exceeds the configured context estimate. Choose recent messages or summarize older messages in Chat settings."
  ] =
    "Vestlus ületab määratud konteksti hinnangulise piiri. Valige vestluse seadetes viimased sõnumid või koostage vanematest kokkuvõte.";
  translations["Open menu"] = "Ava menüü";
  translations["Close menu"] = "Sulge menüü";
  translations["Conversation"] = "Vestlus";
  translations["Message TibUI"] = "Kirjuta TibUI-le";
  translations["Approximate context usage"] = "Konteksti ligikaudne kasutus";
  translations["Approve tool lookups"] = "Kinnita tööriistapäringud";
  translations["Switch to light mode"] = "Lülitu heledale teemale";
  translations["Switch to dark mode"] = "Lülitu tumedale teemale";
  translations["Choose chats to import"] = "Vali imporditavad vestlused";
  translations["Loading live queue…"] = "Laadin järjekorrateavet…";
  translations["ETA unknown"] = "Ooteaeg teadmata";
  translations["Wait for files to finish loading."] =
    "Oodake failide lugemise lõppu.";
  translations["Preparing tool queries…"] = "Koostan tööriistapäringuid…";
  translations["Selecting tools…"] = "Valin tööriistu…";
  translations["Anonymous GPT-4o chat through ch.at."] =
    "Anonüümne GPT-4o vestlus ch.at kaudu.";
  translations["Credential-less GPT-4o-compatible access provided by ch.at."] =
    "Pääsuvõtmeta GPT-4o-ga ühilduv ligipääs ch.at kaudu.";
  translations["Free models from the Pollinations anonymous legacy endpoint."] =
    "Tasuta mudelid Pollinationsi anonüümse pärandaadressi kaudu.";
  translations[
    "Community-hosted text models. Queue time depends on live workers."
  ] =
    "Kogukonna majutatud tekstimudelid. Ooteaeg sõltub aktiivsetest töötajatest.";
  translations[
    "Community-hosted image models with optional safety filtering."
  ] = "Kogukonna majutatud pildimudelid valikulise ohutusfiltriga.";
  translations["Connect directly to an Ollama server you control."] =
    "Ühenduge otse enda hallatava Ollama serveriga.";
  translations["Connect to a browser-accessible OpenAI-compatible endpoint."] =
    "Ühenduge brauserist ligipääsetava OpenAI-ga ühilduva API-ga.";
  translations["Translation"] = "Tõlge";
  translations["Unit Converter"] = "Ühikute teisendaja";
  translations["Food info"] = "Toiduinfo";
  translations["Latest news"] = "Värsked uudised";
  translations["Unfiled"] = "Kaustata";
  translations["Choose a preset"] = "Vali profiil";
  translations["Folder name"] = "Kausta nimi";
  translations["Rename folder"] = "Nimeta kaust ümber";
  translations["Save current configuration as preset"] =
    "Salvesta praegune seadistus profiilina";
  translations["Planning tools\u2026"] = "Kavandan tööriistu…";
  translations["Retrying tool planning\u2026"] =
    "Proovin tööriistade kavandamist uuesti…";
  translations["Approve the proposed tool lookups, or skip them."] =
    "Kinnitage kavandatud tööriistapäringud või jätke need vahele.";
  translations[
    "Exported current chat. If your browser opens JSON, save that file to import it later."
  ] =
    "Käesolev vestlus eksporditud. Kui brauser avab JSON-faili, salvestage see hilisemaks importimiseks.";
  translations[
    "Exported all chats. If your browser opens JSON, save that file to import it later."
  ] =
    "Kõik vestlused eksporditud. Kui brauser avab JSON-faili, salvestage see hilisemaks importimiseks.";
  translations["Ready to import. Choose individual chats from the list."] =
    "Importimiseks valmis. Valige loendist soovitud vestlused.";
  translations["Finish or cancel the request before importing."] =
    "Lõpetage või tühistage päring enne importimist.";
  translations["Select at least one chat."] = "Valige vähemalt üks vestlus.";
  translations["Chat imports must be smaller than 10 MB."] =
    "Imporditav vestlusfail peab olema väiksem kui 10 MB.";
  translations["Could not read the chat file."] =
    "Vestlusfaili lugemine nurjus.";
  translations["Attach pasted content as pasted-text.txt?"] =
    "Kas lisada kleebitud sisu failina pasted-text.txt?";
  translations["Finish or cancel the request before changing presets."] =
    "Lõpetage või tühistage päring enne profiili muutmist.";
  translations["Preset removed. Chats were kept."] =
    "Profiil eemaldatud. Vestlused jäeti alles.";
  translations["Preset imports must be smaller than 1 MB."] =
    "Imporditav profiilifail peab olema väiksem kui 1 MB.";
  translations["Could not read preset file."] =
    "Profiilifaili lugemine nurjus.";
  translations[
    "Use up to 20 custom presets. Export and remove a preset before adding another."
  ] =
    "Lubatud on kuni 20 oma profiili. Uue lisamiseks eksportige ja eemaldage mõni profiil.";
  translations["Finish or cancel the current request first."] =
    "Esmalt lõpetage või tühistage käesolev päring.";
  translations[
    "No older messages to summarize. Reduce the recent message count to summarize more."
  ] =
    "Vanemaid sõnumeid kokkuvõtteks pole. Vähendage allesjäetavate viimaste sõnumite arvu.";
  translations[
    "Older messages exceed the configured context budget. Increase the context limit or use recent messages."
  ] =
    "Vanemad sõnumid ületavad konteksti mahu. Suurendage piiri või kasutage viimaseid sõnumeid.";
  translations[
    "Older messages summarized; recent messages remain in context."
  ] = "Vanemad sõnumid on kokku võetud; viimased jäävad konteksti.";
  translations["A folder with that name already exists."] =
    "Selle nimega kaust on juba olemas.";
  translations["Saved chats and cookie data cleared."] =
    "Salvestatud vestlused ja küpsiseandmed kustutatud.";
  translations["Cookie storage is full. Newer chats may not be saved."] =
    "Küpsiseruum on täis. Uuemad vestlused ei pruugi salvestuda.";
  translations[
    "Image generation is disabled. Change its policy in the tools menu before sending."
  ] =
    "Piltide loomine on keelatud. Muutke enne saatmist tööriistamenüüs selle reeglit.";
  translations["Finish or cancel the request before switching versions."] =
    "Lõpetage või tühistage päring enne versiooni vahetamist.";
  translations[
    "This answer has 50 versions. Branch to generate more without discarding existing versions."
  ] =
    "Sellel vastusel on 50 versiooni. Uute loomiseks alustage haru, et senised versioonid säiliksid.";
  var originals = {};
  Object.keys(translations).forEach(function (key) {
    originals[translations[key]] = key;
  });
  var observer;
  var changed = [];
  var pending = false;
  function text(value) {
    if (language !== "et") {
      return value;
    }
    var normalized = String(value).replace(/\s+/g, " ").trim();
    if (translations[normalized]) {
      return value.replace(/\S[\s\S]*\S|\S/, translations[normalized]);
    }
    var prefixes = {
      "Using ": "Kasutan: ",
      "Contacting ": "Ühendun: ",
      "Manage ": "Halda: ",
      "Delete ": "Kustuta: ",
      "Archive chat ": "Arhiveeri vestlus: ",
      "Restore chat ": "Taasta vestlus: ",
      "Automatic selection policy for ": "Automaatse valiku reegel: ",
      "Context ": "Kontekst ",
      "Files: ": "Failid: ",
      "Applied ": "Rakendatud: ",
      "Saved ": "Salvestatud: ",
      "Import failed: ": "Import nurjus: ",
      "Attach pasted files: ": "Kas lisada kleebitud failid: ",
      "Response version ": "Vastuseversioon ",
      "Attach pasted content as ": "Kas lisada kleebitud sisu failina ",
      "Copy code": "Kopeeri kood",
      "Download code": "Laadi kood alla",
      "Wrap code": "Koodi reamurdmine"
    };
    Object.keys(prefixes).some(function (prefix) {
      if (normalized.indexOf(prefix) === 0) {
        value = prefixes[prefix] + normalized.substring(prefix.length);
        return true;
      }
      return false;
    });
    if (
      /^Imported \d+ chat\(s\)\. Existing chats were kept\.$/.test(normalized)
    ) {
      return (
        "Imporditud " +
        normalized.match(/\d+/)[0] +
        " vestlus(t). Senised vestlused jäeti alles."
      );
    }
    if (
      /^Imported \d+ presets; existing presets were kept\.$/.test(normalized)
    ) {
      return (
        "Imporditud " +
        normalized.match(/\d+/)[0] +
        " profiili; senised profiilid jäeti alles."
      );
    }
    if (/^Tools, \d+ enabled$/.test(normalized)) {
      return "Tööriistad, " + normalized.match(/\d+/)[0] + " sisse lülitatud";
    }
    if (normalized.indexOf("★ ") === 0) {
      return "★ " + text(normalized.substring(2));
    }
    Object.keys(translations).some(function (name) {
      if (normalized.indexOf(name + " · ") === 0) {
        value = translations[name] + normalized.substring(name.length);
        return true;
      }
      return false;
    });
    return value
      .replace(/\bworkers?\b/g, "töötajat")
      .replace(/\bqueued\b/g, "järjekorras")
      .replace(/\bqueue\b/g, "järjekord")
      .replace(/\bQueue:/g, "Järjekord:")
      .replace(/\btokens\b/g, "tokenit")
      .replace(/ automatic selection policy$/, " automaatse valiku reegel");
  }
  function excluded(element, attribute) {
    var summary = element && element.tagName === "SUMMARY";
    if (element && element.tagName === "OPTION") {
      if (
        element.parentNode.id === "configuration-preset" &&
        element.value &&
        element.value.indexOf("builtin-") !== 0
      ) {
        return true;
      }
      if (
        /^(chat-folder|folder-filter)$/.test(element.parentNode.id) &&
        element.value
      ) {
        return true;
      }
    }
    while (element && element !== document.body) {
      if (
        element.classList &&
        (element.classList.contains("ui-label") ||
          element.classList.contains("code-toolbar") ||
          element.classList.contains("chart-download") ||
          element.classList.contains("message-actions"))
      ) {
        return false;
      }
      if (
        element.tagName === "SCRIPT" ||
        element.tagName === "STYLE" ||
        element.tagName === "PRE" ||
        element.tagName === "CODE" ||
        (element.tagName === "TEXTAREA" && !attribute) ||
        (element.classList &&
          (element.classList.contains("message-chart") ||
            element.classList.contains("message-files") ||
            (element.classList.contains("chat-item") && !attribute) ||
            (element.classList.contains("bubble") &&
              !element.querySelector(".tool-inspector"))))
      ) {
        return true;
      }
      if (element.classList && element.classList.contains("tool-inspector")) {
        return !summary && !attribute;
      }
      if (element.classList && element.classList.contains("bubble")) {
        return true;
      }
      if (element.id === "tool-approval-list" || element.id === "chat-title") {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  }
  function update(node, property, original, last) {
    var current =
      property === "nodeValue" ? node.nodeValue : node.getAttribute(property);
    if (current === null) {
      return;
    }
    if (typeof node[original] === "undefined" || current !== node[last]) {
      var normalized = String(current).replace(/\s+/g, " ").trim();
      node[original] = originals[normalized]
        ? current.replace(/\S[\s\S]*\S|\S/, originals[normalized])
        : current;
    }
    var translated = text(node[original]);
    node[last] = translated;
    if (current !== translated) {
      if (property === "nodeValue") {
        node.nodeValue = translated;
      } else {
        node.setAttribute(property, translated);
      }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) {
      if (!excluded(root.parentNode, false)) {
        update(root, "nodeValue", "_tibOriginal", "_tibLast");
      }
      return;
    }
    if (root.nodeType !== 1) {
      return;
    }
    ["aria-label", "title", "placeholder"].forEach(function (attribute) {
      if (!excluded(root, true)) {
        update(
          root,
          attribute,
          "_tibOriginal" + attribute,
          "_tibLast" + attribute
        );
      }
    });
    var child = root.firstChild;
    while (child) {
      walk(child);
      child = child.nextSibling;
    }
  }
  function observe() {
    if (observer) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "title", "placeholder"]
      });
    }
  }
  function refresh() {
    pending = false;
    if (observer) {
      observer.disconnect();
    }
    if (changed.length) {
      changed.forEach(function (node) {
        if (document.body.contains(node)) {
          walk(node);
        }
      });
      changed = [];
    } else {
      walk(document.body);
    }
    observe();
  }
  window.TibUII18n = {
    text: text,
    setLanguage: function (value) {
      language = value === "et" ? "et" : "en";
      document.documentElement.lang = language;
      changed = [];
      refresh();
    }
  };
  if (window.MutationObserver) {
    observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        var target = record.target;
        if (record.type === "childList") {
          Array.prototype.forEach.call(record.addedNodes, function (node) {
            if (changed.indexOf(node) < 0) {
              changed.push(node);
            }
          });
        } else if (changed.indexOf(target) < 0) {
          changed.push(target);
        }
      });
      if (!pending) {
        pending = true;
        window.setTimeout(refresh, 0);
      }
    });
    observe();
  }
})(window);
