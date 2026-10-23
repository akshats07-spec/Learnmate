"use client";
import { useEffect, useRef, useState } from "react";

export interface SpatialNode {
  label: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

interface Props {
  nodes?: SpatialNode[];
  title?: string;
  subtitle?: string;
  visualType?: "tech" | "molecule" | "cell" | "optics" | "physics" | "system" | string;
  connections?: Array<[number, number]>;
}

export function Interactive3DCanvas({
  nodes = [],
  title,
  subtitle,
  visualType = "system",
  connections,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rot = useRef({ x: 0.35, y: 0.5 });
  const autoRotate = useRef(true);
  const tickRef = useRef(0);

  // Default spatial nodes if none provided
  const displayNodes: SpatialNode[] =
    nodes.length > 0
      ? nodes
      : [
          { label: "Core Processing Hub", color: "#8b5cf6", x: 0, y: 0, z: 0 },
          { label: "Alpha Domain", color: "#06b6d4", x: -50, y: 35, z: 30 },
          { label: "Beta Domain", color: "#10b981", x: 50, y: -20, z: -30 },
          { label: "Vector Actuator", color: "#f59e0b", x: 0, y: -50, z: 40 },
        ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      tickRef.current += 0.02;

      // Auto-rotation when not dragging
      if (autoRotate.current) {
        rot.current.y += 0.007;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 3D Rotation matrices
      const cosX = Math.cos(rot.current.x);
      const sinX = Math.sin(rot.current.x);
      const cosY = Math.cos(rot.current.y);
      const sinY = Math.sin(rot.current.y);

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = 380;
        const fov = (distance / (distance + z2)) * zoom;
        return {
          px: centerX + x1 * fov,
          py: centerY + y2 * fov,
          scale: fov,
          depth: z2,
        };
      };

      // ─────────────────────────────────────────────────────────────
      // THEMATIC GEOMETRY RENDERING ACCORDING TO visualType
      // ─────────────────────────────────────────────────────────────

      if (visualType === "tech") {
        // --- 1. TECH: Isometric Cybernetic Grid & Circuit Traces ---
        const gridSize = 120;
        const gridStep = 30;
        const floorY = 60;

        ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
        ctx.lineWidth = 1;

        // Grid lines
        for (let gx = -gridSize; gx <= gridSize; gx += gridStep) {
          const p1 = project(gx, floorY, -gridSize);
          const p2 = project(gx, floorY, gridSize);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
        for (let gz = -gridSize; gz <= gridSize; gz += gridStep) {
          const p1 = project(-gridSize, floorY, gz);
          const p2 = project(gridSize, floorY, gz);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }

        // Vertical data bus pillars to nodes
        displayNodes.forEach((node) => {
          const base = project(node.x, floorY, node.z);
          const top = project(node.x, node.y, node.z);
          ctx.beginPath();
          ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
          ctx.setLineDash([2, 4]);
          ctx.moveTo(base.px, base.py);
          ctx.lineTo(top.px, top.py);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      } else if (visualType === "molecule") {
        // --- 2. MOLECULE: Valence Rings & Double Helical Lattice ---
        const helixSteps = 30;
        const helixRadius = 50;
        const helixHeight = 120;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 2;
        for (let i = 0; i <= helixSteps; i++) {
          const angle = (i / helixSteps) * Math.PI * 4 + tickRef.current;
          const y = ((i / helixSteps) - 0.5) * helixHeight;
          const x = Math.cos(angle) * helixRadius;
          const z = Math.sin(angle) * helixRadius;
          const p = project(x, y, z);
          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 2;
        for (let i = 0; i <= helixSteps; i++) {
          const angle = (i / helixSteps) * Math.PI * 4 + Math.PI + tickRef.current;
          const y = ((i / helixSteps) - 0.5) * helixHeight;
          const x = Math.cos(angle) * helixRadius;
          const z = Math.sin(angle) * helixRadius;
          const p = project(x, y, z);
          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.stroke();
      } else if (visualType === "optics") {
        // --- 3. OPTICS: Optical Axis & Lens Interface ---
        // Principal Axis
        const pAxis1 = project(-140, 0, 0);
        const pAxis2 = project(140, 0, 0);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.moveTo(pAxis1.px, pAxis1.py);
        ctx.lineTo(pAxis2.px, pAxis2.py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Translucent Biconvex Lens Disk
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
        ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
        ctx.lineWidth = 2;
        const lensSegments = 30;
        for (let i = 0; i <= lensSegments; i++) {
          const theta = (i / lensSegments) * Math.PI * 2;
          const ly = Math.cos(theta) * 65;
          const lz = Math.sin(theta) * 65;
          const p = project(0, ly, lz);
          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (visualType === "cell") {
        // --- 4. CELL: Translucent Cellular Envelope & Cristae Ribbons ---
        const rings = [
          { radius: 85, tilt: 0, color: "rgba(139, 92, 246, 0.3)" },
          { radius: 85, tilt: Math.PI / 2.5, color: "rgba(236, 72, 153, 0.25)" },
          { radius: 60, tilt: -Math.PI / 3, color: "rgba(16, 185, 129, 0.3)" },
        ];

        rings.forEach((ring) => {
          ctx.beginPath();
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5;
          const segments = 36;
          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const rx = Math.cos(theta) * ring.radius;
            const ry = Math.sin(theta) * ring.radius * Math.cos(ring.tilt);
            const rz = Math.sin(theta) * ring.radius * Math.sin(ring.tilt);
            const { px, py } = project(rx, ry, rz);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        });
      } else {
        // --- 5. SYSTEM: Multi-Axis Gyroscope Rings ---
        const rings = [
          { radius: 90, tilt: 0, color: "rgba(139, 92, 246, 0.28)" },
          { radius: 90, tilt: Math.PI / 3, color: "rgba(6, 182, 212, 0.25)" },
          { radius: 90, tilt: -Math.PI / 3, color: "rgba(16, 185, 129, 0.25)" },
        ];

        rings.forEach((ring) => {
          ctx.beginPath();
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5;
          const segments = 36;
          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const rx = Math.cos(theta) * ring.radius;
            const ry = Math.sin(theta) * ring.radius * Math.cos(ring.tilt);
            const rz = Math.sin(theta) * ring.radius * Math.sin(ring.tilt);
            const { px, py } = project(rx, ry, rz);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        });
      }

      // ─────────────────────────────────────────────────────────────
      // Central Core Pulsing Glow
      // ─────────────────────────────────────────────────────────────
      const core = project(0, 0, 0);
      const pulseSize = (28 + Math.sin(tickRef.current * 2) * 4) * core.scale;
      const coreGrad = ctx.createRadialGradient(
        core.px,
        core.py,
        2 * core.scale,
        core.px,
        core.py,
        pulseSize
      );
      coreGrad.addColorStop(0, "rgba(167, 139, 250, 0.85)");
      coreGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.25)");
      coreGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(core.px, core.py, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────
      // Project Nodes & Sort by Depth (Z-Ordering)
      // ─────────────────────────────────────────────────────────────
      const projectedNodes = displayNodes
        .map((n, idx) => {
          const p = project(n.x, n.y, n.z);
          return { ...n, ...p, originalIndex: idx };
        })
        .sort((a, b) => b.depth - a.depth);

      // ─────────────────────────────────────────────────────────────
      // Draw Connections Between Nodes (Mesh / Traces)
      // ─────────────────────────────────────────────────────────────
      const activeConnections: Array<[number, number]> =
        connections && connections.length > 0
          ? connections
          : displayNodes.map((_, i) => [i, (i + 1) % displayNodes.length]);

      activeConnections.forEach(([fromIdx, toIdx]) => {
        const fromNode = displayNodes[fromIdx];
        const toNode = displayNodes[toIdx];
        if (!fromNode || !toNode) return;

        const p1 = project(fromNode.x, fromNode.y, fromNode.z);
        const p2 = project(toNode.x, toNode.y, toNode.z);

        ctx.beginPath();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        // Pulsing data packet along connection
        const t = (Math.sin(tickRef.current * 1.5 + fromIdx) + 1) / 2;
        const packetX = p1.px + (p2.px - p1.px) * t;
        const packetY = p1.py + (p2.py - p1.py) * t;
        ctx.beginPath();
        ctx.arc(packetX, packetY, 2.5 * p1.scale, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      });

      // Also draw connection lines from center to nodes
      projectedNodes.forEach((node) => {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.moveTo(core.px, core.py);
        ctx.lineTo(node.px, node.py);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ─────────────────────────────────────────────────────────────
      // Render 3D Spheres & Labeled Badges
      // ─────────────────────────────────────────────────────────────
      projectedNodes.forEach((node) => {
        const radius = Math.max(6, 10 * node.scale);

        // Node Outer Aura Glow
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = (node.color || "#8b5cf6") + "35";
        ctx.fill();

        // Node Solid Sphere
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color || "#8b5cf6";
        ctx.fill();

        // Node specular highlight
        ctx.beginPath();
        ctx.arc(
          node.px - radius * 0.3,
          node.py - radius * 0.3,
          radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fill();

        // Label Tag
        const fontSize = Math.max(9, Math.round(11 * node.scale));
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        const textWidth = ctx.measureText(node.label).width;

        // Label pill background
        const pillX = node.px + radius + 6;
        const pillY = node.py - fontSize / 2 - 4;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, textWidth + 12, fontSize + 8, 4);
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(node.label, pillX + 6, pillY + fontSize + 1);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [displayNodes, zoom, visualType, connections]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    autoRotate.current = false;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    rot.current.y += dx * 0.01;
    rot.current.x += dy * 0.01;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      autoRotate.current = true;
    }, 3000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(2.0, Math.max(0.6, prev - e.deltaY * 0.001)));
  };

  const resetView = () => {
    rot.current = { x: 0.35, y: 0.5 };
    setZoom(1);
    autoRotate.current = true;
  };

  return (
    <div
      className="relative rounded-3xl bg-gradient-to-b from-panel via-surface to-ink border border-line p-4 flex flex-col items-center justify-center min-h-[420px] shadow-card overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#242a3b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Title & Status Overlay */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
        <div>
          <span className="text-2xs font-mono uppercase tracking-wider text-violet-bright font-bold">
            Realtime 3D Engine Active • Type: {visualType.toUpperCase()}
          </span>
          {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-2xs text-muted font-mono">{subtitle}</p>}
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-mint/20 border border-mint/40 text-mint text-2xs font-mono flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          Interactive 3D Mesh
        </span>
      </div>

      {/* Real 3D HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={560}
        height={360}
        className="w-full max-w-[560px] h-[340px] z-0"
      />

      {/* Interactive Controls Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-2xs text-muted z-10">
        <span className="flex items-center gap-1">
          🖱️ Click & drag to rotate (360° orbit) • Scroll to zoom
        </span>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="px-2.5 py-1 rounded-lg bg-panel border border-line text-slate-300 hover:text-white transition-colors"
          >
            Zoom +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="px-2.5 py-1 rounded-lg bg-panel border border-line text-slate-300 hover:text-white transition-colors"
          >
            Zoom -
          </button>
          <button
            onClick={resetView}
            className="px-2.5 py-1 rounded-lg bg-panel border border-line text-slate-300 hover:text-white transition-colors"
          >
            Reset 3D View
          </button>
        </div>
      </div>
    </div>
  );
}
