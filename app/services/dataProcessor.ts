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

export const processGlobalScoreByNaturaleza = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            naturaleza: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        // Normalize period
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return;
        const periodo = rawPeriodo.slice(0, -1);

        const naturaleza = item.cole_naturaleza;
        if (!naturaleza) return;

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;

        // Group by Naturaleza
        const key = `${naturaleza}-${periodo}`;
        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                naturaleza,
                periodo
            };
        }
        groups[key].sum += val;
        groups[key].count++;

        // Group by Total (All natures)
        const totalKey = `TOTAL-${periodo}`;
        if (!groups[totalKey]) {
            groups[totalKey] = {
                sum: 0,
                count: 0,
                naturaleza: 'TOTAL',
                periodo
            };
        }
        groups[totalKey].sum += val;
        groups[totalKey].count++;
    });

    return Object.values(groups).map(group => ({
        name: group.naturaleza,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};

export const processByEstablecimiento = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            sum: { [key: string]: number },
            count: number,
            establecimiento: string,
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
        // Normalize period
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return;
        const periodo = rawPeriodo.slice(0, -1);

        // Filter by Bolivar
        if (item.cole_depto_ubicacion !== 'BOLIVAR') return;

        const establecimiento = item.cole_nombre_establecimiento;
        if (!establecimiento) return;

        const key = `${establecimiento}-${periodo}`;
        const bolivarKey = `PROMEDIO BOLIVAR-${periodo}`;

        // Individual School Group
        if (!groups[key]) {
            groups[key] = {
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                establecimiento,
                periodo
            };
        }

        // Bolivar Average Group
        if (!groups[bolivarKey]) {
            groups[bolivarKey] = {
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                establecimiento: 'PROMEDIO BOLIVAR',
                periodo
            };
        }

        groups[key].count++;
        groups[bolivarKey].count++;

        subjects.forEach(sub => {
            const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
            groups[key].sum[sub] += val;
            groups[bolivarKey].sum[sub] += val;
        });
    });

    return Object.values(groups).map(group => {
        const averages = subjects.map(sub => {
            return parseFloat((group.sum[sub] / group.count).toFixed(2));
        });

        return {
            name: group.establecimiento,
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
};

export const processGlobalScoreByEstablecimiento = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            establecimiento: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        // Normalize period
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return;
        const periodo = rawPeriodo.slice(0, -1);

        // Filter by Bolivar
        if (item.cole_depto_ubicacion !== 'BOLIVAR') return;

        const establecimiento = item.cole_nombre_establecimiento;
        if (!establecimiento) return;

        // Individual School
        const key = `${establecimiento}-${periodo}`;
        const bolivarKey = `PROMEDIO BOLIVAR-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                establecimiento,
                periodo
            };
        }

        // Bolivar Average
        if (!groups[bolivarKey]) {
            groups[bolivarKey] = {
                sum: 0,
                count: 0,
                establecimiento: 'PROMEDIO BOLIVAR',
                periodo
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;

        groups[key].sum += val;
        groups[key].count++;

        groups[bolivarKey].sum += val;
        groups[bolivarKey].count++;
    });

    return Object.values(groups).map(group => ({
        name: group.establecimiento,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};

export const processByEstablecimientoNational = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            sum: { [key: string]: number },
            count: number,
            establecimiento: string,
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
        // Normalize period
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return;
        const periodo = rawPeriodo.slice(0, -1);

        const establecimiento = item.cole_nombre_establecimiento;
        if (!establecimiento) return;

        const nationalKey = `PROMEDIO COLOMBIA-${periodo}`;

        // National Average Group (All data)
        if (!groups[nationalKey]) {
            groups[nationalKey] = {
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                establecimiento: 'PROMEDIO COLOMBIA',
                periodo
            };
        }
        groups[nationalKey].count++;
        subjects.forEach(sub => {
            const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
            groups[nationalKey].sum[sub] += val;
        });

        // Individual School (Only Bolivar)
        if (item.cole_depto_ubicacion === 'BOLIVAR') {
            const key = `${establecimiento}-${periodo}`;
            if (!groups[key]) {
                groups[key] = {
                    sum: {
                        PUNT_INGLES: 0,
                        PUNT_MATEMATICAS: 0,
                        PUNT_SOCIALES_CIUDADANAS: 0,
                        PUNT_C_NATURALES: 0,
                        PUNT_LECTURA_CRITICA: 0
                    },
                    count: 0,
                    establecimiento,
                    periodo
                };
            }
            groups[key].count++;
            subjects.forEach(sub => {
                const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
                groups[key].sum[sub] += val;
            });
        }
    });

    return Object.values(groups).map(group => {
        const averages = subjects.map(sub => {
            return parseFloat((group.sum[sub] / group.count).toFixed(2));
        });

        return {
            name: group.establecimiento,
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
};

export const processGlobalScoreByEstablecimientoNational = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            establecimiento: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        // Normalize period
        const rawPeriodo = String(item.periodo || '');
        if (rawPeriodo.length < 5) return;
        const periodo = rawPeriodo.slice(0, -1);

        const establecimiento = item.cole_nombre_establecimiento;
        if (!establecimiento) return;

        const nationalKey = `PROMEDIO COLOMBIA-${periodo}`;

        // National Average
        if (!groups[nationalKey]) {
            groups[nationalKey] = {
                sum: 0,
                count: 0,
                establecimiento: 'PROMEDIO COLOMBIA',
                periodo
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
        groups[nationalKey].sum += val;
        groups[nationalKey].count++;

        // Individual School (Only Bolivar)
        if (item.cole_depto_ubicacion === 'BOLIVAR') {
            const key = `${establecimiento}-${periodo}`;
            if (!groups[key]) {
                groups[key] = {
                    sum: 0,
                    count: 0,
                    establecimiento,
                    periodo
                };
            }
            groups[key].sum += val;
            groups[key].count++;
        }
    });

    return Object.values(groups).map(group => ({
        name: group.establecimiento,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};
export const processByEstrato = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            sum: { [key: string]: number },
            count: number,
            estrato: string,
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
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const estrato = item.fami_estratovivienda || item.FAMI_ESTRATOVIVIENDA || 'SIN ESPECIFICAR';

        const key = `${estrato}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                estrato,
                periodo
            };
        }

        groups[key].count++;

        subjects.forEach(sub => {
            const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
            groups[key].sum[sub] += val;
        });
    });

    return Object.values(groups).map(group => {
        const averages = subjects.map(sub => {
            return parseFloat((group.sum[sub] / group.count).toFixed(2));
        });

        return {
            name: group.estrato,
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
};

export const processGlobalScoreByEstrato = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            estrato: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const estrato = item.fami_estratovivienda || item.FAMI_ESTRATOVIVIENDA || 'SIN ESPECIFICAR';

        const key = `${estrato}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                estrato,
                periodo
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
        groups[key].sum += val;
        groups[key].count++;
    });

    return Object.values(groups).map(group => ({
        name: group.estrato,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};
export const processGlobalScoreByEducationPadre = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            educacion: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const educacion = item.fami_educacionpadre || item.FAMI_EDUCACIONPADRE || 'SIN ESPECIFICAR';

        const key = `${educacion}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                educacion,
                periodo
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
        groups[key].sum += val;
        groups[key].count++;
    });

    return Object.values(groups).map(group => ({
        name: group.educacion,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};

export const processGlobalScoreByEducationMadre = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            educacion: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const educacion = item.fami_educacionmadre || item.FAMI_EDUCACIONMADRE || 'SIN ESPECIFICAR';

        const key = `${educacion}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                educacion,
                periodo
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
        groups[key].sum += val;
        groups[key].count++;
    });

    return Object.values(groups).map(group => ({
        name: group.educacion,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};

export const processBolivarVsNationalAreas = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            sum: { [key: string]: number },
            count: number,
            region: string,
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
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const isBolivar = (item.cole_depto_ubicacion || item.COLE_DEPTO_UBICACION) === 'BOLIVAR';

        const keys = [`PROMEDIO COLOMBIA-${periodo}`];
        if (isBolivar) keys.push(`PROMEDIO BOLIVAR-${periodo}`);

        keys.forEach(key => {
            if (!groups[key]) {
                groups[key] = {
                    sum: {
                        PUNT_INGLES: 0,
                        PUNT_MATEMATICAS: 0,
                        PUNT_SOCIALES_CIUDADANAS: 0,
                        PUNT_C_NATURALES: 0,
                        PUNT_LECTURA_CRITICA: 0
                    },
                    count: 0,
                    region: key.split('-')[0],
                    periodo
                };
            }

            groups[key].count++;
            subjects.forEach(sub => {
                const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
                groups[key].sum[sub] += val;
            });
        });
    });

    return Object.values(groups).map(group => {
        const averages = subjects.map(sub => {
            return parseFloat((group.sum[sub] / group.count).toFixed(2));
        });

        return {
            name: group.region,
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
};

export const processBolivarVsNationalGlobal = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            region: string,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const isBolivar = (item.cole_depto_ubicacion || item.COLE_DEPTO_UBICACION) === 'BOLIVAR';

        const keys = [`PROMEDIO COLOMBIA-${periodo}`];
        if (isBolivar) keys.push(`PROMEDIO BOLIVAR-${periodo}`);

        keys.forEach(key => {
            if (!groups[key]) {
                groups[key] = {
                    sum: 0,
                    count: 0,
                    region: key.split('-')[0],
                    periodo
                };
            }

            const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
            groups[key].sum += val;
            groups[key].count++;
        });
    });

    return Object.values(groups).map(group => ({
        name: group.region,
        avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
        PERIODO: group.periodo
    }));
};

export const processEvolutionGlobal = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            sum: number,
            count: number,
            periodo: string,
            name: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;
        const name = item.cole_nombre_establecimiento || item.COLE_NOMBRE_ESTABLECIMIENTO || 'UNKNOWN';

        const key = `${name}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: 0,
                count: 0,
                periodo,
                name
            };
        }

        const val = parseFloat(item.punt_global) || parseFloat(item.PUNT_GLOBAL) || 0;
        groups[key].sum += val;
        groups[key].count++;
    });

    return Object.values(groups)
        .sort((a, b) => a.periodo.localeCompare(b.periodo))
        .map(group => ({
            name: group.name,
            avgGlobal: parseFloat((group.sum / group.count).toFixed(2)),
            PERIODO: group.periodo
        }));
};

export const processEvolutionAreas = (data: any[]): ProcessedData[] => {
    const groups: {
        [key: string]: {
            sum: { [key: string]: number },
            count: number,
            periodo: string,
            name: string
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
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;
        const name = item.cole_nombre_establecimiento || item.COLE_NOMBRE_ESTABLECIMIENTO || 'UNKNOWN';

        const key = `${name}-${periodo}`;

        if (!groups[key]) {
            groups[key] = {
                sum: {
                    PUNT_INGLES: 0,
                    PUNT_MATEMATICAS: 0,
                    PUNT_SOCIALES_CIUDADANAS: 0,
                    PUNT_C_NATURALES: 0,
                    PUNT_LECTURA_CRITICA: 0
                },
                count: 0,
                periodo,
                name
            };
        }

        groups[key].count++;
        subjects.forEach(sub => {
            const val = parseFloat(item[sub.toLowerCase()]) || parseFloat(item[sub]) || 0;
            groups[key].sum[sub] += val;
        });
    });

    return Object.values(groups)
        .sort((a, b) => a.periodo.localeCompare(b.periodo))
        .map(group => {
            const averages = subjects.map(sub => {
                return parseFloat((group.sum[sub] / group.count).toFixed(2));
            });

            return {
                name: group.name,
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
};

export const processByGender = (data: any[]): any[] => {
    const groups: {
        [key: string]: {
            counts: { [key: string]: number },
            total: number,
            periodo: string
        }
    } = {};

    if (!data || !Array.isArray(data)) return [];

    data.forEach(item => {
        const rawPeriodo = String(item.periodo || item.PERIODO || '');
        if (rawPeriodo.length < 4) return;
        const periodo = rawPeriodo.length === 5 ? rawPeriodo.slice(0, -1) : rawPeriodo;

        const genero = (item.estu_genero || item.ESTU_GENERO || 'NO INFORMA').toUpperCase();

        if (!groups[periodo]) {
            groups[periodo] = {
                counts: {},
                total: 0,
                periodo
            };
        }

        groups[periodo].counts[genero] = (groups[periodo].counts[genero] || 0) + 1;
        groups[periodo].total++;
    });

    return Object.values(groups).map(group => ({
        name: "Género",
        data: Object.entries(group.counts).map(([label, count]) => ({
            label,
            count,
            percentage: parseFloat(((count / group.total) * 100).toFixed(2))
        })),
        PERIODO: group.periodo
    }));
};
