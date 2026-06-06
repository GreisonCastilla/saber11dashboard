'use client';

import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title
);

interface GenderData {
    label: string;
    count: number;
    percentage: number;
}

interface PeriodData {
    name: string;
    data: GenderData[];
    PERIODO: string;
}

interface PieChartProps {
    data: PeriodData[];
    onYearChange?: (option: string, year: number) => void;
}

export default function PieChart({ data, onYearChange }: PieChartProps) {
    const [selectedYear, setSelectedYear] = useState<number>(2014);

    const currentData = useMemo(() => {
        if (!data) return null;
        return data.find(item => String(item.PERIODO) === String(selectedYear));
    }, [data, selectedYear]);

    const chartData = useMemo(() => {
        if (!currentData) return { labels: [], datasets: [] };

        const colors = currentData.data.map(d => {
            const labelUpper = d.label.trim().toUpperCase();
            if (labelUpper === 'F' || labelUpper === 'FEMENINO' || labelUpper === 'FEMALE') {
                return {
                    bg: 'rgba(255, 99, 132, 0.5)', // Rojo
                    border: 'rgba(255, 99, 132, 1)'
                };
            } else if (labelUpper === 'M' || labelUpper === 'MASCULINO' || labelUpper === 'MALE') {
                return {
                    bg: 'rgba(53, 162, 235, 0.5)', // Azul
                    border: 'rgba(53, 162, 235, 1)'
                };
            } else {
                return {
                    bg: 'rgba(201, 203, 207, 0.5)', // Gris de reserva
                    border: 'rgba(201, 203, 207, 1)'
                };
            }
        });

        return {
            labels: currentData.data.map(d => d.label),
            datasets: [
                {
                    data: currentData.data.map(d => d.percentage),
                    backgroundColor: colors.map(c => c.bg),
                    borderColor: colors.map(c => c.border),
                    borderWidth: 1,
                },
            ],
        };
    }, [currentData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Distribución por Género - ${selectedYear}`,
            },
            tooltip: {
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: (context: any) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        },
    };

    if (!data || data.length === 0) {
        return <div className="p-4 text-center">No data available</div>;
    }

    return (
        <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex-grow w-full min-h-0 relative mb-4">
                {currentData ? (
                    <Pie options={chartOptions} data={chartData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No hay datos para el año {selectedYear}
                    </div>
                )}
            </div>

            {/* Year Slider */}
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-1">
                        <label htmlFor="year-slider-pie" className="text-xs text-gray-500 font-medium uppercase">año</label>
                        <span className="text-sm font-bold text-primary">{selectedYear}</span>
                </div>
                <input
                    id="year-slider-pie"
                    type="range"
                    min="2014"
                    max="2022"
                    step="1"
                    value={selectedYear}
                    onChange={(e) => {
                        const year = Number(e.target.value);
                        setSelectedYear(year);
                        if (onYearChange) onYearChange("", year);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>2014</span>
                    <span>2022</span>
                </div>
            </div>
        </div>
    );
}
