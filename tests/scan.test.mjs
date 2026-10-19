// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { scan } from "../js/scan.js";

const ids = (text) => scan(text).map((r) => r.flag.id);

test("catches cover-up language with curly apostrophes", () => {
  assert.deepEqual(ids("They don’t want you to know about this."), ["cover-up"]);
});

test("catches each starter flag", () => {
  assert.ok(ids("Experts say this works.").includes("vague-authority"));
  assert.ok(ids("A miracle supplement!").includes("miracle"));
  assert.ok(ids("Ever since I started, I feel great.").includes("cause-leap"));
  assert.ok(ids("Only sheeple believe that.").includes("name-calling"));
});

test("finds several flags in order of appearance", () => {
  const text =
    "Studies show this miracle cure works, but they don't want you to know. Wake up, sheeple!";
  assert.deepEqual(ids(text), ["vague-authority", "miracle", "cover-up", "name-calling"]);
});

test("plain factual text raises nothing", () => {
  assert.deepEqual(
    ids("The city council voted 7 to 2 on Tuesday to extend library hours through spring."),
    []
  );
});
