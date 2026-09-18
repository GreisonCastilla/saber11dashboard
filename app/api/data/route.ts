import { gzipSync } from "zlib";

const ORIGEN = "https://www.datos.gov.co/api/v3/views/kgxf-xxbe/query.json";

/**
 * Los resultados solo cambian cuando el ICFES publica un período nuevo, y las
 * consultas agregadas recorren 7,1 millones de registros: la primera vez
 * datos.gov.co puede tardar decenas de segundos. Guardarlas aquí hace que ese
 * costo se pague una sola vez y no en cada visita.
 */
const TTL_MS = 12 * 60 * 60 * 1000;
const MAX_ENTRADAS = 32;

interface Entrada {
    expira: number;
    texto: string;
    comprimido: Buffer;
}

const cache = new Map<string, Entrada>();
// Si llegan dos peticiones iguales a la vez, se comparte la misma consulta.
const enVuelo = new Map<string, Promise<Entrada>>();

async function consultarOrigen(query: string, pageNumber: number, pageSize: number): Promise<Entrada> {
    const respuesta = await fetch(ORIGEN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-App-Token": process.env.DATA_GOV_TOKEN || "",
        },
        body: JSON.stringify({
            query,
            page: { pageNumber, pageSize },
            includeSynthetic: false,
        }),
    });

    const texto = await respuesta.text();
    return {
        texto,
        comprimido: gzipSync(texto),
        expira: Date.now() + TTL_MS,
    };
}

async function obtener(clave: string, query: string, pageNumber: number, pageSize: number): Promise<Entrada> {
    const guardada = cache.get(clave);
    if (guardada && guardada.expira > Date.now()) return guardada;

    const pendiente = enVuelo.get(clave);
    if (pendiente) return pendiente;

    const promesa = consultarOrigen(query, pageNumber, pageSize)
        .then((entrada) => {
            // Solo se guarda lo que salió bien: un error no debe quedar cacheado.
            if (entrada.texto.startsWith("[")) {
                if (cache.size >= MAX_ENTRADAS) cache.delete(cache.keys().next().value as string);
                cache.set(clave, entrada);
            }
            return entrada;
        })
        .finally(() => enVuelo.delete(clave));

    enVuelo.set(clave, promesa);
    return promesa;
}

function responder(entrada: Entrada, req: Request): Response {
    const cabeceras: Record<string, string> = {
        "Content-Type": "application/json; charset=utf-8",
        // El navegador puede reutilizar la respuesta sin volver a pedirla.
        "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
    };

    // Comprimir ahorra ~85% en la consulta grande (680 KB -> 100 KB).
    if ((req.headers.get("accept-encoding") || "").includes("gzip")) {
        cabeceras["Content-Encoding"] = "gzip";
        cabeceras["Vary"] = "Accept-Encoding";
        return new Response(new Uint8Array(entrada.comprimido), { status: 200, headers: cabeceras });
    }

    return new Response(entrada.texto, { status: 200, headers: cabeceras });
}

const clave = (query: string, pageNumber: number, pageSize: number) =>
    `${pageNumber}|${pageSize}|${query}`;

export async function GET(req: Request) {
    const params = new URL(req.url).searchParams;
    const query = params.get("query") || "";
    const pageNumber = Number(params.get("pageNumber")) || 1;
    const pageSize = Number(params.get("pageSize")) || 5000;

    return responder(await obtener(clave(query, pageNumber, pageSize), query, pageNumber, pageSize), req);
}

export async function POST(req: Request) {
    const { query, pageNumber, pageSize } = await req.json();
    const pagina = Number(pageNumber) || 1;
    const tamano = Number(pageSize) || 5000;

    return responder(await obtener(clave(query, pagina, tamano), query, pagina, tamano), req);
}
