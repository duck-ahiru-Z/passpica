export type IndentationEdit = {
  code: string;
  selectionStart: number;
  selectionEnd: number;
  changed: boolean;
};

function countRemovedIndentationBefore(text: string): number {
  return text.split('\n').reduce((count, line) => {
    const indentation = line.match(/^(?:\t| {1,2})/)?.[0] ?? '';
    return count + indentation.length;
  }, 0);
}

export function editIndentationSelection(
  code: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean,
): IndentationEdit {
  const lineStart = code.lastIndexOf('\n', selectionStart - 1) + 1;

  if (selectionStart === selectionEnd && !outdent) {
    return {
      code: `${code.slice(0, selectionStart)}  ${code.slice(selectionEnd)}`,
      selectionStart: selectionStart + 2,
      selectionEnd: selectionStart + 2,
      changed: true,
    };
  }

  if (selectionStart === selectionEnd) {
    const lineEnd = code.indexOf('\n', selectionStart);
    const line = code.slice(lineStart, lineEnd < 0 ? code.length : lineEnd);
    const indentation = line.match(/^(?:\t| {1,2})/)?.[0] ?? '';
    if (!indentation) return { code, selectionStart, selectionEnd, changed: false };
    const nextPosition = Math.max(lineStart, selectionStart - Math.min(indentation.length, selectionStart - lineStart));
    return {
      code: `${code.slice(0, lineStart)}${line.slice(indentation.length)}${code.slice(lineStart + line.length)}`,
      selectionStart: nextPosition,
      selectionEnd: nextPosition,
      changed: true,
    };
  }

  const selectionEndsAtLineStart = selectionEnd > lineStart && code[selectionEnd - 1] === '\n';
  const selectedEnd = selectionEndsAtLineStart ? selectionEnd - 1 : selectionEnd;
  const lineEnd = code.indexOf('\n', selectedEnd);
  const blockEnd = lineEnd < 0 ? code.length : lineEnd;
  const selectedLines = code.slice(lineStart, blockEnd).split('\n');
  let transformedLines: string[];
  let nextSelectionStart: number;
  let nextSelectionEnd: number;

  if (outdent) {
    let removedBeforeStart = 0;
    transformedLines = selectedLines.map((line, index) => {
      const indentation = line.match(/^(?:\t| {1,2})/)?.[0] ?? '';
      if (index === 0) removedBeforeStart = Math.min(indentation.length, selectionStart - lineStart);
      return line.slice(indentation.length);
    });
    const removedBeforeEnd = countRemovedIndentationBefore(code.slice(lineStart, selectionEnd));
    nextSelectionStart = Math.max(lineStart, selectionStart - removedBeforeStart);
    nextSelectionEnd = Math.max(nextSelectionStart, selectionEnd - removedBeforeEnd);
  } else {
    transformedLines = selectedLines.map(line => `  ${line}`);
    nextSelectionStart = selectionStart + 2;
    nextSelectionEnd = selectionEnd + 2 * selectedLines.length;
  }

  return {
    code: `${code.slice(0, lineStart)}${transformedLines.join('\n')}${code.slice(blockEnd)}`,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
    changed: true,
  };
}
