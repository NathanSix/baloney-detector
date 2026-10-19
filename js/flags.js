// The Baloney Detector's knowledge lives here, as plain data.
// Each flag is one warning sign from Carl Sagan's Baloney Detection Kit.
// Adding a new flag means adding a new object to this list. No other code changes.
//
// Fields:
//   id          short unique name, used in code
//   name        what the user sees
//   patterns    regular expressions that suggest this flag (case-insensitive)
//   kitTool     the Sagan kit principle this connects to
//   lesson      why this pattern deserves a closer look
//   alsoLookFor the warning sign that often travels with this one
//   ask         a question to take back to the original source

// Matches both straight (') and curly (’) apostrophes, since copied text often has curly ones.
const A = "['’]?";

export const flags = [
  {
    id: "cover-up",
    name: "Cover-up language",
    patterns: [
      new RegExp(`they don${A}t want you to know`, "i"),
      new RegExp(`what (the media|they|doctors|scientists) (won${A}t|don${A}t|aren${A}t going to) tell you`, "i"),
      /(hidden|suppressed|secret|banned) (truth|cure|evidence|study|research)/i,
    ],
    kitTool: "Can the claim be tested, and could it be shown false?",
    lesson:
      "A cover-up story protects a claim from testing. If evidence is missing, it gets blamed on whoever is supposedly hiding it, so nothing could ever count against the claim.",
    alsoLookFor: "A claim that no possible evidence could disprove.",
    ask: "What evidence would change the author's mind? If the answer is nothing, that's the problem.",
  },
  {
    id: "vague-authority",
    name: "Vague authority",
    patterns: [
      /\b(experts|scientists|doctors|researchers) (say|agree|warn|believe|claim)\b/i,
      /\bstudies (show|prove|have shown|suggest)\b/i,
      /\b(research|science) (shows|proves|says)\b/i,
      /\bit(['’]s| is| has been) (been )?(proven|known)\b/i,
    ],
    kitTool: "Arguments from authority carry little weight.",
    lesson:
      "Naming a group instead of a source lets a writer borrow credibility without showing their work. Real findings come with names, dates and links you can check.",
    alsoLookFor: "Weasel words like \"may\", \"could\" or \"linked to\" that make a claim sound stronger than it is.",
    ask: "Which experts, which study? Is it named or linked, and does it actually say this?",
  },
  {
    id: "miracle",
    name: "Miracle language",
    patterns: [
      /\b(miracle|breakthrough|cure[sd]?|guaranteed|instantly|overnight|100% (safe|natural|effective))\b/i,
      /\b(doctors hate|one weird trick|this one simple)\b/i,
    ],
    kitTool: "Extraordinary claims require extraordinary evidence.",
    lesson:
      "Real progress is usually slow and partial. Words that promise total, instant or guaranteed results are a sales tactic, not a description of evidence.",
    alsoLookFor: "Personal stories and testimonials standing in for numbers.",
    ask: "How many people did this work for, compared to what, and who measured it?",
  },
  {
    id: "cause-leap",
    name: "Cause-and-effect leap",
    patterns: [
      /\bever since (i|we|they|she|he)\b/i,
      /\b(that['’]s|this is) (why|what caused)\b/i,
      /\bright after (i|we|they|she|he)\b/i,
    ],
    kitTool: "Correlation does not mean causation.",
    lesson:
      "Two things happening together, or one after the other, doesn't mean one caused the other. Timing alone proves very little.",
    alsoLookFor: "Other explanations that are never mentioned or ruled out.",
    ask: "What else could explain this? Did anyone compare against people who didn't do it?",
  },
  {
    id: "name-calling",
    name: "Name-calling",
    patterns: [
      /\b(sheeple|so-called (experts?|scientists?|doctors?)|shills?|idiots|morons|brainwashed)\b/i,
      /\b(only an idiot|anyone with a brain)\b/i,
    ],
    kitTool: "Attack the argument, not the person.",
    lesson:
      "Insults replace reasons. When a piece mocks the other side instead of answering it, ask what the actual counterargument is.",
    alsoLookFor: "A straw man: a twisted, easy-to-beat version of the other side's view.",
    ask: "What does the other side actually say, in their own words?",
  },
];
