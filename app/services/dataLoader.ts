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
    /**
     * Antes del período 2014-2 el examen no daba puntaje global y solo evaluaba
     * inglés y matemáticas: esas áreas llegan en `null`, que no es lo mismo que
     * un cero.
     */
    punt_ingles: number | null;
    punt_matematicas: number | null;
    punt_sociales_ciudadanas: number | null;
    punt_c_naturales: number | null;
    punt_lectura_critica: number | null;
    punt_global: number | null;
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
function buildQuery(categoria?: string, where?: string, soloConGlobal = true): string {
    const dims = categoria ? "anio, categoria" : "anio";
    const select = categoria
        ? `substring(PERIODO, 1, 4) AS anio, ${categoria} AS categoria`
        : "substring(PERIODO, 1, 4) AS anio";
    // Los cortes que alimentan los deslizadores de año se quedan con los períodos
    // que tienen puntaje global (2014-2 en adelante); la evolución por colegio sí
    // incluye los años anteriores, con inglés y matemáticas, que es lo que hay.
    const filtro = [soloConGlobal ? "PUNT_GLOBAL IS NOT NULL" : "", where]
        .filter(Boolean)
        .join(" AND ");
    const donde = filtro ? ` WHERE ${filtro}` : "";

    return (
        `SELECT ${select}, ${CASTS}${donde}` +
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

/** El área que no se evaluó ese año queda en null, para dejar un hueco en la gráfica. */
const numeroONulo = (value: unknown) => {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

/** Solo cambia los nombres de los campos; los números vienen calculados. */
function toRows(raw: Record<string, string>[], categoriaPorDefecto = ""): AggRow[] {
    return raw.map((row) => ({
        anio: String(row.anio ?? ""),
        categoria: row.categoria ?? categoriaPorDefecto,
        estudiantes: num(row.estudiantes),
        punt_ingles: numeroONulo(row.punt_ingles),
        punt_matematicas: numeroONulo(row.punt_matematicas),
        punt_sociales_ciudadanas: numeroONulo(row.punt_sociales_ciudadanas),
        punt_c_naturales: numeroONulo(row.punt_c_naturales),
        punt_lectura_critica: numeroONulo(row.punt_lectura_critica),
        punt_global: numeroONulo(row.punt_global),
    }));
}

const BOLIVAR = "COLE_DEPTO_UBICACION = 'BOLIVAR'";

/** Cortes a descargar. El de colegios es el más pesado y llega de último. */
const CONSULTAS: {
    clave: keyof Pick<DataBundle, "naturaleza" | "estrato" | "educacionMadre" | "educacionPadre"
        | "genero" | "nacional" | "bolivarTotal" | "bolivarColegios">;
    soql: string;
    porDefecto?: string;
}[] = [
    { clave: "nacional", soql: buildQuery(undefined), porDefecto: "PROMEDIO COLOMBIA" },
    { clave: "bolivarTotal", soql: buildQuery(undefined, BOLIVAR), porDefecto: "PROMEDIO BOLIVAR" },
    { clave: "naturaleza", soql: buildQuery("COLE_NATURALEZA") },
    { clave: "genero", soql: buildQuery("ESTU_GENERO"), porDefecto: "NO INFORMA" },
    { clave: "estrato", soql: buildQuery("FAMI_ESTRATOVIVIENDA"), porDefecto: "SIN ESPECIFICAR" },
    { clave: "educacionMadre", soql: buildQuery("FAMI_EDUCACIONMADRE"), porDefecto: "SIN ESPECIFICAR" },
    { clave: "educacionPadre", soql: buildQuery("FAMI_EDUCACIONPADRE"), porDefecto: "SIN ESPECIFICAR" },
    { clave: "bolivarColegios", soql: buildQuery("COLE_NOMBRE_ESTABLECIMIENTO", BOLIVAR, false) },
];

function bundleVacio(): DataBundle {
    return {
        formato: FORMATO_DATOS,
        years: [],
        naturaleza: [],
        estrato: [],
        educacionMadre: [],
        educacionPadre: [],
        genero: [],
        nacional: [],
        bolivarTotal: [],
        bolivarColegios: [],
        actualizado: new Date().toISOString(),
    };
}

/**
 * Copia en memoria para que los gráficos no tengan que releer (y volver a
 * deserializar) el paquete completo desde IndexedDB cada uno por su cuenta.
 */
let enMemoria: DataBundle | null = null;

export const getBundle = () => enMemoria;

export function setBundle(bundle: DataBundle) {
    enMemoria = bundle;
    window.dispatchEvent(new Event("datos-actualizados"));
}

/**
 * Descarga todo lo publicado, desde 2014 hasta el último período disponible.
 *
 * Las consultas corren en paralelo y `onAvance` se llama con lo que ya llegó,
 * así cada gráfico se pinta apenas tiene sus datos en vez de esperar a que
 * termine la consulta más pesada (la de los 506 colegios de Bolívar).
 */
export async function loadAllData(onAvance?: (parcial: DataBundle) => void): Promise<DataBundle> {
    const bundle = bundleVacio();

    await Promise.all(
        CONSULTAS.map(async ({ clave, soql, porDefecto }) => {
            const filas = toRows(await queryAll(soql), porDefecto);
            bundle[clave] = filas;

            if (clave === "nacional") {
                bundle.years = filas.map((row) => Number(row.anio)).filter(Number.isFinite);
            }

            onAvance?.({ ...bundle });
        })
    );

    bundle.actualizado = new Date().toISOString();
    return bundle;
}
