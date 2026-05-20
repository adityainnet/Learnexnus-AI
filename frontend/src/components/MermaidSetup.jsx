import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: "default"
})

const cleanMermaidChart = (diagram) => {
  if (!diagram) return "";

  let clean = diagram
    .replace(/[\r\n]/g, "\n")
    .replace(/\\/g, " ")
    .replace(/\//g, "")
    .replace(/\*/g, "")
    .replace(/\)/g, "")
    .replace(/\(/g, "");

  if (!clean.trim().startsWith("graph")) {
    clean = `graph TD\n${clean}`;
  }

  return clean;
}

function MermaidSetup({ diagram }) {
  const containerRef = useRef(null)

 useEffect(() => {
  if (!diagram || !containerRef.current) return;

  const renderDiagram = async () => {
    try {
      containerRef.current.innerHTML = "";

      const uniqueId = `mermaid-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      // ✅ sanitize before render
      const safeChart = cleanMermaidChart(diagram);

      const { svg } = await mermaid.render(uniqueId, safeChart);

      containerRef.current.innerHTML = svg;
    } catch (error) {
      console.error("Mermaid render failed:", error);
    }
  };

  const cleanDiagram = diagram
  .replace(/\|/g, "")
  .replace(/\^/g, "**");

renderDiagram(cleanDiagram);
}, [diagram]);

  return (
    <div className='bg-white border rounded-lg p-4 overflow-x-auto'>
      <div ref={containerRef} />
    </div>
  )
}

export default MermaidSetup