import React, { useState } from "react";
import { jsPDF } from "jspdf";

function PrintablePaper({ data, showAnswers }) {
  return (
    <div className="bg-white text-black p-8 font-serif">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide">{data.examType || "EXAM"}</h2>
        <h1 className="text-3xl font-extrabold mt-1">{data.subject || data.topic}</h1>
        <p className="text-sm text-gray-600 mt-1">{data.classLevel || "General"}</p>
        <div className="flex justify-center gap-8 mt-3 text-sm font-semibold">
          <span>Total Marks: {data.totalMarks || "100"}</span>
          <span>Time: {data.timeDuration || "3 Hours"}</span>
          <span>Difficulty: {data.difficulty || "Mixed"}</span>
        </div>
      </div>

      {/* General Instructions */}
      {data.generalInstructions?.length > 0 && (
        <div className="mb-6">
          <p className="font-bold text-sm uppercase mb-2">General Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            {data.generalInstructions.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Sections */}
      {data.sections?.map((section, si) => (
        <div key={si} className="mb-8">
          <div className="bg-gray-100 px-4 py-2 rounded-lg mb-3">
            <h3 className="font-bold text-base">{section.name} – {section.title}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{section.instructions}</p>
          </div>
          <div className="space-y-4">
            {section.questions?.map((q, qi) => (
              <div key={qi} className="pl-2">
                <p className="font-semibold text-sm">
                  Q{q.number || (qi + 1)}. {q.question}
                  <span className="ml-2 text-gray-500 font-normal">
                    [{section.marksPerQuestion || 1} Mark{section.marksPerQuestion > 1 ? "s" : ""}]
                  </span>
                </p>
                {q.options && (
                  <div className="grid grid-cols-2 gap-1 mt-1.5 pl-4">
                    {q.options.map((opt, oi) => (
                      <span key={oi} className="text-sm text-gray-700">{opt}</span>
                    ))}
                  </div>
                )}
                {showAnswers && q.answer && (
                  <p className="mt-1 text-xs text-green-700 pl-4 font-sans">
                    <strong>Suggested Answer/Key:</strong> {q.answer}
                  </p>
                )}
                {!showAnswers && (section.type === "short" || section.type === "long") && (
                  <div
                    className="mt-2 border-b border-dashed border-gray-300"
                    style={{ height: section.type === "long" ? "80px" : "40px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const QuestionResult = ({ result }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  if (!result) return null;

  const exportToPdf = () => {
    const data = result;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxLineWidth = pageWidth - 2 * margin; // 180mm
    let y = 20;

    const checkPageBreak = (heightNeeded) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    const examTypeStr = (data.examType || "EXAM").toUpperCase();
    doc.text(examTypeStr, pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(22);
    const subjectStr = data.subject || data.topic || "";
    doc.text(subjectStr, pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    const metaStr = `Class/Level: ${data.classLevel || "General"}   |   Marks: ${data.totalMarks || "100"}   |   Time: ${data.timeDuration || "3 Hours"}`;
    doc.text(metaStr, pageWidth / 2, y, { align: "center" });
    y += 6;

    // Draw header border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // General Instructions
    if (data.generalInstructions?.length > 0) {
      checkPageBreak(25);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("GENERAL INSTRUCTIONS:", margin, y);
      y += 6;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      data.generalInstructions.forEach((ins, i) => {
        const textLines = doc.splitTextToSize(`${i + 1}. ${ins}`, maxLineWidth);
        const textHeight = textLines.length * 5;
        checkPageBreak(textHeight);
        doc.text(textLines, margin, y);
        y += textHeight + 2;
      });
      y += 5;
    }

    // Sections
    data.sections?.forEach((section) => {
      // Print Section Header
      checkPageBreak(20);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, maxLineWidth, 10, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${section.name} - ${section.title}`, margin + 3, y + 6);
      y += 14;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Instructions: ${section.instructions}`, margin, y);
      y += 6;

      // Questions
      section.questions?.forEach((q, qi) => {
        const qNum = q.number || (qi + 1);
        const marksStr = `[${section.marksPerQuestion || 1} Mark${(section.marksPerQuestion || 1) > 1 ? "s" : ""}]`;
        const questionText = `Q${qNum}. ${q.question}   ${marksStr}`;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        const qLines = doc.splitTextToSize(questionText, maxLineWidth);
        const qHeight = qLines.length * 5;
        checkPageBreak(qHeight + 10);
        doc.text(qLines, margin, y);
        y += qHeight + 2;

        // MCQ Options
        if (q.options?.length > 0) {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          // Render 2 options per line for clean layout
          for (let i = 0; i < q.options.length; i += 2) {
            const opt1 = q.options[i] || "";
            const opt2 = q.options[i + 1] || "";
            checkPageBreak(6);
            doc.text(opt1, margin + 5, y);
            if (opt2) {
              doc.text(opt2, pageWidth / 2 + 5, y);
            }
            y += 5;
          }
          y += 2;
        }

        // Show Answers
        if (showAnswers && q.answer) {
          doc.setFont("Helvetica", "oblique");
          doc.setFontSize(9);
          doc.setTextColor(34, 139, 34); // Forest green
          const answerLines = doc.splitTextToSize(`Suggested Answer: ${q.answer}`, maxLineWidth - 10);
          const ansHeight = answerLines.length * 5;
          checkPageBreak(ansHeight + 4);
          doc.text(answerLines, margin + 5, y);
          y += ansHeight + 3;
          doc.setTextColor(0, 0, 0); // Reset color
        }

        // Add line spacing for answers
        if (!showAnswers && (section.type === "short" || section.type === "long")) {
          const linesCount = section.type === "long" ? 4 : 2;
          checkPageBreak(linesCount * 6 + 5);
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          for (let i = 0; i < linesCount; i++) {
            doc.line(margin + 5, y, pageWidth - margin, y);
            y += 6;
          }
        }
        y += 4;
      });
      y += 5;
    });

    const fileBase = data.subject || data.topic || "exam";
    doc.save(`${fileBase.replace(/\s+/g, "_")}_paper.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Styles injected to handle print media properly */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-paper-view, #printable-paper-view * { visibility: visible; }
          #printable-paper-view { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Top Action Bar */}
      <div className="bg-gradient-to-br from-black/90 to-black/80 text-white px-6 py-4 rounded-xl flex items-center justify-between gap-3 flex-wrap">
        <span className="font-semibold text-sm flex items-center gap-2">
          ✅ Questions Generated Successfully
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20"
          >
            {showAnswers ? "🙈 Hide Answers" : "👁️ Show Answers"}
          </button>
          <button
            onClick={exportToPdf}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            📥 Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold flex items-center gap-2 shadow hover:bg-gray-100"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Printable Paper Render */}
      <div id="printable-paper-view" className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
        <PrintablePaper data={result} showAnswers={showAnswers} />
      </div>
    </div>
  );
};

export default QuestionResult;
