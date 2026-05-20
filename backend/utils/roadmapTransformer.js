/**
 * Transforms the structured career/learning roadmap JSON data into React Flow nodes and edges.
 * Generates custom node data configurations and a clean layout representation.
 */
export function transformRoadmapToReactFlow(roadmap) {
  const nodes = [];
  const edges = [];

  if (!roadmap || !roadmap.milestones) {
    return { nodes, edges };
  }

  // Calculate layout coordinates (Vertical sequence hierarchy with slight offsets)
  roadmap.milestones.forEach((milestone, idx) => {
    nodes.push({
      id: milestone.id,
      type: "roadmapNode", // Custom node type registered in the React Flow frontend
      data: {
        title: milestone.title,
        description: milestone.description,
        duration: milestone.duration,
        topics: milestone.topics || [],
        resources: milestone.resources || [],
        projects: milestone.projects || [],
        phaseNumber: idx + 1,
        totalPhases: roadmap.milestones.length,
      },
      // Centered position starting at X=150, Y spaced by 220px to allow card heights
      position: { x: 150, y: idx * 220 },
    });
  });

  // Map the connection lines
  if (roadmap.connections && roadmap.connections.length > 0) {
    roadmap.connections.forEach((conn, index) => {
      edges.push({
        id: `edge-${conn.from}-${conn.to}-${index}`,
        source: conn.from,
        target: conn.to,
        animated: true,
        label: conn.label || "",
        style: { stroke: "#0f766e", strokeWidth: 2.5 }, // Rich dark teal stroke
        labelStyle: { fill: "#99f6e4", fontWeight: 700, fontSize: 10 },
        labelBgStyle: { fill: "#115e59" },
      });
    });
  } else {
    // Sequentially connect them if no custom paths are specified
    for (let i = 0; i < roadmap.milestones.length - 1; i++) {
      const fromId = roadmap.milestones[i].id;
      const toId = roadmap.milestones[i + 1].id;
      edges.push({
        id: `edge-seq-${fromId}-${toId}`,
        source: fromId,
        target: toId,
        animated: true,
        style: { stroke: "#0f766e", strokeWidth: 2.5 },
      });
    }
  }

  return { nodes, edges };
}
