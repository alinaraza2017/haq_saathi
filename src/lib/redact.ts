/**
 * Best-effort client-side redaction before anything is sent to the AI.
 * Removes CNIC numbers, phone numbers, emails and "my name is X" phrases.
 */
export function redact(text: string): string {
  return text
    .replace(/\b\d{5}-?\d{7}-?\d\b/g, "[CNIC]")
    .replace(/(\+92|0092|0)?3\d{2}[-\s]?\d{7}\b/g, "[PHONE]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[EMAIL]")
    .replace(/\b(my name is|i am called)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?/gi, "$1 [NAME]")
    .replace(/(میرا نام)\s+\S+(\s+\S+)?\s+(ہے)/g, "$1 [NAME] $3");
}
