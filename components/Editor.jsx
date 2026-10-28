"use client";

import { useEffect, useRef, useState } from "react";
import { EXPORT_SIZE, encodeImage, renderArt } from "../render.mjs";
import { flower } from "./example.mjs";

const fonts = {
  courier: '"Courier New", Courier, monospace',
  plex: '"IBM Plex Mono", monospace',
  space: '"Space Mono", monospace',
};

const shapes = {
  square: { label: "Square · 1:1", sizes: [512, 1024, 2048, EXPORT_SIZE].map(size => [size, size]) },
  banner: { label: "Banner · 3:1", sizes: [[600, 200], [1200, 400], [2400, 800], [3840, 1280]] },
  phone: { label: "Phone wallpaper · 9:16", sizes: [[720, 1280], [1080, 1920], [1440, 2560], [2160, 3840]] },
  desktop: { label: "Desktop wallpaper · 16:9", sizes: [[1280, 720], [1920, 1080], [2560, 1440], [3840, 2160]] },
  profile: { label: "Discord profile · 17:6", sizes: [[680, 240], [1360, 480], [2720, 960], [4080, 1440]] },
  server: { label: "Discord server · 16:9", sizes: [[960, 540], [1920, 1080], [2880, 1620], [3840, 2160]] },
};

export default function Editor() {
  const [text, setText] = useState(flower);
  const [font, setFont] = useState("courier");
  const [background, setBackground] = useState("dark");
  const [padding, setPadding] = useState(8);
  const [format, setFormat] = useState("png");
  const [shape, setShape] = useState("square");
  const [sizeIndex, setSizeIndex] = useState(3);
  const [rendered, setRendered] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [exporting, setExporting] = useState(false);
  const preview = useRef(null);
  const exportLock = useRef(false);
  const [width, height] = shapes[shape].sizes[sizeIndex];
  const [previewWidth, previewHeight] = shapes[shape].sizes[1];
  const options = { text, font: fonts[font], background, padding };
  const renderKey = JSON.stringify(options);
  const ready = rendered?.key === renderKey && rendered?.shape === shape && !error;
  const label = format.toUpperCase();

  useEffect(() => {
    let cancelled = false;
    setError("");
    setFeedback("");
    const selected = JSON.parse(renderKey);
    async function update() {
      try {
        await document.fonts.load(`100px ${selected.font}`);
        if (cancelled) return;
        const layout = renderArt(preview.current, selected);
        setRendered({ key: renderKey, shape, columns: Math.max(...layout.lines.map(line => line.length)), lines: layout.lines.length });
      } catch (failure) {
        if (cancelled) return;
        preview.current.getContext("2d")?.clearRect(0, 0, preview.current.width, preview.current.height);
        setRendered(null);
        setError(failure.message);
      }
    }
    update();
    return () => { cancelled = true; };
  }, [renderKey, shape]);

  async function download() {
    if (!ready || exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    setFeedback(`Creating your ${label}…`);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    try {
      renderArt(canvas, options);
      const blob = await encodeImage(canvas, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ascii-art-${width}x${height}.${format}`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback(`Your ${width} × ${height} ${label} is ready.`);
    } catch (failure) {
      setFeedback(failure.message);
    } finally {
      canvas.width = canvas.height = 0;
      exportLock.current = false;
      setExporting(false);
    }
  }

  function changeFormat(event) {
    const next = event.target.value;
    setFormat(next);
    setFeedback("");
    if (next === "jpeg" && background === "transparent") setBackground("light");
  }

  return (
    <div className="workspace">
      <section className="source" aria-labelledby="source-heading">
        <div className="panel-heading">
          <h2 id="source-heading"><label htmlFor="art">ASCII art</label></h2>
          <button
            type="button"
            className="reset-button"
            onClick={() => setText(flower)}
            aria-label="Reset art to flower"
            title="Reset art to flower"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9c-2.5 0-4.9 1-6.7 2.7L3 8M3 3v5h5" />
            </svg>
          </button>
        </div>
        <textarea
          id="art"
          value={text}
          onChange={event => setText(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          maxLength={50000}
          aria-describedby="source-note"
          placeholder="Paste your ASCII art here…"
          style={{ fontFamily: fonts[font] }}
        />
        <div className="panel-note">
          <span id="source-note">Spaces &amp; line breaks stay intact.</span>
          <output id="stats" aria-label="Art dimensions">
            {ready ? `${rendered.columns} cols · ${rendered.lines} lines` : ""}
          </output>
        </div>
        <div className="controls">
          <label htmlFor="font">Typeface
            <select id="font" value={font} onChange={event => setFont(event.target.value)}>
              <option value="courier">Courier</option>
              <option value="plex">IBM Plex Mono</option>
              <option value="space">Space Mono</option>
            </select>
          </label>
          <fieldset>
            <legend>Background</legend>
            <div className="swatches">
              {[["dark", "Black"], ["light", "White"], ["transparent", "Transparent"]].map(([value, name]) => (
                <input
                  key={value}
                  type="radio"
                  name="background"
                  value={value}
                  aria-label={name}
                  title={value === "transparent" && format === "jpeg" ? "Choose PNG or WebP for transparency" : name}
                  checked={background === value}
                  disabled={value === "transparent" && format === "jpeg"}
                  onChange={() => setBackground(value)}
                />
              ))}
            </div>
          </fieldset>
          <label className="margin-label" htmlFor="padding">
            Margin <output id="padding-value">{padding}%</output>
            <input type="range" id="padding" min="0" max="24" value={padding} onChange={event => setPadding(Number(event.target.value))} />
          </label>
        </div>
      </section>

      <section className="result" aria-labelledby="preview-heading">
        <div className="panel-heading">
          <h2 id="preview-heading">Preview</h2>
          <select
            id="resolution"
            value={sizeIndex}
            onChange={event => {
              setSizeIndex(Number(event.target.value));
              setFeedback("");
            }}
            aria-label="Export resolution"
            title="Export resolution"
          >
            {shapes[shape].sizes.map(([width, height], index) => (
              <option key={index} value={index}>{width} × {height}</option>
            ))}
          </select>
        </div>
        <div className="canvas-wrap" style={{ aspectRatio: `${previewWidth} / ${previewHeight}` }}>
          <canvas ref={preview} id="preview" width={previewWidth} height={previewHeight} role="img" aria-label="Live preview of your ASCII art" />
        </div>
        <label className="shape-control" htmlFor="shape">Canvas
          <select id="shape" value={shape} onChange={event => setShape(event.target.value)}>
            {Object.entries(shapes).map(([value, preset]) => (
              <option key={value} value={value}>{preset.label}</option>
            ))}
          </select>
        </label>
        <div className="download-controls">
          <button id="download" type="button" onClick={download} disabled={!ready || exporting}>
            {exporting ? "Creating image…" : `Download ${label}`}
          </button>
          <select id="format" value={format} onChange={changeFormat} aria-label="Download file type">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <p id="status" role="status" aria-live="polite">{error || feedback}</p>
      </section>
    </div>
  );
}
