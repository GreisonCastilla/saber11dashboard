export interface ProcessedData {
    name: string;
    label: string[];
    datos: number[];
    PERIODO: string;
}

export const processByNaturaleza = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            ids: any[],
            sum: { [key: string]: number },
            count: number,
            naturaleza: string,
            periodo: string
        }
    } = {};

    const subjects = [
        'PUNT_INGLES',
        'PUNT_MATEMATICAS',
        'PUNT_SOCIALES_CIUDADANAS',
        'PUNT_C_NATURALES',
        'PUNT_LECTURA_CRITICA'
    ];

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        // Normalize period: remove last char (e.g. "20142" -> "2014")
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return; // Skip invalid periods
        const periodo = rawPeriodo.slice(0, -1);

        const naturaleza = item.cole_naturaleza;
        if (!naturaleza) return;

        const key = `${naturaleza}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                ids: [],
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                naturaleza,
                periodo
            };
        }

        groups[key].ids.push(item);
        groups[key].count++;

        subjects.forEach(sub => {
            const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
            groups[key].sum[sub] += val;
        });
    });

    const result: ProcessedData[] = Object.values(groups).map(group => {
        const averages = subjects.map(sub => {
            return parseFloat((group.sum[sub] / group.count).toFixed(2));
        });

        return {
            name: group.naturaleza,
            label: [
                'Ingles',
                'Matematicas',
                'Sociales',
                'Ciencias naturales',
                'Lectura critica'
            ],
            datos: averages,
            PERIODO: group.periodo
        };
    });

    return result;
};
