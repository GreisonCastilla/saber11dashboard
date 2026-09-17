import { repairText } from "./textUtils";

/**
 * Utilidades de búsqueda tolerante: ignora tildes, mayúsculas, la "ñ",
 * signos de puntuación y el orden de las palabras. También repara los
 * defectos de codificación del dataset (ver textUtils), para que
 * "LONDO?O" se encuentre buscando "londoño" o "londono".
 */

/** "Bolívar (áreas)" -> "bolivar areas" */
export function normalizeText(text: unknown): string {
    return repairText(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tildes y diéresis (ñ -> n)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ") // signos de puntuación como separadores
        .replace(/\s+/g, " ")
        .trim();
}

/** Divide la consulta en palabras normalizadas. */
export function tokenize(query: string): string[] {
    const normalized = normalizeText(query);
    return normalized ? normalized.split(" ") : [];
}

/**
 * true si el texto contiene todas las palabras de la consulta,
 * sin importar el orden ni las tildes.
 */
export function matchesSearch(text: unknown, query: string): boolean {
    const tokens = tokenize(query);
    if (tokens.length === 0) return true;
    const haystack = normalizeText(text);
    return tokens.every((token) => haystack.includes(token));
}

/**
 * Puntaje para ordenar resultados: menor es mejor.
 * Prioriza coincidencias exactas, luego las que empiezan por la consulta.
 */
export function matchScore(text: unknown, query: string): number {
    const haystack = normalizeText(text);
    const needle = normalizeText(query);
    if (!needle) return 3;
    if (haystack === needle) return 0;
    if (haystack.startsWith(needle)) return 1;
    if (haystack.includes(needle)) return 2;
    return 3;
}
