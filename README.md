# TibUI

TibUI is a small, self-hostable AI frontend made from static HTML, CSS, and JavaScript. It has no build step, framework, server database, or required account. It is designed to remain usable on old browsers like iOS 12+, other older HTML5 supported mobile devices, and current up to date browsers.

## Features

- OpenAI-compatible chat APIs
- Credential-less GPT-4o-compatible chat through ch.at
- Pollinations anonymous text models
- Stable Horde / AI Horde text and image generation with live model, worker, queue, and ETA information
- Stable Horde image controls in Settings, with optional safety filtering and repeatable seeds
- Optional **Smart tools**, off by default: model-prepared tool queries, lookups, and a final answer using the results
- A + tools menu with on/off switches generated from a modular tool registry, with enabled-tool buttons in the composer
- Optional AI tool selection using conversation context in Settings, off by default
- Live Open-Meteo weather and seven-day forecasts without an API key
- Wikipedia lookup in six languages
- Local Math and Unit Converter tools, plus MyMemory translation through the shared planner
- Keyless GitHub repository and issue search, repository filename lookup, and text-file reading
- Experimental text attachments with filename previews and removal before sending (.txt, .json, .md, .csv, .log, .xml, .yaml, .yml)
- Individual chat export and selective JSON chat import, including images, sources, and attached text
- Keyless Frankfurter currency conversion using the latest daily reference rate
- Crossref research-paper search and DOI metadata lookup, with abstracts and accessible Europe PMC article text
- Copy controls under messages; copy, download, and wrap controls for fenced code blocks
- Local Ollama model discovery and generation controls
- Optional SearXNG web search using a same-origin relay or a direct browser connection
- Anonymous sessions by default, with opt-in cookie chat storage
- Searchable chat history and named folders
- AI-generated chat titles after the first answer, with manual renaming and an opt-out
- Response versions with previous/next controls, explicit conversation branches, edit-and-resend, and regeneration with another model
- Archivable chats with restore controls and active/archive history filters
- Favorite configuration presets, with built-in Coding, Research, Fast local, Deep research, and Estonian choices
- Grouped tools and individual Auto, Manual only, Ask first, or Disabled policies
- Multi-step shopping comparisons and alternatives using the keyless PriceLists.org product API
- Per-chat system prompts and context controls in the right-hand Chat settings panel
- Approximate context usage, recent messages, entire conversation, and older-message summaries
- Large pasted text and supported clipboard files can be approved as attachments
- Collapsible tool results with queries, normalized output, timing, and source links
- Open Food Facts product names, barcodes, ingredients, allergens, and nutrition
- OpenStreetMap nearby places via Overpass, with addresses and mapped opening hours
- TheMealDB recipes, ingredients, measurements, instructions, cuisine, and image links
- Latest-news searches through keyless FreeNewsAPI.ai
- Deletable chat-history entries
- Dark mode by default with a top-bar light/dark switch and a system-theme option
- Compatibility presets and a maximum-compatibility mode
- Model-company logos stored locally with no logo requests to third parties
- Responsive layouts for 320 px phones, tablets, and desktop displays, with a compact model selector
- Safe lightweight Markdown rendering for headings, lists, links, quotes, code, tasks, and tables

## Interface

Provider, model, and send controls share one compact toolbar below the message box. Open **+** to switch tools on or off and attach text files. Manually enabled tools stay selected until switched off. The provider and model selectors sit together between equally sized tools and send buttons. Buttons beneath the composer toolbar show enabled tools and open their switches. Automatically selected tools are labeled “auto” for the latest request. Web search first needs to be enabled and configured in Settings; the other tools need no API key.

Turn on **Image generation** to select Stable Horde images. Turning it off returns to the previous text provider. Image settings are always available under **Settings → Image generation**; choosing Horde images directly remains supported. Text lookup tools are unavailable while generating images.

## Conversations and context

Use **Search chats** to search titles, message text, and attached filenames. The archive control beside each chat moves it out of active history while retaining its messages. Choose **Archived chats** or **All chats** to find it and use Restore to return it to active history. Archived chats are included in JSON exports. Create folders in the history menu, assign the current chat under **Chat settings → Folder**, and filter history by folder. Rename and remove controls apply to the selected folder; removing a folder keeps its chats.

Message actions appear beside Copy. **Branch** starts a separate chat containing messages through that point. **Edit → Resend** starts a branch for a changed prompt. **Regenerate** and **Other model** keep alternative answers as versions on the same assistant message, with `‹ 2 / 4 ›` controls; they do not add chats to the sidebar. Regenerating an earlier answer uses conversation context only through its original prompt. Later messages stay intact; use **Branch** on the chosen version to continue a divergent conversation. Up to 50 versions are retained per answer; branch to generate more without discarding existing versions. **Other model** lets you choose a provider and model before regenerating; configured provider credentials and connection settings still apply. Pending composer text and attachments remain available when regenerating.

**Chat settings**, in the top bar, opens a right-hand panel for the current title, folder, extra system instructions, and context. AI titles are generated after the first successful answer; turn off **Automatic AI titles** to use the first message as the title. Titles and summaries use the chosen text provider, including the previous text provider when generating images. A failed title request keeps the initial title.

**Entire conversation** sends all supported text messages. **Recent messages** sends the configured number, which defaults to the global history limit. **Recent + summary** combines a stored summary with recent messages and any newer messages not yet summarized. **Summarize older messages** asks the text model to summarize the older portion; it preserves the actual messages in history. Summaries can lose detail. Regenerate the summary as the chat grows, or clear it to discard it. Summarization reports when its input exceeds the configured estimate rather than silently omitting older content.

The composer estimates tokens as characters divided by four and warns at 85% of the configured limit. This covers selected conversation text, instructions, summary, pending text, and attachments; tokenizer differences, provider formatting, and newly fetched tool results can increase actual usage. Ollama uses its **Context** setting. Set an approximate limit for other providers in Chat settings; this does not change their server limits. No messages are automatically discarded to meet that estimate.

Large pasted text prompts an attachment offer instead of filling the message box. Approve **Attach** to add `pasted-text.txt`, or cancel. Pasted supported text files use the same approval and size limits as file uploads. **Paste as text** is available when the content fits the composer.

Chat JSON export/import preserves response versions, archive status, folders, per-chat instructions, context settings, summaries, attached text, and normalized tool inspection records. Cookie storage remains optional and size-limited; a summary that does not fit is omitted from the saved cookie and that saved chat uses recent messages. If response versions do not fit the cookie, the selected answer is kept while alternatives are omitted from that saved copy. Use JSON exports to keep complete conversations.

## Configuration presets

Under **Chat settings → Configuration preset**, apply **Coding**, **Research**, **Fast local**, **Deep research**, or **Estonian**, or use **Save current** to create your own. A custom preset captures provider/model, global and per-chat system prompts, manual tool selections, automatic-selection policies, Auto/Smart preferences, context mode and size, recent-message count, and supported generation settings. Ollama temperature and optional OpenAI-compatible temperature are included. Applying a preset changes the current chat's configuration without deleting messages or generating a summary automatically. Provider context limits still apply; the preset's estimate cannot enlarge a provider's actual context.

Favorite presets appear first. Up to 20 custom presets can be saved, replaced by saving the same name, removed, exported as JSON, and imported without replacing existing presets. Built-in presets are reusable starting points; they do not contain credentials or promise particular model capacity. **Fast local** uses your configured Ollama model.

Custom presets stay in memory by default. With **Save chats in a cookie** enabled, presets are also saved in local browser storage; disabling saving removes that stored preset copy. Presets never contain API keys, chat text, or conversation summaries. If storage is blocked, use **Export presets**. Import accepts only supported configuration fields. Applying a preset with a different custom API endpoint clears the in-memory key so it is not sent to the new endpoint.

## Shopping

**Shopping** uses the [PriceLists.org public Agent Commerce search API](https://pricelists.org/en/agent-docs), without a key, account registration, purchase, or general web/SearXNG search. The conversation-aware planner prepares product requirements, optional user-supplied shipping country and budget, and currency (EUR when unspecified). It searches in-stock offers using price and merchant-reputation rankings, then asks the model for up to two more specific or alternative product searches. The final model receives normalized offers and prepares the comparison. Each message makes at most three product searches, with matching searches reused for five minutes. When Shopping is selected, general web-search tools are skipped for that message even if enabled.

Results focus on reported availability and its timestamp, price/currency, identifiers, merchant reputation, historical lows, and delivery information when available. Shipping and taxes are often unknown, and merchant reputation does not measure product quality. The model must distinguish these gaps and cannot invent offers or claim a globally best price.

The filter retains direct HTTPS offers from an explicit list of established retailer/manufacturer domains. It rejects unknown retailers, marketplaces, explicit dropshipping flags, affiliate/redirect endpoints, unavailable offers, and offers above the supplied item-price budget. Tracking and affiliate query parameters and URL fragments are stripped from retained links and shopping answer URLs; product-identifying parameters such as SKU remain. Source links use `noreferrer`, and no remote shopping images are loaded. The API does not independently certify fulfillment, so this filter cannot guarantee that every retained retailer offer is free of dropshipping. Catalog coverage can be limited; when no eligible offers remain, TibUI reports that instead of substituting general web results or excluded listings.

## Food, recipes, places, and news

Enable these tools in **+**, or let Automatic tool selection choose them. Like the other tools, each uses the shared conversation-aware planner and displays its lookup in **Used tools** under the answer. Tool text is treated as untrusted reference material; the inspector shows normalized, bounded output rather than arbitrary API payloads.

- **Food info** searches [Open Food Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/) by product/brand or barcode. It supplies ingredients, declared allergens, nutrition per 100 g, Nutri-Score and NOVA values when present. Data is crowdsourced under ODbL and may be incomplete; missing allergen data does not imply allergen absence. Product lookups are temporarily reused for five minutes.
- **Recipes** uses [TheMealDB](https://www.themealdb.com/docs_api_guide.php) public test key `1`, without signup or a private key. Search a dish, filter by one ingredient, request a specific meal ID, or ask for inspiration. Ingredient searches fetch full recipe details for up to three meals. Results include instructions, ingredient measurements, category, cuisine, and image/source links. TheMealDB recommends a supporter key for publicly shipped apps; key `1` is its public testing/personal-project access. Recipes are attributed to TheMealDB and temporarily reused for five minutes.
- **Places** searches [OpenStreetMap via Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API) around a named city or user-supplied coordinates, using Open-Meteo city lookup. It returns up to 20 mapped places within 100–10,000 meters, with source links, addresses, cuisine, coordinates, and opening hours when mapped. The tool tries a second documented public Overpass endpoint if the first request fails, with a 25-second timeout for each. Successful searches are reused for five minutes. No location permission is requested. OpenStreetMap contributors provide the data under ODbL; coverage and hours may be outdated.
- **Latest news** uses [FreeNewsAPI.ai](https://freenewsapi.ai/docs), which documents no key, signup, or authentication header and supports browser CORS. The tool prepares a concise English topic query and requests English source articles sorted by publication date. Its model context preserves the original conversation language for the final answer. Responses include publisher links, dates, and article summaries. Searches are temporarily reused for one minute. News coverage is incomplete and publisher claims are not independently verified.

## Providers

| Provider                | Credentials                       | Use                                   |
| ----------------------- | --------------------------------- | ------------------------------------- |
| ch.at                   | None                              | GPT-4o-compatible chat                |
| Pollinations            | None for the legacy text endpoint | Selectable free text models           |
| Stable Horde / AI Horde | Anonymous key included            | Community text and image workers      |
| Ollama                  | Normally none                     | Local or self-hosted models           |
| OpenAI-compatible       | Optional API key                  | Any browser-accessible compatible API |

Public, credential-less services can rate-limit requests, change models, or become unavailable. TibUI reports provider errors but cannot guarantee third-party uptime.

## Run locally

TibUI must be served over HTTP rather than opened as a `file:` URL.

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Any static web server works. Upload `index.html`, `style.css`, `app.js`, `chat-files.js`, `code-controls.js`, `horde-models.js`, `chat-workspace.js`, `chat-presets.js`, `tools/`, and `icons/` together. No compilation is required.

## Privacy and storage

Chat saving is off by default. Without it, chat history exists only in the current page session. When enabled, TibUI stores a size-limited set of recent chats and preferences in a first-party cookie. Custom presets use local browser storage only when saving is enabled. API keys are kept only in memory and are never written to cookies, stored presets, or preset exports.

Messages and image prompts are sent directly from the browser to the selected provider. Web search queries are sent to the configured SearXNG route only when experimental web search is available in Settings and Web search is switched on in the + menu. Weather, Wikipedia, and GitHub queries go directly to their respective public APIs when selected. Attached text is sent to the selected provider with the message and retained in that chat for follow-up requests.

## Ollama

The default URL is `http://localhost:11434`. Settings include model discovery, temperature, top-p, context length, seed, and keep-alive.

When TibUI and Ollama use different origins, Ollama must allow the page origin. For example, start Ollama with an origin matching the site:

```sh
OLLAMA_ORIGINS="https://your-tibui.example" ollama serve
```

An HTTPS TibUI page normally cannot call an HTTP Ollama endpoint because browsers block mixed content. Use both services locally over HTTP, expose Ollama securely, or proxy it behind the TibUI origin.

## Web search and local SearXNG

Web search is experimental and off by default. Enable it under **Chat & experimental search** to make Web search available in the + menu. The Web tool remains off until selected, so enabling the feature does not add search data to every request.

SearXNG must have JSON output enabled:

```yaml
search:
  formats:
    - html
    - json
```

A browser-only app cannot bypass any of the following:

- a missing `Access-Control-Allow-Origin` response header
- an HTTP 429 rate limit
- an HTTPS page trying to call an HTTP endpoint
- an invalid certificate on an HTTPS IP address
- browser private-network access restrictions

Changing a private HTTP address to use an `https://` prefix does not fix the connection unless that server actually provides trusted HTTPS.

### Recommended same-origin relay

Set the TibUI search mode to **Same-origin relay** or **Auto**, and use `/searxng` as the relay path. The public-facing web server must forward that path to SearXNG.

Nginx example:

```nginx
location /searxng/ {
    proxy_pass http://searxng:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Caddy example:

```caddyfile
handle_path /searxng/* {
    reverse_proxy searxng:8080
}
```

This makes the browser request `https://your-tibui.example/searxng/search`; the server performs the private HTTP request. It avoids browser CORS, mixed-content, and private-network barriers without exposing SearXNG directly.

GitHub Pages cannot provide a reverse proxy. A GitHub Pages deployment must use a separate HTTPS SearXNG endpoint that permits the site origin, or place the custom domain behind infrastructure that can implement `/searxng`.

### Direct cross-origin access

Direct mode works only when SearXNG is served over acceptable HTTPS and returns an appropriate CORS header. A narrowly scoped example is:

```yaml
server:
  default_http_headers:
    Access-Control-Allow-Origin: https://your-tibui.example
```

Review your SearXNG version's configuration documentation and restrict access appropriately. A wildcard CORS policy may expose a private instance to unwanted public use.

## Compatibility presets

| Preset                | Behavior                                                                                |
| --------------------- | --------------------------------------------------------------------------------------- |
| Maximum compatibility | Conservative rendering, reduced motion, no effects, slower polling, 12-message requests |
| Balanced              | Effects and live model refresh enabled, 24-message requests                             |
| Fast and minimal      | Reduced motion, no effects or startup model refresh, 8-message requests                 |

Maximum compatibility is enabled by default. Model-company logos can be disabled independently under **Compatibility & performance**.

## Stable Horde models

TibUI reads text and image model data from the AI Horde status API. Model lists are reused in memory for two minutes and concurrent lookups share one request, so reopening menus does not repeatedly fetch the list. **Refresh models** bypasses this cache. Failed background list requests wait briefly before retrying. Nothing is cached across page reloads.

The composer reads the selected model’s live worker, queue and estimated wait data separately, refreshing every 30 seconds while visible and idle. Active generation queue position and remaining ETA continue to update through job polling. These live responses are not stored in the model-list cache.

With **Automatic tool selection** enabled, image requests also select a model automatically. AI identifies the best matching active models for the requested subject and style; TibUI chooses the shortest reported queue-clearance ETA among those models, then uses queued jobs and available workers as tie breakers. Models without workers and models hidden by the safety setting are excluded. An explicitly requested available model is preferred. If selection fails, TibUI reports the fallback in the status line. Queue estimates can change before the job runs.

The **Image generation** section in Settings configures Stable Horde image requests, regardless of which provider is currently selected. It uses plain-language labels and touch-friendly sliders for shape, drawing method, detail passes, prompt strength, smoother detail, optional safety filtering, and a repeatable seed. Larger dimensions and more detail passes generally increase queue and generation time.

Long backend identifiers are simplified only for display. For example:

```text
koboldcpp/Meta-Llama-3.1-8B-Instruct-IQ4_NL → Llama 3.1 8B Instruct
```

The original identifier is still sent to the API.

Safety filtering is enabled by default for Stable Horde images. It hides obviously adult-focused model names and asks AI Horde to censor detected adult output. It is an optional best-effort control, not a guarantee.

## Weather, Wikipedia, and GitHub tools

Enable **Weather** in the + menu, then ask `weather Tallinn`, `weather in Tallinn tomorrow`, `weather tomorrow Tallinn`, `will it rain in Tallinn?`, or enter a city name. TibUI resolves the city using Open-Meteo geocoding and sends current conditions and a seven-day forecast to the selected text model. If a location cannot be resolved, it reports the lookup error rather than asking the model to invent live weather. City names should be specific; geocoding currently selects the first matching location. No device location permission is used.

**Wikipedia** searches for the message text and adds article extracts and source links. Language and result count are configurable in Settings.

**GitHub** uses the public REST API without a token:

- `github repos lightweight chat language:javascript` searches public repositories.
- `github issues repo:owner/repo bug` searches issues and pull requests.
- `github code owner/repo filename` or `github files owner/repo filename` searches paths within a repository's default branch, with up to 20 results.
- `github file owner/repo path/to/file.js` reads a text file under 100 KB, adding up to 16,000 characters to model context.

[GitHub global code-content search requires authentication](https://docs.github.com/en/rest/search/search#search-code), so the keyless tool offers repository filename lookup and explicit file reading instead. [Unauthenticated API requests have IP-based rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api); filename lookup can be incomplete when GitHub truncates a large repository tree. Optional lookup failures are reported while chat continues. Disable unrelated tools when you only want one kind of lookup.

## Currency conversion and research

Enable **Currency** and ask `convert 100 EUR to USD` or `25 GBP in EUR`. Currency codes are case-insensitive; amounts support decimals and comma thousands separators. TibUI fetches the latest available rate from the [keyless Frankfurter v2 API](https://frankfurter.dev/), calculates the amount locally, and sends the result, rate, and publication date to the model. Frankfurter provides daily reference rates rather than live intraday trading quotes; the tool does not claim second-by-second prices. Unsupported pairs and malformed conversions report errors instead of asking the model to invent a rate.

Enable **Research** and ask `research papers quantum computing`, or enter `DOI metadata 10.1038/nphys1170`. The [keyless Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) supplies up to five metadata matches, or one record for an exact DOI, with title, authors, publication date, publication name, publisher, and DOI links. TibUI includes Crossref abstracts when supplied and looks up matching DOIs in [Europe PMC](https://europepmc.org/RestfulWebService). It reads openly available article XML there and extracts section headings and paragraphs so the model can discuss findings, methods, and limitations from the text. Each paper is labeled **Metadata only**, **Abstract only**, or **Article body excerpt**, with readable-paper source links when available. Inaccessible papers retain whatever abstract or metadata is available; the model is instructed to distinguish that evidence from text it actually received.

For performance on older devices, each request returns up to five Crossref records, checks the first three in Europe PMC, and attempts full-text reading for the first two. Each XML download is limited to 2 MB and 20 seconds; Europe PMC metadata lookups have a 15-second timeout. Abstracts are limited to 5,000 characters. Article bodies longer than 24,000 characters contribute their first 16,000 and last 8,000 characters, with an explicit omission marker. Figures, tables, references, and supplements are not represented as full document contents. Europe PMC focuses on life-sciences literature, so many other papers may have only a Crossref abstract or metadata. TibUI does not bypass paywalls or parse PDF files.

For example, `read paper DOI 10.1093/nar/gku1061` adds the accessible article body to the model request. Enable Research manually or use automatic selection. Paper text goes directly to the selected model along with the prompt.

## Automatic tool selection

The **+** menu groups tools under **Search**, **Everyday**, **Developer**, **Utilities**, and **Generate**. Scroll within the menu to reach lower groups. New tools can declare a `group` name; tools without one default to Utilities.

Each tool has an individual policy:

- **Auto** permits automatic selection when global Automatic tool selection is enabled, and also allows manual selection.
- **Manual only** excludes the tool from automatic planning; its switch can still enable it explicitly.
- **Ask first** lets the model propose the tool and its queries, then waits for approval for that message. Choose which proposed tools to run, skip them, or cancel the request. Manually enabling the tool already supplies permission and does not prompt again.
- **Disabled** prevents both manual and automatic use until the policy is changed.

Policies default to Auto to preserve existing behavior. Approvals do not carry over to future messages. Changing a policy cancels an active request; preset configurations can save these policies.

Under **Settings → Chat & experimental search**, turn on **Automatic tool selection** if desired. It is off by default. The selected model receives recent conversation messages and the available tool catalog, then selects useful tools and prepares their input in one JSON planning request. There is no English keyword gate: Estonian questions, paraphrases and follow-ups are interpreted by the model. For example, after discussing Shiba Inu dogs, `How big are they?` can become a Wikipedia search for Shiba Inu height and weight.

Automatic selection includes Smart tools automatically; its separate checkbox is disabled while automatic selection is on and restores its saved preference when automatic selection is turned off. Manual selections continue to apply. Optional automatic tools are limited to three per message and are shown with an “auto” chip rather than saved as manual switches. Greetings and requests that do not benefit from lookup can skip tools. Automatically selected tools appear as checked switches. Turn one off to clear its current selection. It remains available for the AI to select again on a later message when useful; switching it on explicitly enables it manually. Switching, starting or deleting chats clears automatic selections, and automatic image selection restores the previous text provider. Manually selected tools retain their existing behavior.

Only available tools appear in the catalog. Web search still requires its Settings availability switch and connection configuration. Text lookup tools are unavailable while generating images. An explicit image request can switch to Horde images after planning, retaining image settings, without cancelling the active request. Turning image generation off returns to the previous text provider.

## Code blocks

Fenced code blocks (backticks or tildes), including an unfinished final fence, have **Copy**, **Download**, and **Wrap** buttons. Copy uses the browser clipboard or the older `execCommand` path. Download saves the exact code text with an extension based on the language; unknown languages use `.txt`. Wrap changes display only. The original code remains unchanged for copying and downloading. On older Safari, a download can open in another tab for saving through browser controls.

## Text attachments and chat transfer

Selected files appear by filename beneath the prompt immediately, including while being read. Use the **×** button next to any unsent file to remove it; a file removed while loading will not return. Long filenames remain readable through their full-name tooltip. Sent filenames appear with the message and are preserved by chat export/import.

Use **+ → Attach text files (experimental)** to select up to five files totaling 100 KB. Click a file chip to remove it before sending. Text is read with FileReader; TibUI does not upload files to a storage service. Attached text is included with the next message and preserved in conversation context and chat exports. For image generation it is appended to the image prompt. Binary files and larger documents are unsupported.

Under **Settings → Privacy**, **Export chats** downloads all current chats as `tibui-chats.json`; **Export current chat** downloads the active conversation as `tibui-chat.json`. **Import chats** validates either format and presents a checkbox list. Choose one or more chats and click **Import selected chats** to add only those conversations with new IDs, retaining existing chats. Cancel leaves the history untouched. Imports support version 1 exports, files under 10 MB, up to 200 chats and 20,000 messages. Malformed imports leave existing chats untouched. Exported JSON contains conversation contents and attached text, but no API keys or provider settings.

Safari versions without download-attribute support may open the JSON instead; save the opened file using the browser's sharing or save controls. Import does not enable cookie storage. Large histories are best preserved using exports because cookie saving remains size-limited. Exported image URLs can expire at the provider; export does not download remote image bytes.

## Smart tools

Enable **Settings → Chat & experimental search → Smart tools** to expand manual lookups with up to three focused queries per search tool. It is off by default. Basic input preparation for manually selected tools always uses the conversation, even with Smart tools off, so follow-up questions and natural phrasing can become valid tool inputs. Automatic selection includes Smart tools in its shared planning step.

The planner receives recent user and assistant messages up to the configured history limit, bounded to 24 messages and 32,000 characters. Tool context is supplied with the latest user message for the final answer, rather than attached to earlier questions. Messages remain in the active chat without requiring cookies; opt-in storage and JSON export/import still control persistence across sessions. Starting a new chat starts new conversation context.

Weather and currency use one canonical input. Currency input validation preserves the amount and codes when the user supplied an explicit currency pair. GitHub prepares repository, issue, filename or file-reading queries from natural phrasing. Research preserves DOIs and extracts available paper text. Wikipedia searches use its configured language. For example, an Estonian Wikipedia question such as `millal oli eestis laulev revolutsioon` can produce `laulev revolutsioon`, `eesti`, and `eesti iseseisvuse taastamine`. Tool results become reference context for an answer to the original question, with source links.

The planner retries an invalid or incomplete plan once with feedback. A tool that returns no useful results or fails gets one query-repair step and a bounded lookup retry. Remaining required failures stop the request; optional failures appear as status warnings. If planning remains unavailable, manually selected tools try the original request; automatic selection reports the failure rather than silently reverting to English keyword matching. No planning attempt is stored as a chat message. Cancellation stops planning, repair and lookups.

Image generation uses the previous text provider to refine the image prompt before submitting it to Stable Horde. Planning and retries add model requests, latency and potential provider usage or queue time. Plans accept bounded strings for listed tools only; the model cannot supply arbitrary endpoints or executable code. New context tools participate through `run(query, cancelled)`; `planningHint` describes accepted input, and optional `validateQuery(query, original)` rejects invalid plans before execution.

## Adding tools

Runtime code uses classic scripts, ES5 syntax, XMLHttpRequest, FileReader, and Promises supported by iOS 12 WebKit. It does not require modules, fetch, async functions, optional chaining, or a JavaScript framework. The browser cannot enumerate a static hosting directory, so a small Python script discovers all tool `.js` files and writes the checked-in loader manifest:

```sh
python3 - <<'PYTOOLS'
import json
from pathlib import Path
files = sorted(p.name for p in Path("tools").glob("*.js")
               if p.name not in ("registry.js", "manifest.js"))
Path("tools/manifest.js").write_text(
    "window.TibUIToolFiles = " + json.dumps(files, indent=2) + ";\n")
PYTOOLS
```

Add a file under `tools/`, register it, and regenerate the manifest. No changes to `app.js` or `index.html` are needed. Files load sequentially; registry and manifest files are excluded from discovery. Register a uniquely named tool using this contract:

```js
(function (window) {
  "use strict";
  var options;
  window.TibUITools.register("example", {
    name: "Example",
    group: "Utilities",
    planningHint: "Return concise topic keywords accepted by this search API.",
    activeKey: "exampleToolActive",
    contextTool: true,
    init: function (context) {
      options = context;
    },
    isActive: function () {
      return (
        options.state.exampleToolActive &&
        options.state.provider !== "hordeImage"
      );
    },
    run: function (prompt) {
      return options.requestJson(
        "GET",
        "https://your-api.example/search?q=" + encodeURIComponent(prompt),
        null,
        null
      );
    },
    formatContext: function (data) {
      return String(data.text || "");
    }
  });
})(window);
```

`planningHint` is optional tool-local guidance for Smart tools; without it the registry asks for concise search keywords. The AI selects available tools using their name and guidance, without a keyword matcher. The shared planner returns `{ "tools": { "example": { "queries": ["topic keywords"] } } }`, validates and deduplicates queries, and executes each through `run(query, cancelled)` without changes to `app.js`. Mark a tool `required: true` when it needs one exact operation and failure must stop the request. `generationTool: true` tools receive one refined generation prompt.

`run` returns a Promise; optional `results` rows contain `title`, `url`, and `content` for source display. Optional `shouldRun(prompt)` filters execution, `enabledKey` connects a Settings availability preference, `required` makes a lookup failure stop the request, and `setActive(value)` handles special switches such as image generation. Shared helpers include state, DOM lookup, request handling, and saving. An optional `validateQuery(query, original)` validates prepared inputs. Tool context is untrusted reference material and should be labeled accordingly. Keep tool code and APIs compatible with older Safari.

## Project structure

```text
index.html                 Interface and settings
style.css                  Responsive light and dark layouts
app.js                     Providers, chats, and compatibility behavior
chat-files.js              Text attachments and selective JSON chat transfer
code-controls.js           Copy, download, and wrap for code blocks
chat-workspace.js          Chat versions, archives, actions, folders, and context
chat-presets.js            Reusable configurations and favorite presets
horde-models.js            Temporary model-list cache and live model status
tools/registry.js          Generic loader, switches, and execution pipeline
tools/manifest.js          Discovered tool filenames
tools/*.js                 Self-registering tools
icons/                     Local model-company and GitHub SVG marks
```

## Modifying and reusing TibUI code

- When modifying, rebranding, or using code from TibUI, you MUST give credit to [ViirTec](https://viirtec.eu/) and have clearly visible and easily discoverable link to [TibUI GitHub repository](https://github.com/viirtec/TibUI) with the title "This project uses code from ViirTec's TibUI"

- You are only allowed to use code from TibUI for commercial or non-commercial projects and products if you cite and give credit to TibUI and ViirTec as mentioned above.

- All projects that use code from TibUI must be published and served under the **GNU General Public License v3.0** license and must follow the terms and conditions of the license

## Credits

- [ch.at](https://ch.at) for credential-less GPT-4o-compatible chat access
- [AI Horde / Stable Horde](https://aihorde.net) for community text and image generation
- [Pollinations.AI](https://pollinations.ai) for the anonymous legacy text API
- [SearXNG](https://docs.searxng.org) for self-hostable metasearch
- [Open-Meteo](https://open-meteo.com) for keyless weather and geocoding
- [Wikipedia](https://www.wikipedia.org) for article lookup
- [GitHub REST API](https://docs.github.com/en/rest) for public repository lookup
- [Frankfurter](https://frankfurter.dev) for daily reference exchange rates
- [Crossref](https://www.crossref.org) for scholarly metadata and DOI lookup
- [Europe PMC](https://europepmc.org) for accessible abstracts and open-access article text
- [Simple Icons](https://simpleicons.org) for company and GitHub marks
- [TibUI source on GitHub](https://github.com/viirtec/TibUI)
