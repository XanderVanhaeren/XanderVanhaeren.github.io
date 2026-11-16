import React, { useEffect, useRef } from 'react';

export interface TopoCanvasProps {
  paused?: boolean;
}

const CONTOUR_LEVELS = 14;
const CELL_SIZE = 10;
const FRAME_INTERVAL_MS = 1000 / 60;

function lerpIso(a: number, b: number, iso: number): number {
  const denom = b - a;
  if (Math.abs(denom) < 1e-6) return 0.5;
  const t = (iso - a) / denom;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function evaluateScalarField(
  nx: number,
  ny: number,
  time: number,
  pointerX: number,
  pointerY: number,
  pointerStrength: number
): number {
  // Primary aerodynamic pressure peak centered in the right-hand hero backdrop
  const dx1 = nx - (0.76 + 0.032 * Math.sin(time * 0.42));
  const dy1 = ny - (0.46 + 0.028 * Math.cos(time * 0.34));
  const peak1 = 0.78 * Math.exp(-(dx1 * dx1 * 6.5 + dy1 * dy1 * 9.0));

  // Secondary ridge
  const dx2 = nx - (0.54 + 0.026 * Math.cos(time * 0.37));
  const dy2 = ny - (0.72 + 0.024 * Math.sin(time * 0.48));
  const peak2 = 0.42 * Math.exp(-(dx2 * dx2 * 9.0 + dy2 * dy2 * 11.0));

  // Subtle upper-left counter-ridge
  const dx3 = nx - (0.88 + 0.022 * Math.sin(time * 0.51 + 1.2));
  const dy3 = ny - (0.22 + 0.024 * Math.cos(time * 0.39 + 0.7));
  const peak3 = 0.34 * Math.exp(-(dx3 * dx3 * 12.0 + dy3 * dy3 * 12.0));

  // Time-varying harmonic isobar wave
  const wave =
    0.105 * Math.sin(nx * 7.2 + time * 0.85) * Math.cos(ny * 5.8 - time * 0.62) +
    0.055 * Math.cos((nx + ny) * 9.5 - time * 0.54);

  // Pointer-reactive Gaussian ridge
  let pointerRidge = 0;
  if (pointerStrength > 0.001) {
    const pdx = nx - pointerX;
    const pdy = ny - pointerY;
    pointerRidge =
      0.34 * pointerStrength * Math.exp(-(pdx * pdx * 18.0 + pdy * pdy * 18.0));
  }

  return peak1 + peak2 + peak3 + wave + pointerRidge;
}

export function drawMarchingSquaresContours(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  pointerX: number,
  pointerY: number,
  pointerStrength: number,
  isLightTheme = false
): void {
  if (width <= 0 || height <= 0) return;

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cols = Math.max(2, Math.ceil(width / CELL_SIZE) + 1);
  const rows = Math.max(2, Math.ceil(height / CELL_SIZE) + 1);
  const dx = width / (cols - 1);
  const dy = height / (rows - 1);

  const field = new Float32Array(cols * rows);
  for (let row = 0; row < rows; row++) {
    const ny = row / (rows - 1);
    for (let col = 0; col < cols; col++) {
      const nx = col / (cols - 1);
      field[row * cols + col] = evaluateScalarField(
        nx,
        ny,
        time,
        pointerX,
        pointerY,
        pointerStrength
      );
    }
  }

  const minIso = 0.08;
  const maxIso = 0.86;

  for (let levelIdx = 0; levelIdx < CONTOUR_LEVELS; levelIdx++) {
    const iso =
      minIso + (levelIdx / (CONTOUR_LEVELS - 1)) * (maxIso - minIso);
    const isMajor = levelIdx % 4 === 0;
    const alpha = isLightTheme
      ? isMajor
        ? 0.36
        : 0.16 + (levelIdx / CONTOUR_LEVELS) * 0.12
      : isMajor
        ? 0.34
        : 0.16 + (levelIdx / CONTOUR_LEVELS) * 0.12;
    const strokeRgb = isLightTheme ? '24, 111, 179' : '94, 176, 236';

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${strokeRgb}, ${alpha.toFixed(3)})`;
    ctx.lineWidth = isMajor ? 1.25 : 0.85;

    for (let row = 0; row < rows - 1; row++) {
      const y0 = row * dy;
      const y1 = y0 + dy;
      const rowOffset = row * cols;
      const nextRowOffset = (row + 1) * cols;

      for (let col = 0; col < cols - 1; col++) {
        const v0 = field[rowOffset + col]; // top-left
        const v1 = field[rowOffset + col + 1]; // top-right
        const v2 = field[nextRowOffset + col + 1]; // bottom-right
        const v3 = field[nextRowOffset + col]; // bottom-left

        const caseIndex =
          (v0 >= iso ? 8 : 0) |
          (v1 >= iso ? 4 : 0) |
          (v2 >= iso ? 2 : 0) |
          (v3 >= iso ? 1 : 0);

        if (caseIndex === 0 || caseIndex === 15) continue;

        const x0 = col * dx;
        const x1 = x0 + dx;

        // Edge midpoints interpolated along cell perimeter:
        // 0: top (v0 -> v1), 1: right (v1 -> v2), 2: bottom (v3 -> v2), 3: left (v0 -> v3)
        const topX = x0 + lerpIso(v0, v1, iso) * dx;
        const rightY = y0 + lerpIso(v1, v2, iso) * dy;
        const bottomX = x0 + lerpIso(v3, v2, iso) * dx;
        const leftY = y0 + lerpIso(v0, v3, iso) * dy;

        const drawSeg = (ax: number, ay: number, bx: number, by: number) => {
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        };

        switch (caseIndex) {
          case 1:
          case 14:
            drawSeg(x0, leftY, bottomX, y1);
            break;
          case 2:
          case 13:
            drawSeg(bottomX, y1, x1, rightY);
            break;
          case 3:
          case 12:
            drawSeg(x0, leftY, x1, rightY);
            break;
          case 4:
          case 11:
            drawSeg(topX, y0, x1, rightY);
            break;
          case 5: {
            const center = (v0 + v1 + v2 + v3) * 0.25;
            if (center >= iso) {
              drawSeg(x0, leftY, topX, y0);
              drawSeg(bottomX, y1, x1, rightY);
            } else {
              drawSeg(x0, leftY, bottomX, y1);
              drawSeg(topX, y0, x1, rightY);
            }
            break;
          }
          case 6:
          case 9:
            drawSeg(topX, y0, bottomX, y1);
            break;
          case 7:
          case 8:
            drawSeg(x0, leftY, topX, y0);
            break;
          case 10: {
            const center = (v0 + v1 + v2 + v3) * 0.25;
            if (center >= iso) {
              drawSeg(x0, leftY, bottomX, y1);
              drawSeg(topX, y0, x1, rightY);
            } else {
              drawSeg(x0, leftY, topX, y0);
              drawSeg(bottomX, y1, x1, rightY);
            }
            break;
          }
          default:
            break;
        }
      }
    }

    ctx.stroke();
  }
}

export function TopoCanvas({ paused = false }: TopoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isIntersecting = true;
    let reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 800;
    let height = 500;
    let time = 0;
    let lastTimestamp = 0;

    const pointer = {
      targetX: 0.76,
      targetY: 0.46,
      x: 0.76,
      y: 0.46,
      targetStrength: 0,
      strength: 0,
    };

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width > 0 ? rect.width : 800;
      height = rect.height > 0 ? rect.height : 500;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const renderFrame = () => {
      drawMarchingSquaresContours(
        ctx,
        width,
        height,
        time,
        pointer.x,
        pointer.y,
        pointer.strength
      );
    };

    const shouldAnimate = () =>
      !pausedRef.current && isIntersecting && !reducedMotion;

    const tick = (timestamp: number) => {
      if (!shouldAnimate()) {
        animationFrameId = null;
        return;
      }

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= FRAME_INTERVAL_MS) {
        const dt = Math.min(elapsed / 1000, 0.05);
        lastTimestamp = timestamp;
        time += dt;

        pointer.x += (pointer.targetX - pointer.x) * 0.16;
        pointer.y += (pointer.targetY - pointer.y) * 0.16;
        pointer.strength += (pointer.targetStrength - pointer.strength) * 0.16;

        renderFrame();
      }
      animationFrameId = window.requestAnimationFrame(tick);
    };

    const startLoopIfAllowed = () => {
      if (shouldAnimate() && animationFrameId === null) {
        lastTimestamp = 0;
        animationFrameId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    updateSize();
    renderFrame();
    startLoopIfAllowed();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : width;
      const h = rect.height > 0 ? rect.height : height;
      const relX = (event.clientX - rect.left) / w;
      const relY = (event.clientY - rect.top) / h;

      if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
        pointer.targetX = relX;
        pointer.targetY = relY;
        pointer.targetStrength = 1;
        if (!shouldAnimate()) {
          pointer.x = relX;
          pointer.y = relY;
          pointer.strength = 1;
          renderFrame();
        }
      } else {
        pointer.targetStrength = 0;
      }
    };

    const handlePointerLeave = () => {
      pointer.targetStrength = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    });

    const handleResize = () => {
      updateSize();
      renderFrame();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
        renderFrame();
      });
      resizeObserver.observe(canvas);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoopIfAllowed();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.01 }
      );
      intersectionObserver.observe(canvas);
    }

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const handleMediaChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        stopLoop();
        renderFrame();
      } else {
        startLoopIfAllowed();
      }
    };

    mediaQuery?.addEventListener?.('change', handleMediaChange);

    let themeObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      themeObserver = new MutationObserver(() => {
        renderFrame();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    return () => {
      stopLoop();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
      mediaQuery?.removeEventListener?.('change', handleMediaChange);
    };
  }, [paused]);

  return <canvas ref={canvasRef} id="topo-canvas" className="topo-canvas" aria-hidden="true" />;
}
