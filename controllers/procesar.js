function processTemplateLine(doc, line, options = {}) {
  const sangria = "                            ";

  // 2. Verificar si la línea debe centrarse (quita espacios y chequea [[...]])
  const trimmedLine = line.trim();
  const centerMatch = trimmedLine.match(/^\[\[(.*?)\]\]$/);
  const isCentered = !!centerMatch;
  const content = isCentered ? centerMatch[1].trim() : line;

  // 3. Procesar negritas <bold>...</bold>
  const boldPattern = /<bold>(.*?)<\/bold>/g;
  let match;
  const parts = [];
  let lastIndex = 0;

  while ((match = boldPattern.exec(content)) !== null) {
    // Texto antes de la negrita
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index), bold: false });
    }
    // Texto en negrita
    parts.push({ text: match[1], bold: true });
    lastIndex = boldPattern.lastIndex;
  }

  // Texto restante después de la última etiqueta <bold>
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex), bold: false });
  }

  // 4. Dibujar en PDF con alineación y estilo adecuado
  const align = isCentered ? "center" : "justify";

  const textOptions = {
    align,
    lineGap: align === "justify" ? 5 : 0, // 👈 Aplica solo si justificado
  };

  if (parts.length > 0) {
    parts.forEach((part, index) => {
      const isFirst = index === 0;
      const isLast = index === parts.length - 1;
      let textToPrint = part.text;

      if (!isLast && !part.text.endsWith(" ")) {
        textToPrint += " ";
      }

      doc
        .font(part.bold ? "Times-Bold" : "Times-Roman")
        .fontSize(12)
        .text((isFirst && !isCentered ? sangria : "") + textToPrint, {
          continued: index < parts.length - 1,
          // align,
          ...textOptions,
        });
    });
    doc.text("", { continued: false }); // Finaliza la línea
    doc.font("Times-Roman").fontSize(12);
  } else {
    // Línea sin negritas
    doc
      .font("Times-Roman")
      .fontSize(12)
      .text((isCentered ? "" : sangria) + content, { ...textOptions });
  }
}
