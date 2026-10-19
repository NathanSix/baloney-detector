// The scanner: checks a piece of text against every flag.
// It only spots wording. It can't judge whether a claim is true,
// so results are framed as "worth a closer look", never as a verdict.

import { flags } from "./flags.js";

export function scan(text) {
  const results = [];
  for (const flag of flags) {
    for (const pattern of flag.patterns) {
      const match = text.match(pattern);
      if (match) {
        results.push({ flag, phrase: match[0], index: match.index });
        break; // one hit per flag is enough
      }
    }
  }
  // Show results in the order they appear in the text
  return results.sort((a, b) => a.index - b.index);
}
