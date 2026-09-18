/**
 * Se pide por GET (y no por POST) para que el navegador pueda reutilizar la
 * respuesta desde su propia caché: recargar la página no vuelve a descargar.
 */
export const fetchDatos = async (query: string, pageNumber = 1, pageSize = 5000) => {
    const params = new URLSearchParams({
        query,
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
    });

    const res = await fetch(`/api/data?${params.toString()}`);
    return res.text();
};
