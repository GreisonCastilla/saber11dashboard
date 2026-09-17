/**
 * Carga de datos del dataset "Resultados únicos Saber 11" (kgxf-xxbe).
 *
 * TODO el cálculo ocurre en el servidor de datos.gov.co: agrupar por año,
 * promediar cada área y redondear. La app no procesa registros; solo recibe
 * unas pocas filas ya listas y las acomoda a la forma que espera cada gráfico
 * (ver chartData.ts).
 *
 * Son ~7,1 millones de registros en origen; cada consulta los recorre completos
 * y devuelve unas decenas o miles de filas.
 *
 * Los años NO están fijos en el código: salen del propio dataset, así que
 * cuando el ICFES publique un período nuevo aparecerá solo.
 */

import { fetchDatos } from "../api/data/query";

/** Una fila ya agregada: un año, una categoría, los promedios finales. */
export interface AggRow {
    anio: string;
    /** Valor de la dimensión agrupada: OFICIAL, Estrato 3, el nombre del colegio, F/M... */
    categoria: string;
    /** Estudiantes que respaldan el promedio. */
    estudiantes: number;
    punt_ingles: number;
    punt_matematicas: number;
    punt_sociales_ciudadanas: number;
    punt_c_naturales: number;
    punt_lectura_critica: number;
    punt_global: number;
}

/**
 * Versión de la forma de los datos guardados. Hay que subirla cada vez que
 * cambien los campos del paquete: así lo que quedó en IndexedDB con el formato
 * viejo se descarta en vez de romper los gráficos.
 */
export const FORMATO_DATOS = 2;

export interface DataBundle {
    formato: number;
    years: number[];
    naturaleza: AggRow[];
    estrato: AggRow[];
    educacionMadre: AggRow[];
    educacionPadre: AggRow[];
    genero: AggRow[];
    nacional: AggRow[];
    bolivarTotal: AggRow[];
    bolivarColegios: AggRow[];
    actualizado: string;
}

const PAGE_SIZE = 5000;
const MAX_PAGES = 40; // tope de seguridad (200.000 filas agregadas)

// Las columnas del dataset son texto: hay que castearlas antes de promediar.
const CASTS = [
    "PUNT_INGLES::number AS i",
    "PUNT_MATEMATICAS::number AS m",
    "PUNT_SOCIALES_CIUDADANAS::number AS s",
    "PUNT_C_NATURALES::number AS c",
    "PUNT_LECTURA_CRITICA::number AS l",
    "PUNT_GLOBAL::number AS g",
].join(", ");

// El servidor entrega el número final: promedio del año, redondeado a 2 decimales.
const AVERAGES = [
    "round(avg(i), 2) AS punt_ingles",
    "round(avg(m), 2) AS punt_matematicas",
    "round(avg(s), 2) AS punt_sociales_ciudadanas",
    "round(avg(c), 2) AS punt_c_naturales",
    "round(avg(l), 2) AS punt_lectura_critica",
    "round(avg(g), 2) AS punt_global",
    "count(*) AS estudiantes",
].join(", ");

/**
 * Consulta agregada por año (y opcionalmente por una categoría).
 * Usa la sintaxis "pipe" de SoQL: primero castear y recortar el año del período
 * ("20224" -> "2022"), después agrupar.
 */
function buildQuery(categoria?: string, where?: string): string {
    const dims = categoria ? "anio, categoria" : "anio";
    const select = categoria
        ? `substring(PERIODO, 1, 4) AS anio, ${categoria} AS categoria`
        : "substring(PERIODO, 1, 4) AS anio";
    // Antes de 2014-2 el examen tenía otra escala y no existe PUNT_GLOBAL.
    const filtro = ["PUNT_GLOBAL IS NOT NULL", where].filter(Boolean).join(" AND ");

    return (
        `SELECT ${select}, ${CASTS} WHERE ${filtro}` +
        ` |> SELECT ${dims}, ${AVERAGES} GROUP BY ${dims} ORDER BY ${dims}`
    );
}

/** Trae todas las páginas de una consulta. */
async function queryAll(soql: string): Promise<Record<string, string>[]> {
    const rows: Record<string, string>[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
        const text = await fetchDatos(soql, page, PAGE_SIZE);
        if (!text) break;

        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
            throw new Error(`La API respondió un error: ${text.slice(0, 200)}`);
        }

        rows.push(...parsed);
        if (parsed.length < PAGE_SIZE) break;
    }

    return rows;
}

const num = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/** Solo cambia los nombres de los campos; los números vienen calculados. */
function toRows(raw: Record<string, string>[], categoriaPorDefecto = ""): AggRow[] {
    return raw.map((row) => ({
        anio: String(row.anio ?? ""),
        categoria: row.categoria ?? categoriaPorDefecto,
        estudiantes: num(row.estudiantes),
        punt_ingles: num(row.punt_ingles),
        punt_matematicas: num(row.punt_matematicas),
        punt_sociales_ciudadanas: num(row.punt_sociales_ciudadanas),
        punt_c_naturales: num(row.punt_c_naturales),
        punt_lectura_critica: num(row.punt_lectura_critica),
        punt_global: num(row.punt_global),
    }));
}

const BOLIVAR = "COLE_DEPTO_UBICACION = 'BOLIVAR'";

/** Descarga todo lo publicado, desde 2014 hasta el último período disponible. */
export async function loadAllData(): Promise<DataBundle> {
    const [
        naturaleza,
        estrato,
        educacionMadre,
        educacionPadre,
        genero,
        nacional,
        bolivarTotal,
        bolivarColegios,
    ] = await Promise.all([
        queryAll(buildQuery("COLE_NATURALEZA")),
        queryAll(buildQuery("FAMI_ESTRATOVIVIENDA")),
        queryAll(buildQuery("FAMI_EDUCACIONMADRE")),
        queryAll(buildQuery("FAMI_EDUCACIONPADRE")),
        queryAll(buildQuery("ESTU_GENERO")),
        queryAll(buildQuery()),
        queryAll(buildQuery(undefined, BOLIVAR)),
        queryAll(buildQuery("COLE_NOMBRE_ESTABLECIMIENTO", BOLIVAR)),
    ]);

    const nacionalRows = toRows(nacional, "PROMEDIO COLOMBIA");

    return {
        formato: FORMATO_DATOS,
        years: nacionalRows.map((row) => Number(row.anio)).filter(Number.isFinite),
        naturaleza: toRows(naturaleza),
        estrato: toRows(estrato, "SIN ESPECIFICAR"),
        educacionMadre: toRows(educacionMadre, "SIN ESPECIFICAR"),
        educacionPadre: toRows(educacionPadre, "SIN ESPECIFICAR"),
        genero: toRows(genero, "NO INFORMA"),
        nacional: nacionalRows,
        bolivarTotal: toRows(bolivarTotal, "PROMEDIO BOLIVAR"),
        bolivarColegios: toRows(bolivarColegios),
        actualizado: new Date().toISOString(),
    };
}
