/**
* Input normalisation helpers. These are deliberately small: the server-side
* Zod schemas do real validation, this layer only removes control characters
* and clamps length so stored values stay clean and safe to render.
*/
// Strips C0 control characters (except tab/newline/form-feed handled below).
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");
export function sanitizeText(input: string, max = 5000): string {
return input
.replace(CONTROL_CHARS, "")
.replace(/\s+/g, " ")
.trim()
.slice(0, max); }
export function sanitizeMultiline(input: string, max = 20_000): string {
return input
.replace(CONTROL_CHARS, "")
.replace(/\r\n?/g, "\n")
.replace(/\n{3,}/g, "\n\n")
.trim()
.slice(0, max); }
export function clampString(input: string, max: number): string {
return input.trim().slice(0, max); }
