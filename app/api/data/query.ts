export const fetchDatos = async (query: string) => {
    const res = await fetch("/api/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    });

    const data = await res.text();
    return data;
};