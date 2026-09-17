/**
 * Reparación de texto proveniente de datos.gov.co.
 *
 * El dataset original trae defectos de codificación que solo aparecen DENTRO
 * de las palabras, por lo que se corrigen sin tocar texto legítimo:
 *   - "?" o "¿" donde debería ir "Ñ"  (LONDO?O, SE¿ORA, NARI¿O, CA¿O)
 *   - "\uFFFD" (carácter de reemplazo) en el mismo caso
 *   - acento grave donde el español usa agudo (INSTITUCIÒN, TÈCNICA, GARCÌA)
 *   - mojibake latin-1 ("Ã±" en vez de "ñ") por si alguna fuente lo entrega así
 *
 * No se altera la "Ü" (ITAGÜÍ, BILINGÜE son correctos) ni los signos "¿?"
 * que abren o cierran una pregunta de verdad.
 */

const GRAVE_TO_ACUTE: Record<string, string> = {
    "\u00c0": "\u00c1", // À -> Á
    "\u00c8": "\u00c9", // È -> É
    "\u00cc": "\u00cd", // Ì -> Í
    "\u00d2": "\u00d3", // Ò -> Ó
    "\u00d9": "\u00da", // Ù -> Ú
    "\u00e0": "\u00e1", // à -> á
    "\u00e8": "\u00e9", // è -> é
    "\u00ec": "\u00ed", // ì -> í
    "\u00f2": "\u00f3", // ò -> ó
    "\u00f9": "\u00fa", // ù -> ú
};

// Secuencias típicas de UTF-8 leído como latin-1.
const MOJIBAKE: Record<string, string> = {
    "\u00c3\u00b1": "\u00f1", // Ã± -> ñ
    "\u00c3\u2018": "\u00d1", // Ã‘ -> Ñ
    "\u00c3\u00a1": "\u00e1",
    "\u00c3\u00a9": "\u00e9",
    "\u00c3\u00ad": "\u00ed",
    "\u00c3\u00b3": "\u00f3",
    "\u00c3\u00ba": "\u00fa",
    "\u00c3\u00bc": "\u00fc",
    "\u00c3\u0081": "\u00c1",
    "\u00c3\u2030": "\u00c9",
    "\u00c3\u008d": "\u00cd",
    "\u00c3\u201c": "\u00d3",
    "\u00c3\u009a": "\u00da",
    "\u00c3\u0153": "\u00dc",
};

const MOJIBAKE_RE = new RegExp(Object.keys(MOJIBAKE).join("|"), "g");
const GRAVE_RE = new RegExp(`[${Object.keys(GRAVE_TO_ACUTE).join("")}]`, "g");
// "?", "¿" o "\uFFFD" con una letra a cada lado: es una "Ñ" perdida.
const LOST_ENYE_RE = /(\p{L})[?\u00bf\ufffd](?=(\p{L}))/gu;

/** Corrige los defectos de codificación de un texto. */
export function repairText(text: unknown): string {
    const value = (text ?? "").toString();
    if (!value) return "";

    return value
        .replace(MOJIBAKE_RE, (match) => MOJIBAKE[match] ?? match)
        .replace(GRAVE_RE, (match) => GRAVE_TO_ACUTE[match] ?? match)
        .replace(LOST_ENYE_RE, (_match, prev: string, next: string) => {
            const isUpper = prev === prev.toUpperCase() || next === next.toUpperCase();
            return prev + (isUpper ? "\u00d1" : "\u00f1");
        });
}

/** Texto listo para mostrar: reparado y con espacios normalizados. */
export function cleanLabel(text: unknown): string {
    return repairText(text).replace(/\s+/g, " ").trim();
}
