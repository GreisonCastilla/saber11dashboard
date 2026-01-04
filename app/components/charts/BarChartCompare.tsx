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

interface CompareDataItem {
    name: string;
    avgGlobal: number;
    PERIODO: string;
}

interface BarChartCompareProps {
    data: CompareDataItem[];
    onYearChange?: (year: number) => void;
}

export default function BarChartCompare({ data, onYearChange }: BarChartCompareProps) {
    // State for selections
    const [selectedYear, setSelectedYear] = useState<number>(2014);

    // Filter data based on selection
    const currentItems = useMemo(() => {
        if (!data) return [];
        return data.filter(item => String(item.PERIODO) === String(selectedYear));
    }, [data, selectedYear]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        // We expect official and non-official items
        const oficialItem = currentItems.find(i => i.name === 'OFICIAL');
        const noOficialItem = currentItems.find(i => i.name === 'NO OFICIAL');
        const totalItem = currentItems.find(i => i.name === 'TOTAL');

        const oficialVal = oficialItem ? oficialItem.avgGlobal : 0;
        const noOficialVal = noOficialItem ? noOficialItem.avgGlobal : 0;
        const totalVal = totalItem ? totalItem.avgGlobal : 0;

        return {
            labels: ['OFICIAL', 'NO OFICIAL', 'TOTAL'],
            datasets: [
                {
                    label: 'Promedio Global',
                    data: [oficialVal, noOficialVal, totalVal],
                    backgroundColor: [
                        'rgba(53, 162, 235, 0.5)', // Blue for Oficial
                        'rgba(255, 99, 132, 0.5)', // Red for No Oficial
                        'rgba(153, 102, 255, 0.5)', // Purple for Total
                    ],
                },
            ],
        };
    }, [currentItems]);

    const chartOptions = {
        indexAxis: 'y' as const, // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Promedio Global: Oficial vs No Oficial - ${selectedYear}`,
            },
        },
        scales: {
            x: {
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
                {/* Year Slider Only */}
                <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center mb-1">
                            <label htmlFor="year-slider-compare" className="text-xs text-gray-500 font-medium uppercase">Year</label>
                            <span className="text-sm font-bold text-primary">{selectedYear}</span>
                    </div>
                    <input
                        id="year-slider-compare"
                        type="range"
                        min="2014"
                        max="2022"
                        step="1"
                        value={selectedYear}
                        onChange={(e) => {
                            const year = Number(e.target.value);
                            setSelectedYear(year);
                            if (onYearChange) onYearChange(year);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>2014</span>
                        <span>2022</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
                 <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
}
