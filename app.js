import { EXPORT_SIZE, encodeImage, renderArt } from "./render.mjs";

const art = document.querySelector("#art");
const font = document.querySelector("#font");
const background = document.querySelector("#background");
const padding = document.querySelector("#padding");
const preview = document.querySelector("#preview");
const download = document.querySelector("#download");
const format = document.querySelector("#format");
const status = document.querySelector("#status");
const fonts = {
    courier: '"Courier New", Courier, monospace',
    plex: '"IBM Plex Mono", monospace',
    space: '"Space Mono", monospace',
};

const flower = art.defaultValue;
let revision = 0;
let ready = false;
let exporting = false;

function options() {
    return { text: art.value, font: fonts[font.value], background: background.querySelector(":checked").value, padding: Number(padding.value) };
}

async function update() {
    const current = ++revision;
    ready = false;
    download.disabled = true;
    status.textContent = "";
    background.querySelector('[value="transparent"]').disabled = format.value === "jpeg";
    if (format.value === "jpeg" && background.querySelector('[value="transparent"]').checked) background.querySelector('[value="light"]').checked = true;
    download.textContent = `Download ${format.selectedOptions[0].text}`;
    document.querySelector("#export-info").textContent = `4096 × 4096 · ${format.selectedOptions[0].text}`;
    document.querySelector("#padding-value").value = `${padding.value}%`;
    art.style.fontFamily = fonts[font.value];
    const selected = options();

    try {
        await document.fonts.load(`100px ${selected.font}`);
        if (current !== revision) return;
        const layout = renderArt(preview, selected);
        document.querySelector("#stats").value = `${Math.max(...layout.lines.map(line => line.length))} cols · ${layout.lines.length} lines`;
        ready = true;
        download.disabled = exporting;
    } catch (error) {
        if (current !== revision) return;
        preview.getContext("2d")?.clearRect(0, 0, preview.width, preview.height);
        document.querySelector("#stats").value = "";
        status.textContent = error.message;
    }
}

for (const control of [art, font, background, padding, format]) control.addEventListener("input", update);
document.querySelector("#example").addEventListener("click", () => {
    art.value = flower;
    update();
});

download.addEventListener("click", async () => {
    if (!ready || exporting) return;
    exporting = true;
    download.disabled = true;
    const selectedFormat = format.value;
    const label = format.selectedOptions[0].text;
    status.textContent = `Creating your ${label}…`;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = EXPORT_SIZE;

    try {
        renderArt(canvas, options());
        const blob = await encodeImage(canvas, selectedFormat);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ascii-art-4096.${selectedFormat}`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = `Your 4096 × 4096 ${label} is ready.`;
    } catch (error) {
        status.textContent = error.message;
    } finally {
        canvas.width = canvas.height = 0;
        exporting = false;
        download.disabled = !ready;
    }
});

update();
