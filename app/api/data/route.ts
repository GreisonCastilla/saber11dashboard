export async function POST(req: Request) {
    const { query } = await req.json();

    const response = await fetch(
        "https://www.datos.gov.co/api/v3/views/kgxf-xxbe/query.json",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-App-Token": process.env.DATA_GOV_TOKEN || "",
            },
            body: JSON.stringify({
                query,
                page: {
                    pageNumber: 1,
                    pageSize: 5000,
                },
                includeSynthetic: false,
            }),
        }
    );

    const data = await response.text();

    return new Response(data, { status: 200 });
}
