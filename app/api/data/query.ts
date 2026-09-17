export const fetchDatos = async (query: string, pageNumber = 1, pageSize = 5000) => {
    const res = await fetch("/api/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, pageNumber, pageSize }),
    });

    const data = await res.text();
    return data;
};
