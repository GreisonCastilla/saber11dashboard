'use client';

import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DataItem {
    name: string;
    label: string[];
    datos: number[];
    PERIODO: string;
}

interface BarChartGroupedProps {
    data: DataItem[];
}

export default function BarChartGrouped({ data }: BarChartGroupedProps) {
    // State for selections
    const [selectedYear, setSelectedYear] = useState<number>(2014);

    // Filter items based on selection
    const currentItems = useMemo(() => {
        if (!data) return [];
        return data.filter(item => String(item.PERIODO) === String(selectedYear));
    }, [data, selectedYear]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!currentItems || currentItems.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        // Use labels from the first item (assuming all have same structure)
        const labels = currentItems[0].label;

        const datasets = currentItems.map(item => {
            let color = 'rgba(128, 128, 128, 0.5)'; // Default grey
            if (item.name === 'OFICIAL') color = 'rgba(53, 162, 235, 0.5)'; // Blue
            else if (item.name === 'NO OFICIAL') color = 'rgba(255, 99, 132, 0.5)'; // Red
            
            return {
                label: item.name,
                data: item.datos,
                backgroundColor: color,
            };
        });

        // Ensure distinct colors if not matched by name? 
        // For now, hardcoded names cover the use case.

        return {
            labels,
            datasets: datasets,
        };
    }, [currentItems]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Comparativa por Áreas - ${selectedYear}`,
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    if (!data || data.length === 0) {
        return <div className="p-4 text-center">No data available</div>;
    }

    return (
        <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex flex-col gap-4 mb-4">
                {/* Years only, no option selector */}
                <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center mb-1">
                            <label htmlFor="year-slider-grouped" className="text-xs text-gray-500 font-medium uppercase">Year</label>
                            <span className="text-sm font-bold text-primary">{selectedYear}</span>
                    </div>
                    <input
                        id="year-slider-grouped"
                        type="range"
                        min="2014"
                        max="2022"
                        step="1"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>2014</span>
                        <span>2022</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
                {currentItems.length > 0 ? (
                    <Bar options={chartOptions} data={chartData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No data found for {selectedYear}
                    </div>
                )}
            </div>
        </div>
    );
}
