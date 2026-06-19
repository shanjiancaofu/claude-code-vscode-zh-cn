import assert from "node:assert/strict";
import test from "node:test";
import { createFakeExtension, cleanupFakeExtension } from "./helpers";
import { detectLatestExtension, inspectExtension } from "../src/core/detector";

test("detector accepts only a valid Anthropic Claude Code directory", async () => {
  const fixture = await createFakeExtension();
  try {
    const inspected = await inspectExtension(fixture.root);
    assert.equal(inspected?.version, "2.1.183");
    assert.equal((await detectLatestExtension(fixture.root)).path, fixture.root);
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});
