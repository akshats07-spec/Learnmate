import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  topic: z.string().min(1).max(200),
  context: z.string().optional(),
});

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateDeterministicModel(topic: string, context: string = "") {
  const lower = (topic + " " + context).toLowerCase();
  const seed = hashString(topic);

  // 1. Tech / Hardware / Keyboard / Shortcuts
  if (
    lower.includes("key") ||
    lower.includes("shortcut") ||
    lower.includes("msi") ||
    lower.includes("hardware") ||
    lower.includes("function") ||
    lower.includes("cpu") ||
    lower.includes("gpu") ||
    lower.includes("chip") ||
    lower.includes("matrix")
  ) {
    return {
      conceptTitle: `3D Architecture: ${topic}`,
      visualType: "tech",
      explanation: `Spatial layout of ${topic}. Highlights keyboard matrix scanning lines, micro-controller bus registers, and active hardware interrupt triggers.`,
      breakdown: [
        `Matrix Scan Line: Intercepts switch debounce and keypress scan codes.`,
        `Embedded Controller (EC): Translates raw hardware signals to ACPI/OS interrupts.`,
        `Firmware Driver Bus: Dispatches function execution (display, volume, fan speed).`,
        `Subsystem Actuator: Physical hardware reaction module (backlight, cooling, display).`,
      ],
      analogy: `Like a grand piano's hammer linkage: striking a single key trips an internal mechanical lever that strikes the target chime instantly.`,
      knowledgeCheck: {
        question: `In modern laptop architecture, which component directly intercepts hardware function key shortcuts?`,
        options: [
          "The Embedded Controller (EC) / Keyboard Matrix",
          "The Primary Graphics Memory VRAM",
          "The Static Storage SSD Controller",
          "The Web Browser JavaScript Engine",
        ],
        correctIndex: 0,
      },
      nodes: [
        { label: "Key Switch Contact", color: "#8b5cf6", x: -65, y: -40, z: -30 },
        { label: "Matrix Bus Line", color: "#06b6d4", x: -20, y: -20, z: -10 },
        { label: "Embedded Controller (EC)", color: "#10b981", x: 20, y: 10, z: 20 },
        { label: "ACPI Interrupt Vector", color: "#f59e0b", x: 60, y: 40, z: 40 },
        { label: "Hardware Actuator Bus", color: "#ec4899", x: 0, y: 60, z: -20 },
      ],
      connections: [
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4],
      ],
    };
  }

  // 2. Cell / Biology / Mitochondria
  if (
    lower.includes("cell") ||
    lower.includes("mito") ||
    lower.includes("membrane") ||
    lower.includes("organelle") ||
    lower.includes("bio") ||
    lower.includes("nucleus") ||
    lower.includes("protein")
  ) {
    return {
      conceptTitle: `3D Biomolecular Model: ${topic}`,
      visualType: "cell",
      explanation: `3D spatial projection of ${topic}. Displays internal compartmentalization, gradient potentials, and catalytic membrane domains.`,
      breakdown: [
        `Outer Phospholipid Membrane: Protective permeable perimeter.`,
        `Intermembrane Space: Gradient reservoir of electrochemical potential.`,
        `Inner Catalytic Core: High-density folded cristae and active metabolic enzymes.`,
        `Rotary Subunit: Mechanochemical transduction enzyme complex.`,
      ],
      analogy: `Like an insulated battery cell with distinct chemical chambers maintaining an electrical charge differential.`,
      knowledgeCheck: {
        question: `What primary spatial feature enables ${topic} to maximize metabolic output?`,
        options: [
          "Extensive surface area folding and internal compartmentalization",
          "Complete lack of internal membranes",
          "Rigid, unyielding calcium crystal shells",
          "Permanent dehydration of inner matrix",
        ],
        correctIndex: 0,
      },
      nodes: [
        { label: "Outer Boundary Envelope", color: "#8b5cf6", x: 0, y: 70, z: 0 },
        { label: "Gradient Reservoir Space", color: "#06b6d4", x: -50, y: 20, z: 35 },
        { label: "Folded Cristae Core", color: "#10b981", x: 45, y: -15, z: -30 },
        { label: "Catalytic Rotary Hub", color: "#f59e0b", x: -10, y: -50, z: 25 },
        { label: "Matrix Fluid Subunit", color: "#ec4899", x: 50, y: -45, z: 20 },
      ],
      connections: [
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4],
        [3, 4],
      ],
    };
  }

  // 3. Optics / Physics / Light / Waves
  if (
    lower.includes("optic") ||
    lower.includes("lens") ||
    lower.includes("light") ||
    lower.includes("ray") ||
    lower.includes("wave") ||
    lower.includes("physics") ||
    lower.includes("refract")
  ) {
    return {
      conceptTitle: `3D Optical Projection: ${topic}`,
      visualType: "optics",
      explanation: `3D geometric ray tracing of ${topic}. Visualizes incident ray vectors, refraction curvature, and convergence at the focal point.`,
      breakdown: [
        `Incident Vector Beam: Parallel light rays arriving from the source.`,
        `Curved Refraction Interface: Snell's law refractive boundary.`,
        `Principal Optical Axis: Longitudinal axis passing through optical center.`,
        `Conjugate Focal Point: Precision intersection of refracted rays.`,
      ],
      analogy: `Like funnels directing multiple rainwater streams together into a concentrated focal point.`,
      knowledgeCheck: {
        question: `What governs the trajectory bend of light across the refractive interface?`,
        options: [
          "The difference in refractive indices between the media",
          "The weight of the optical apparatus",
          "The ambient room temperature exclusively",
          "The static magnetic charge of the lens surface",
        ],
        correctIndex: 0,
      },
      nodes: [
        { label: "Source Emitter", color: "#f59e0b", x: -75, y: 30, z: 0 },
        { label: "Incident Ray Vector", color: "#06b6d4", x: -35, y: 15, z: 0 },
        { label: "Refractive Lens Center", color: "#8b5cf6", x: 0, y: 0, z: 0 },
        { label: "Principal Focal Point (F)", color: "#10b981", x: 45, y: -15, z: 0 },
        { label: "Real Inverted Conjugate", color: "#ec4899", x: 75, y: -30, z: 0 },
      ],
      connections: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    };
  }

  // 4. Molecule / Chemistry / DNA
  if (
    lower.includes("chem") ||
    lower.includes("molecule") ||
    lower.includes("atom") ||
    lower.includes("bond") ||
    lower.includes("dna") ||
    lower.includes("rna")
  ) {
    return {
      conceptTitle: `3D Molecular Lattice: ${topic}`,
      visualType: "molecule",
      explanation: `3D covalent stereochemistry of ${topic}. Showcases electron orbitals, valence angles, and steric hindrance domains.`,
      breakdown: [
        `Central Nucleus / Carbon Hub: Sp3 hybridized valence foundation.`,
        `Polar Electronegative Ligand: Creates dipole moment vectors.`,
        `Hydrogen Bonding Node: Intermolecular stabilization bridge.`,
        `Steric Bulk Periphery: Governs rotational freedom and conformational shape.`,
      ],
      analogy: `Like a tetrahedral tripod with a flexible swiveling top ball-and-socket joint.`,
      knowledgeCheck: {
        question: `What dictates the exact spatial 3D conformation of ${topic}?`,
        options: [
          "Valence shell electron pair repulsion (VSEPR) and steric hindrance",
          "Atmospheric pressure outside the container",
          "The color of the test tube",
          "Random Brownian motion with no governing geometry",
        ],
        correctIndex: 0,
      },
      nodes: [
        { label: "Central Sp3 Carbon Hub", color: "#8b5cf6", x: 0, y: 0, z: 0 },
        { label: "Polar Carbonyl Ligand", color: "#ec4899", x: -50, y: 45, z: 20 },
        { label: "Electronegative Oxygen", color: "#06b6d4", x: 50, y: 45, z: -20 },
        { label: "Hydrogen Bond Bridge", color: "#10b981", x: -40, y: -50, z: -35 },
        { label: "Alkyl Stabilizing Group", color: "#f59e0b", x: 40, y: -50, z: 35 },
      ],
      connections: [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
      ],
    };
  }

  // 5. General System / Process with deterministic procedural nodes
  const angleStep = (Math.PI * 2) / 5;
  const radius = 55;
  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
  const dynamicNodes = [
    "Primary Input Domain",
    "Transformation Engine",
    "Feedback Regulator",
    "Distribution Channel",
    "Terminal Output Vector",
  ].map((name, i) => {
    const angle = i * angleStep + ((seed % 10) * Math.PI) / 10;
    const x = Math.round(Math.cos(angle) * radius);
    const y = Math.round(Math.sin(angle) * (radius * 0.7));
    const z = Math.round(Math.sin(angle * 2) * 35);
    return {
      label: `${name} (${topic.slice(0, 12)})`,
      color: colors[i % colors.length],
      x,
      y,
      z,
    };
  });

  return {
    conceptTitle: `3D Dynamic Process: ${topic}`,
    visualType: "system",
    explanation: `Multi-dimensional spatial topology of ${topic}. Maps interaction vectors, state transitions, and central throughput paths.`,
    breakdown: [
      `Input Stage: Receptive domain capturing initial state variables for ${topic}.`,
      `Processing Matrix: Core transformations and operational state changes.`,
      `Stabilization Loop: Feedback dynamics preventing overshoot or divergence.`,
      `Output Gradient: Final functional realization and terminal vector.`,
    ],
    analogy: `Like a synchronized planetary orbital system where gravitational balance keeps each module operating in locked harmony.`,
    knowledgeCheck: {
      question: `Which zone in ${topic} primarily coordinates the balance between inputs and outputs?`,
      options: [
        "The central stabilization loop and processing matrix",
        "The disconnected external buffer",
        "The terminal passive exhaust exclusively",
        "None of the active nodes",
      ],
      correctIndex: 0,
    },
    nodes: dynamicNodes,
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid visual request." }, { status: 400 });
    }

    const { topic, context = "" } = parsed.data;

    // Use Gemini if API key is configured
    if (process.env.GEMINI_API_KEY) {
      const candidates = Array.from(
        new Set([
          process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-flash-latest",
          "gemini-3.5-flash",
        ])
      );

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const prompt =
        `You are an expert 3D medical, scientific, and technical visual model designer.\n` +
        `Design an interactive 3D spatial educational model for the topic: "${topic}".\n` +
        `Context from student's study material: "${context.slice(0, 4000)}"\n\n` +
        `Select the most fitting visualType from: "tech" | "molecule" | "cell" | "optics" | "physics" | "system".\n` +
        `Provide 4 to 6 3D spatial nodes with distinct 3D coordinates (x, y, z in range -75 to 75), meaningful component labels for "${topic}", distinct hex colors, and connection pairs between node indices.\n\n` +
        `Return JSON ONLY with this exact schema:\n` +
        `{\n` +
        `  "conceptTitle": "3D Spatial Model: ${topic}",\n` +
        `  "visualType": "tech" | "molecule" | "cell" | "optics" | "physics" | "system",\n` +
        `  "explanation": "2-3 clear sentences explaining the 3D geometric layout and function of ${topic}.",\n` +
        `  "breakdown": [\n` +
        `    "Layer 1 / Component 1 name and spatial function",\n` +
        `    "Layer 2 / Component 2 name and spatial function",\n` +
        `    "Layer 3 / Component 3 name and spatial function",\n` +
        `    "Layer 4 / Component 4 name and spatial function"\n` +
        `  ],\n` +
        `  "analogy": "A clear, intuitive physical analogy explaining the 3D mechanics.",\n` +
        `  "knowledgeCheck": {\n` +
        `    "question": "A high-yield MCQ testing 3D spatial or functional comprehension of ${topic}",\n` +
        `    "options": ["Option A", "Option B", "Option C", "Option D"],\n` +
        `    "correctIndex": 1\n` +
        `  },\n` +
        `  "nodes": [\n` +
        `    {"label": "Specific Component 1", "color": "#8b5cf6", "x": 0, "y": 60, "z": 0},\n` +
        `    {"label": "Specific Component 2", "color": "#06b6d4", "x": -50, "y": -20, "z": 30},\n` +
        `    {"label": "Specific Component 3", "color": "#10b981", "x": 50, "y": -20, "z": -30},\n` +
        `    {"label": "Specific Component 4", "color": "#f59e0b", "x": 0, "y": -50, "z": 40}\n` +
        `  ],\n` +
        `  "connections": [[0,1], [1,2], [2,3], [3,0]]\n` +
        `}`;

      for (const modelName of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const res = await model.generateContent(prompt);
          const raw = res.response
            .text()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
          const generated = JSON.parse(raw);
          return NextResponse.json({ ...generated, providerConfigured: true });
        } catch (geminiErr: any) {
          console.warn(`Gemini visual generation model ${modelName} failed:`, geminiErr?.status || geminiErr?.message);
        }
      }
    }

    // High-fidelity deterministic fallback tailored to the specific topic
    const dynamicModel = generateDeterministicModel(topic, context);
    return NextResponse.json({
      ...dynamicModel,
      providerConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error) {
    console.error("Visual generation error:", error);
    return NextResponse.json({ error: "Failed to generate visual." }, { status: 500 });
  }
}
