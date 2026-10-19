# Baloney Detector

A free, lightweight app that teaches Carl Sagan's Baloney Detection Kit as a skill you can practice and keep, even without technology.

It is a discussion piece, not a grader. Paste in some text, guess what's fishy first, then see what the detector flags, why each pattern deserves a closer look, what usually travels with it, and what to check in the original source.

## How it works

- Runs entirely in the browser. No server, no paid APIs, no accounts.
- `js/flags.js` holds the knowledge: each warning sign, its trigger phrases, the lesson and the questions to ask.
- `js/scan.js` checks text against those flags.
- Rules catch the style of baloney, not the substance, so results say "worth a closer look", never "this is false".

## Run the tests

Requires Node.js 18 or newer.

```sh
npm test
```

## Roadmap

1. Engine: flags and scanner (done)
2. Screen: text box, guess-first step, results with lessons (done)
3. Installable on phones and works offline (PWA on GitHub Pages)
4. Fun layer: bologna-slice mascot and the red-ring baloney meter
5. Practice mode with sample passages

The earlier OpenAI-based version is kept on the `archive/openai-version` branch.
