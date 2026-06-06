'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
    datos?: number[];
    avgGlobal?: number;
    PERIODO: string;
}

interface LineChartSelectProps {
    data: DataItem[];
    options: string[];
    isGlobal?: boolean;
    onOptionSelect?: (option: string, year: number) => void;
}

export default function LineChartSelect({ data, options, isGlobal = false, onOptionSelect }: LineChartSelectProps) {
    const [selectedOption, setSelectedOption] = useState<string>(options[0] || '');

    useEffect(() => {
        if (options.length > 0 && !options.includes(selectedOption)) {
            setSelectedOption(options[0]);
        }
    }, [options, selectedOption]);

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
        const labels = Array.from(new Set(filteredData.map(item => item.PERIODO))).sort();

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
            const subjects = data[0]?.label || [];
            const colors = [
                'rgb(53, 162, 235)',   // Blue
                'rgb(255, 99, 132)',   // Red
                'rgb(75, 192, 192)',   // Green
                'rgb(255, 205, 86)',   // Yellow
                'rgb(153, 102, 255)'   // Purple
            ];

            const datasets = subjects.map((subject, idx) => {
                const values = labels.map(period => {
                    const item = data.find(d => d.PERIODO === period);
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
    }, [data, isGlobal]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${isGlobal ? 'Evolución Promedio Global' : 'Evolución por Áreas'} - ${selectedOption}`,
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
                            setSelectedOption(value);
                            if (onOptionSelect) onOptionSelect(value, 0); // Year 0 or similar to indicate all history
                        }}
                        placeholder="Seleccionar colegio..."
                    />
                </div>
            </div>
            
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
