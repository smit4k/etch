import test from "node:test";
import assert from "node:assert/strict";
import { EXPORT_SIZE, encodeImage, measureArt, renderArt } from "./render.mjs";

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

test("centers art without stretching or clipping on square and rectangular canvases", () => {
    for (const [width, height] of [[512, 512], [1200, 400], [680, 240], [960, 540], [240, 680], [720, 1280], [1080, 1920], [1440, 2560], [2160, 3840], [1280, 720], [1920, 1080], [2560, 1440], [3840, 2160]]) {
        for (const padding of [0, 8, 24]) {
            for (const background of ["dark", "light", "transparent"]) {
                const translations = [];
                const fills = [];
                let cleared, scale;
                const context = {
                    measureText: measure,
                    clearRect: (...rect) => { cleared = rect; },
                    fillRect: (...rect) => { fills.push(rect); },
                    translate: (...offset) => { translations.push(offset); },
                    scale: (...factors) => { scale = factors; },
                    save() {}, restore() {}, fillText() {},
                };
                const canvas = { width, height, getContext: () => context };
                const layout = renderArt(canvas, { text: "ASCII ART\n  banner", font: "monospace", background, padding });
                assert.deepEqual(cleared, [0, 0, width, height]);
                assert.deepEqual(fills, background === "transparent" ? [] : [[0, 0, width, height]]);
                assert.equal(scale[0], scale[1], "characters keep their proportions");
                const [x, y] = translations[0];
                assert.ok(Math.abs(x + layout.width * scale[0] / 2 - width / 2) < 1e-8);
                assert.ok(Math.abs(y + layout.height * scale[1] / 2 - height / 2) < 1e-8);
                assert.ok(x >= width * padding / 100 - 1e-8, "horizontal margin is preserved");
                assert.ok(y >= height * padding / 100 - 1e-8, "vertical margin is preserved");
                assert.ok(Math.abs(Math.min(x / width, y / height) - padding / 100) < 1e-8, "art fills the available space");
            }
        }
    }
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
