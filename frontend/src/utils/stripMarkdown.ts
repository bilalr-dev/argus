export function stripMarkdown(text: string): string {
  return text
    // Remove bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // Remove italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove inline code: `text`
    .replace(/`([^`]+)`/g, "$1")
    // Remove heading markers: ## text
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bullet markers: * item or - item
    .replace(/^[*-]\s+/gm, "")
    // Collapse multiple spaces
    .replace(/ {2,}/g, " ")
    .trim();
}
