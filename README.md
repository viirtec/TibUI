# TibUI

TibUI is a tiny, dependency-free frontend for AI APIs. It is plain HTML, CSS, and JavaScript and can be hosted by any static web server.

## Providers

- **ch.at** — credential-less chat shown as `GPT-4o`
- **Pollinations** — using the Pollinations legacy keyless text endpoint, with its anonymous model list loaded at runtime
- **Stable Horde / AI Horde** — keyless image generation on volunteer workers, with selectable live models, worker/ETA figures, and optional safety filtering
- **Ollama** — local or network Ollama through `/api/chat`
- **OpenAI compatible** — a configurable Chat Completions base URL, model, and optional bearer key

Pollinations' newer unified generation API requires authentication; TibUI uses its currently available legacy anonymous endpoint for the keyless option. Stable Horde uses AI Horde's official anonymous key and therefore receives the lowest queue priority.

## Run locally

No build step is needed. Serve this folder instead of opening the file directly so cookies and browser security rules behave consistently:

```sh
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`.

For Ollama, the default URL is `http://localhost:11434`. If TibUI is hosted on another domain or device, add that origin to `OLLAMA_ORIGINS` and restart Ollama.

## Privacy

- There are no user accounts. Sessions start anonymous and are not persisted.
- Chat saving is opt-in under **Settings → Privacy**.
- When enabled, chats and non-secret settings use a first-party cookie. Cookie space is small, so older content is removed when needed.
- API keys stay only in page memory and are never stored.
- Requests go directly from the browser to the selected provider.

## Browser support

The client has no framework, dependencies, modules, build tools, streaming APIs, or recent JavaScript syntax. It uses browser features available in iOS Safari 12 and current desktop/mobile browsers.

## Static hosting

Upload `index.html`, `style.css`, and `app.js` together. No backend, database, package installation, or build command is required.

## Limitations

- Free services and model availability (external public APIs, local hosting not affected) can change as TibUI is an frontend client for AI APIs and cannot run models in the user's browser.

- Public models have limited knowledge and no live web search. Public keyless AI API providers don't have web search enabled for models and have models with knowledge cutoff from between 2023 and 2025