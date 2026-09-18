'use client';

import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import SearchableSelect from '../ui/SearchableSelect';
import { cleanLabel } from '../../services/textUtils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface DataItem {
    name: string;
    label?: string[];
    datos?: (number | null)[];
    avgGlobal?: number | null;
    PERIODO: string;
}

interface LineChartSelectProps {
    data: DataItem[];
    options: string[];
    isGlobal?: boolean;
    onOptionSelect?: (option: string, year: number) => void;
}

export default function LineChartSelect({ data, options, isGlobal = false, onOptionSelect }: LineChartSelectProps) {
    // Elección explícita del usuario; mientras no la haya, se usa un colegio
    // que tenga historia. No todos los colegios aparecen todos los años: si se
    // arranca con el primero alfabético puede salir un solo punto, que no es
    // ninguna evolución.
    const [eleccion, setEleccion] = useState<string | null>(null);

    const selectedOption = useMemo(() => {
        if (eleccion && options.includes(eleccion)) return eleccion;

        const tieneValor = (item: DataItem) =>
            isGlobal ? item.avgGlobal != null : item.datos?.some((valor) => valor != null);

        const aniosPorColegio = new Map<string, number>();
        for (const item of data) {
            if (!tieneValor(item)) continue;
            aniosPorColegio.set(item.name, (aniosPorColegio.get(item.name) ?? 0) + 1);
        }

        let elegido = options[0] ?? '';
        let maximo = -1;
        for (const option of options) {
            const anios = aniosPorColegio.get(option) ?? 0;
            if (anios > maximo) {
                maximo = anios;
                elegido = option;
            }
        }

        return elegido;
    }, [eleccion, options, data, isGlobal]);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Filter data for selected school
        const filteredData = data.filter(item => item.name === selectedOption);
        if (filteredData.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Labels are the periods (years)
        const conGlobal = filteredData.filter(item => item.avgGlobal != null);
        const labels = Array.from(
            new Set((isGlobal ? conGlobal : filteredData).map(item => item.PERIODO))
        ).sort();

        if (isGlobal) {
            const values = labels.map(period => {
                const item = filteredData.find(d => d.PERIODO === period);
                return item ? item.avgGlobal : null;
            });

            return {
                labels,
                datasets: [
                    {
                        label: 'Promedio Global',
                        data: values,
                        borderColor: 'rgb(53, 162, 235)',
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        tension: 0.1
                    }
                ]
            };
        } else {
            // For Areas, we need multiple datasets (one per subject)
            const subjects = filteredData.find((item) => item.label?.length)?.label || [];
            const colors = [
                'rgb(53, 162, 235)',   // Blue
                'rgb(255, 99, 132)',   // Red
                'rgb(75, 192, 192)',   // Green
                'rgb(255, 205, 86)',   // Yellow
                'rgb(153, 102, 255)'   // Purple
            ];

            const datasets = subjects.map((subject, idx) => {
                const values = labels.map(period => {
                    const item = filteredData.find(d => d.PERIODO === period);
                    return item && item.datos ? item.datos[idx] : null;
                });

                return {
                    label: subject,
                    data: values,
                    borderColor: colors[idx % colors.length],
                    backgroundColor: colors[idx % colors.length].replace('rgb', 'rgba').replace(')', ', 0.5)'),
                    tension: 0.1
                };
            });

            return {
                labels,
                datasets
            };
        }
    }, [data, isGlobal, selectedOption]);

    // Avisos sobre lo que el dataset no tiene, para que un hueco no parezca un error.
    const { aniosDibujados, aniosSinGlobal, aniosIncompletos } = useMemo(() => {
        const delColegio = data.filter((item) => item.name === selectedOption);
        const anio = (item: DataItem) => item.PERIODO;

        // Antes del período 2014-2 el examen no daba puntaje global y solo
        // evaluaba inglés y matemáticas.
        const sinGlobal = Array.from(new Set(delColegio.filter((i) => i.avgGlobal == null).map(anio))).sort();
        const incompletos = Array.from(
            new Set(delColegio.filter((i) => i.datos?.some((v) => v == null)).map(anio))
        ).sort();
        const dibujados = Array.from(
            new Set(delColegio.filter((i) => (isGlobal ? i.avgGlobal != null : i.datos?.some((v) => v != null))).map(anio))
        ).sort();

        return { aniosDibujados: dibujados, aniosSinGlobal: sinGlobal, aniosIncompletos: incompletos };
    }, [data, selectedOption, isGlobal]);

    const listar = (anios: string[]) =>
        anios.length === 1 ? anios[0] : `${anios.slice(0, -1).join(', ')} y ${anios[anios.length - 1]}`;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${isGlobal ? 'Evolución Promedio Global' : 'Evolución por Áreas'} - ${cleanLabel(selectedOption)}`,
            },
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-wrap items-end gap-6">
                    <SearchableSelect
                        label="Colegio"
                        options={options}
                        value={selectedOption}
                        onChange={(value) => {
                            setEleccion(value);
                            if (onOptionSelect) onOptionSelect(value, 0); // Year 0 or similar to indicate all history
                        }}
                        placeholder="Seleccionar colegio..."
                    />
                </div>
            </div>
            
            {aniosDibujados.length === 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Este colegio solo tiene resultados de {aniosDibujados[0]} en el dataset.
                </p>
            )}

            {isGlobal && aniosSinGlobal.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    En {listar(aniosSinGlobal)} el examen todavía no daba puntaje global, así que
                    {aniosSinGlobal.length === 1 ? ' ese año no aparece' : ' esos años no aparecen'}.
                </p>
            )}

            {!isGlobal && aniosIncompletos.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    En {listar(aniosIncompletos)} el examen solo evaluaba inglés y matemáticas.
                </p>
            )}

            <div className="flex-grow w-full min-h-0 relative">
                {data.length > 0 ? (
                    <Line options={chartOptions} data={chartData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Selecciona un colegio para ver su evolución
                    </div>
                )}
            </div>
        </div>
    );
}
