"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Scan, Plus } from "lucide-react";

const A4_WIDTH_PX = 210 * (96 / 25.4);

export function calculatePreviewScale(containerWidth: number, zoom = 1, pageWidth = A4_WIDTH_PX) {
  const fit = Math.min(1, Math.max(0.2, (containerWidth - 24) / pageWidth));
  return fit * Math.min(1.5, Math.max(0.75, zoom));
}

export function ScaledPreview({
  children,
  label,
  transitionKey
}: {
  children: React.ReactNode;
  label: string;
  transitionKey: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(A4_WIDTH_PX);
  const [contentHeight, setContentHeight] = useState(0);
  const [zoom, setZoom] = useState(1);
  const scale = calculatePreviewScale(containerWidth, zoom);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const containerObserver = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    const contentObserver = new ResizeObserver(([entry]) => setContentHeight(entry.contentRect.height));
    containerObserver.observe(container);
    contentObserver.observe(content);
    return () => {
      containerObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);

  return (
    <section className="scaled-preview" aria-label={label}>
      <div className="scaled-preview-toolbar" aria-label="Preview zoom controls">
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={zoom <= 0.75}
          onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))}
        >
          <Minus aria-hidden="true" />
        </button>
        <output aria-label="Preview zoom">{Math.round(zoom * 100)}%</output>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={zoom >= 1.5}
          onClick={() => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))}
        >
          <Plus aria-hidden="true" />
        </button>
        <button type="button" aria-label="Fit preview" title="Fit preview" onClick={() => setZoom(1)}>
          <Scan aria-hidden="true" />
          Fit
        </button>
      </div>
      <div className="scaled-preview-viewport" ref={containerRef} tabIndex={0} aria-label={`${label} scroll area`}>
        <div
          className="scaled-preview-spacer"
          style={{ width: A4_WIDTH_PX * scale, height: contentHeight * scale }}
        >
          <div
            className="scaled-preview-content"
            ref={contentRef}
            style={{ transform: `scale(${scale})`, width: A4_WIDTH_PX }}
          >
            <div className="preview-swap" key={transitionKey}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
