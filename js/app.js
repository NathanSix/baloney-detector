// The screen: paste, make your call, then reveal.
import { flags } from "./flags.js";
import { scan } from "./scan.js";
import { examples } from "./examples.js";

const $ = (id) => document.getElementById(id);
const steps = { paste: $("step-paste"), guess: $("step-guess"), reveal: $("step-reveal") };
let exampleIndex = 0;

function show(name) {
  for (const [key, el] of Object.entries(steps)) el.hidden = key !== name;
  steps[name].scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setError(el, message) {
  el.textContent = message;
  el.hidden = !message;
}

// Wrap each flagged phrase in a <mark>, safely.
function markText(text, results) {
  const spans = results
    .map((r) => ({ start: r.index, end: r.index + r.phrase.length }))
    .sort((a, b) => a.start - b.start);
  let html = "";
  let pos = 0;
  for (const s of spans) {
    if (s.start < pos) continue; // skip overlaps
    html += escapeHtml(text.slice(pos, s.start)) + "<mark>" + escapeHtml(text.slice(s.start, s.end)) + "</mark>";
    pos = s.end;
  }
  return html + escapeHtml(text.slice(pos));
}

// Step 1: paste
$("use-example").addEventListener("click", () => {
  $("input").value = examples[exampleIndex % examples.length];
  exampleIndex++;
  setError($("paste-error"), "");
});

$("input").addEventListener("input", () => setError($("paste-error"), ""));

$("to-guess").addEventListener("click", () => {
  const text = $("input").value.trim();
  if (text.length < 20) {
    setError($("paste-error"), "Paste at least a sentence or two so there's something to check.");
    return;
  }
  $("guess-text").textContent = text;
  $("guess-chips").replaceChildren(
    ...flags.map((f) => {
      const label = document.createElement("label");
      label.className = "chip";
      label.innerHTML = `<input type="checkbox" value="${f.id}"><span>${escapeHtml(f.name)}</span>`;
      return label;
    }),
    (() => {
      const label = document.createElement("label");
      label.className = "chip";
      label.innerHTML = `<input type="checkbox" value="none"><span>Nothing looks off</span>`;
      return label;
    })()
  );
  setError($("guess-error"), "");
  show("guess");
});

// "Nothing looks off" and the flags can't both be picked
$("guess-chips").addEventListener("change", (e) => {
  const boxes = [...$("guess-chips").querySelectorAll("input")];
  if (e.target.value === "none" && e.target.checked) {
    boxes.forEach((b) => { if (b.value !== "none") b.checked = false; });
  } else if (e.target.checked) {
    boxes.find((b) => b.value === "none").checked = false;
  }
  setError($("guess-error"), "");
});

$("back-to-paste").addEventListener("click", () => show("paste"));

// Step 3: reveal
$("to-reveal").addEventListener("click", () => {
  const picked = [...$("guess-chips").querySelectorAll("input:checked")].map((b) => b.value);
  if (picked.length === 0) {
    setError($("guess-error"), "Make a call first, even if it's \"nothing looks off\". Guessing is the practice.");
    return;
  }
  const text = $("input").value.trim();
  const results = scan(text);
  const foundIds = results.map((r) => r.flag.id);
  const guessedIds = picked.filter((id) => id !== "none");

  $("marked-text").innerHTML = markText(text, results);

  const spotted = foundIds.filter((id) => guessedIds.includes(id)).length;
  if (results.length === 0) {
    $("score").textContent = guessedIds.length
      ? "The detector found no telltale wording. That doesn't mean you're wrong. Your hunches are below."
      : "The detector found no telltale wording, and you agreed. Still check the questions at the bottom.";
  } else {
    $("score").textContent = `You spotted ${spotted} of ${results.length} warning sign${results.length === 1 ? "" : "s"} the detector found.`;
  }

  const cards = results.map(({ flag, phrase }) => {
    const got = guessedIds.includes(flag.id);
    return `
      <article class="finding">
        <h3>${escapeHtml(flag.name)} <span class="badge ${got ? "spotted" : "missed"}">${got ? "You spotted this" : "You missed this"}</span></h3>
        <p class="phrase">"${escapeHtml(phrase)}"</p>
        <p>${escapeHtml(flag.lesson)}</p>
        <dl>
          <dt>From Sagan's kit</dt><dd>${escapeHtml(flag.kitTool)}</dd>
          <dt>Often comes with</dt><dd>${escapeHtml(flag.alsoLookFor)}</dd>
          <dt>Ask the source</dt><dd>${escapeHtml(flag.ask)}</dd>
        </dl>
      </article>`;
  });

  // Guesses the detector didn't confirm: treat them as hunches worth checking, not mistakes
  const hunches = flags
    .filter((f) => guessedIds.includes(f.id) && !foundIds.includes(f.id))
    .map((f) => `
      <article class="finding">
        <h3>${escapeHtml(f.name)} <span class="badge hunch">Your hunch</span></h3>
        <p>The detector didn't find the usual wording for this, but it only knows a few phrases. If you sensed it, look for it yourself.</p>
        <dl><dt>Ask the source</dt><dd>${escapeHtml(f.ask)}</dd></dl>
      </article>`);

  $("results").innerHTML = cards.join("") + hunches.join("");
  show("reveal");
});

// Offline support (only works over https or localhost)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

$("start-over").addEventListener("click", () => {
  $("input").value = "";
  show("paste");
  $("input").focus();
});
