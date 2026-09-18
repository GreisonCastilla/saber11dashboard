/**
 * Acomoda las filas que ya vienen calculadas del servidor (ver dataLoader) a la
 * forma que espera cada gráfico. Aquí no se agrupa, ni se suma, ni se promedia:
 * solo se renombran campos y se elige qué corte usa cada gráfico.
 */

import type { AggRow, DataBundle } from "./dataLoader";

const AREAS = ["Ingles", "Matematicas", "Sociales", "Ciencias naturales", "Lectura critica"];
const AREAS_TILDE = ["Inglés", "Matemáticas", "Sociales", "Ciencias naturales", "Lectura crítica"];
const AREAS_GLOBAL = [...AREAS_TILDE, "Global"];

export interface ChartRow {
    name: string;
    PERIODO: string;
    label?: string[];
    /** Un `null` es un área que no se evaluó ese año: la gráfica deja el hueco. */
    datos?: (number | null)[];
    avgGlobal?: number | null;
}

/** Fila con las cinco áreas. */
const areas = (row: AggRow, label = AREAS, name = row.categoria): ChartRow => ({
    name,
    label,
    datos: [
        row.punt_ingles,
        row.punt_matematicas,
        row.punt_sociales_ciudadanas,
        row.punt_c_naturales,
        row.punt_lectura_critica,
    ],
    PERIODO: row.anio,
});

/** Fila con las cinco áreas más el puntaje global (tarjetas de resumen). */
const areasConGlobal = (row: AggRow): ChartRow => ({
    name: row.categoria,
    label: AREAS_GLOBAL,
    datos: [
        row.punt_ingles,
        row.punt_matematicas,
        row.punt_sociales_ciudadanas,
        row.punt_c_naturales,
        row.punt_lectura_critica,
        row.punt_global,
    ],
    PERIODO: row.anio,
});

/** Fila con solo el puntaje global. */
const global = (row: AggRow, name = row.categoria): ChartRow => ({
    name,
    avgGlobal: row.punt_global,
    PERIODO: row.anio,
});

export interface GeneroRow {
    name: string;
    PERIODO: string;
    data: { label: string; count: number; percentage: number }[];
}

/** Distribución por género: la torta necesita el porcentaje dentro de cada año. */
function distribucionGenero(filas: AggRow[]): GeneroRow[] {
    const porAnio = new Map<string, AggRow[]>();
    for (const row of filas) {
        porAnio.set(row.anio, [...(porAnio.get(row.anio) ?? []), row]);
    }

    return Array.from(porAnio, ([anio, filasDelAnio]) => {
        const total = filasDelAnio.reduce((suma, row) => suma + row.estudiantes, 0);
        return {
            name: "Género",
            PERIODO: anio,
            data: filasDelAnio.map((row) => ({
                label: row.categoria.toUpperCase(),
                count: row.estudiantes,
                percentage: total ? parseFloat(((row.estudiantes / total) * 100).toFixed(2)) : 0,
            })),
        };
    });
}

/**
 * Datos de un gráfico. Cada uno usa el corte que le corresponde; todos los
 * números llegan ya calculados sobre el total de registros del dataset.
 */
export function datosDelGrafico(chartId: number, bundle: DataBundle) {
    const { naturaleza, estrato, educacionMadre, educacionPadre, genero,
            nacional, bolivarTotal, bolivarColegios } = bundle;

    switch (chartId) {
        // Naturaleza del colegio
        case 1: return naturaleza.map((row) => areas(row, AREAS_TILDE));
        case 2: return [...naturaleza.map((row) => global(row)),
                        ...nacional.map((row) => global(row, "TOTAL"))];

        // Colegio de Bolívar vs promedio del departamento
        case 3: return [...bolivarColegios.map((row) => areas(row)),
                        ...bolivarTotal.map((row) => areas(row))];
        case 4: return [...bolivarColegios.map((row) => global(row)),
                        ...bolivarTotal.map((row) => global(row))];

        // Colegio de Bolívar vs promedio del país
        case 5: return [...bolivarColegios.map((row) => areas(row)),
                        ...nacional.map((row) => areas(row))];
        case 6: return [...bolivarColegios.map((row) => global(row)),
                        ...nacional.map((row) => global(row))];

        // Contexto socioeconómico
        case 7: return estrato.map((row) => areas(row));
        case 8: return estrato.map((row) => global(row));
        case 9: return educacionPadre.map((row) => global(row));
        case 10: return educacionMadre.map((row) => global(row));

        // Bolívar vs Colombia
        case 11: return [...nacional.map((row) => areas(row)),
                         ...bolivarTotal.map((row) => areas(row))];
        case 12: return [...nacional.map((row) => global(row)),
                         ...bolivarTotal.map((row) => global(row))];

        // Evolución de un colegio en el tiempo
        case 13: return bolivarColegios.map((row) => global(row));
        case 14: return bolivarColegios.map((row) => areas(row));

        // Distribución por género
        case 15: return distribucionGenero(genero);

        // Tarjetas de resumen
        case 16: return bolivarTotal.map(areasConGlobal);
        case 17: return nacional.map(areasConGlobal);

        default: return naturaleza.map((row) => areas(row, AREAS_TILDE));
    }
}

/** Colegios de Bolívar disponibles, para los selectores. */
export function colegiosDeBolivar(bundle: DataBundle | null): string[] {
    if (!bundle) return [];
    return Array.from(new Set(bundle.bolivarColegios.map((row) => row.categoria)))
        .filter(Boolean)
        .sort();
}
