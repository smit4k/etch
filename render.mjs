const FONT_SIZE = 100;
export const EXPORT_SIZE = 4096;

export function encodeImage(canvas, format) {
    const type = `image/${format}`;
    return new Promise((resolve, reject) => canvas.toBlob(blob => {
        if (!blob) reject(new Error("The image could not be created. Please try again."));
        else if (blob.type !== type) reject(new Error(`Your browser does not support ${format.toUpperCase()} export. Please choose another format.`));
        else resolve(blob);
    }, type, 1));
}

export function measureArt(text, measure) {
    if (text.length > 50000) throw new Error("Please keep your art under 50,000 characters.");
    if (!text.trim()) throw new Error("Paste some ASCII art to get started.");

    const lines = text.replace(/\r\n?/g, "\n").split("\n").map(line =>
        line.split("\t").reduce((expanded, part, index) =>
            expanded + (index ? " ".repeat(8 - expanded.length % 8) : "") + part, "")
    );
    const metrics = lines.map(measure);
    const font = measure("Mg");
    const ascent = font.fontBoundingBoxAscent ?? font.actualBoundingBoxAscent;
    const descent = font.fontBoundingBoxDescent ?? font.actualBoundingBoxDescent;
    const baseline = (FONT_SIZE + ascent - descent) / 2;
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = lines.length * FONT_SIZE;

    for (const [index, metric] of metrics.entries()) {
        left = Math.min(left, -metric.actualBoundingBoxLeft);
        right = Math.max(right, metric.width, metric.actualBoundingBoxRight);
        top = Math.min(top, baseline + index * FONT_SIZE - metric.actualBoundingBoxAscent);
        bottom = Math.max(bottom, baseline + index * FONT_SIZE + metric.actualBoundingBoxDescent);
    }

    return { lines, width: right - left, height: bottom - top, left, top, baseline };
}

export function renderArt(canvas, { text, font, background, padding }) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create a canvas. Try another browser.");
    context.font = `${FONT_SIZE}px ${font}`;
    context.fontKerning = "none";
    const layout = measureArt(text, line => context.measureText(line));
    const size = canvas.width;
    const scale = size * (1 - padding / 50) / Math.max(layout.width, layout.height);

    context.clearRect(0, 0, size, size);
    if (background !== "transparent") {
        context.fillStyle = background === "light" ? "#ffffff" : "#000000";
        context.fillRect(0, 0, size, size);
    }
    context.save();
    context.fillStyle = background === "dark" ? "#e0e0e0" : "#000000";
    context.translate((size - layout.width * scale) / 2, (size - layout.height * scale) / 2);
    context.scale(scale, scale);
    context.translate(-layout.left, -layout.top);
    layout.lines.forEach((line, index) => context.fillText(line, 0, layout.baseline + index * FONT_SIZE));
    context.restore();
    return layout;
}
