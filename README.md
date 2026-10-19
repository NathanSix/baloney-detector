# Baloney Detector

A critical-thinking workbench for text, URLs, documents, images, and the speech in video/audio recordings. Findings explain the exact passage, why the reasoning is problematic, how to spot the pattern, a charitable interpretation, and a better question.

## Current status

- Interface, teaching example, URL handling, report downloads, and ChatGPT request handoff are implemented.
- Live analysis requires a server-side OpenAI API key. No key is included or has been created for this project.
- Ten automated tests cover URL normalization, validation, missing configuration, cross-origin rejection, and mocked provider requests/errors. Mocked tests do not establish live model accuracy or access.
- This export uses standard Next.js, not the ChatGPT Sites runtime.

## Run on your computer

Requires Node.js 22.18 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. You can inspect the interface and use the example without a key. A missing connection is explained when submitting your own source.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## GitHub and website hosting

Create a repository named `baloney-detector`, then add this folder's contents at its root. Do not upload `node_modules`, `.next`, or secret environment files.

GitHub stores the code. The full application must run on a Node-capable host; GitHub Pages alone cannot execute the `/api/analyze` backend. This is not a static-export application. A host that supports Next.js can build with `npm run build` and start with `npm start`. A Dockerfile is included for Node/container hosts.

Server environment variable names are documented in `.env.example`. Keep credentials server-side. `OPENAI_API_KEY` powers analysis and speech transcription; `OPENAI_MODEL` defaults to `gpt-5.5`. Configure `APP_PASSWORD` before enabling live analysis on a production server. Production refuses live access if the key is set without this password. The browser prompts for basic authentication; use any username and the configured password. Use HTTPS when deployed.

The secure API-key setup still needs to be completed. Never place a key in a GitHub file, public environment variable, browser code, or a chat message.

Hosting providers may impose smaller upload limits than the app's 20 MB limit. For example, check the chosen provider's request-body and duration limits before deploying large video uploads. A full Node/container host avoids relying on serverless upload allowances. Speech transcription and analysis can take several minutes.

## What was fixed

The old submit button depended on a readiness flag and stayed disabled without a key. Submission now validates the source and displays the server's actual configuration error. It also:

- Accepts public URLs with or without `https://`.
- Recognizes a whole URL pasted into the text field.
- Rejects unsupported schemes, credentials in URLs, local addresses, and malformed links.
- Handles HTML/error responses without a misleading JSON parsing failure.
- Separates document context from the text-entry draft.
- Requires a web retrieval tool call for URL analysis.

## Limits

A fallacy diagnosis is not proof that a conclusion is false. The tool may be wrong or miss issues. Search access does not guarantee that a page or video transcript is accessible; inaccessible sources should return no findings with an explanation. Video analysis covers speech only, not visual claims, charts, or editing. API configuration and live end-to-end analysis have not been verified in this build. Browser testing was unavailable during development.

Submitted material is sent to OpenAI when analysis is enabled. The application does not persist uploads or reports. Download reports to keep them. Third-party processing and logging policies still apply.
