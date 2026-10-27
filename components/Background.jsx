"use client";

import GradientASCII from "./react-bits/GradientASCII";

const colors = ["#161616", "#666666", "#aaaaaa", "#e0e0e0"];

export default function Background() {
  return (
    <div className="ascii-background" aria-hidden="true">
      <GradientASCII
        colors={colors}
        shape="horizon"
        cellSize={16}
        glyphOpacity={0.7}
        gradientOpacity={0}
        glow={0}
        grain={0}
        flicker={0.05}
        flow={0.2}
        speed={0.3}
        mouseInteraction={false}
        clickEffect="none"
        dpr={1}
        fontFamily={'"IBM Plex Mono", monospace'}
      />
    </div>
  );
}
