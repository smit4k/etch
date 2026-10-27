import test from "node:test";
import assert from "node:assert/strict";
import { EXPORT_SIZE, encodeImage, measureArt } from "./render.mjs";

const measure = text => ({
    width: text.length * 60,
    actualBoundingBoxLeft: text.startsWith("/") ? 5 : 0,
    actualBoundingBoxRight: text.length * 60,
    actualBoundingBoxAscent: 75,
    actualBoundingBoxDescent: 20,
    fontBoundingBoxAscent: 80,
    fontBoundingBoxDescent: 20,
});

test("keeps indentation, trailing spaces, blank lines, and literal markup", () => {
    const layout = measureArt("  <>&  \r\n\r\n / ", measure);
    assert.deepEqual(layout.lines, ["  <>&  ", "", " / "]);
    assert.equal(layout.width, 420);
    assert.equal(layout.height, 300);
    assert.equal(EXPORT_SIZE, 4096);
});

test("expands tabs to eight-column stops", () => {
    assert.deepEqual(measureArt("a\tb\tc\n\tx", measure).lines, ["a       b       c", "        x"]);
});

test("includes glyph overhang so zero margin does not clip it", () => {
    const layout = measureArt("/", measure);
    assert.equal(layout.left, -5);
    assert.equal(layout.width, 65);
});

test("rejects empty or oversized input", () => {
    assert.throws(() => measureArt(" \n\t", measure), /Paste some ASCII art/);
    assert.throws(() => measureArt("x".repeat(50001), measure), /50,000 characters/);
});

test("exports the requested format at maximum quality", async () => {
    const canvas = { toBlob(callback, type, quality) {
        assert.equal(type, "image/webp");
        assert.equal(quality, 1);
        callback(new Blob(["image"], { type }));
    } };
    assert.equal((await encodeImage(canvas, "webp")).type, "image/webp");
});

test("reports failed encoding and unsupported formats instead of mislabeling a PNG", async () => {
    await assert.rejects(encodeImage({ toBlob: callback => callback(null) }, "png"), /could not be created/);
    const fallback = { toBlob: callback => callback(new Blob(["fallback"], { type: "image/png" })) };
    await assert.rejects(encodeImage(fallback, "webp"), /does not support WEBP/);
});
