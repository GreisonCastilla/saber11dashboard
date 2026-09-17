import { useState } from "react";

// Solo se usa si todavía no llegaron los datos: 2014 es el primer año con
// puntaje global y el rango real lo define después el propio dataset.
const RESPALDO = [2014];

/**
 * Rango de años disponible según los datos descargados.
 * Arranca en el año más reciente publicado y se ajusta solo cuando el ICFES
 * agrega un período nuevo, sin tocar el código.
 */
export function useYearRange(years?: number[]) {
    const lista = years && years.length > 0 ? years : RESPALDO;
    const minYear = lista[0];
    const maxYear = lista[lista.length - 1];

    const [year, setYear] = useState<number | null>(null);
    const selectedYear = year === null ? maxYear : Math.min(Math.max(year, minYear), maxYear);

    return { minYear, maxYear, selectedYear, setSelectedYear: setYear };
}
