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

interface BarChartSelectProps {
    data: DataItem[];
    options: string[]; // Corresponds to 'name' in DataItem
}

export default function BarChartSelect({ data, options }: BarChartSelectProps) {
    // State for selections
    const [selectedYear, setSelectedYear] = useState<number>(2014);
    const [selectedOption, setSelectedOption] = useState<string>(options[0] || '');

    // Reset option if options prop changes
    React.useEffect(() => {
        if (options.length > 0 && !options.includes(selectedOption)) {
            setSelectedOption(options[0]);
        }
    }, [options, selectedOption]);

    // Find the specific item based on selection
    const currentItem = useMemo(() => {
        if (!data) return null;
        // Compare PERIODO (string) with selectedYear (number) loosely or by converting
        return data.find(item => item.name === selectedOption && String(item.PERIODO) === String(selectedYear));
    }, [data, selectedOption, selectedYear]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!currentItem) {
            return {
                labels: [],
                datasets: [],
            };
        }

        return {
            labels: currentItem.label,
            datasets: [
                {
                    label: selectedOption,
                    data: currentItem.datos,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
            ],
        };
    }, [currentItem, selectedOption]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${selectedOption} - ${selectedYear}`,
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
                {/* Controls Row */}
                <div className="flex flex-wrap items-end gap-6">
                    {/* Option Select */}
                    <div className="flex flex-col min-w-[200px] flex-1">
                        <label htmlFor="option-select" className="text-xs text-gray-500 font-medium mb-1 uppercase">Metric</label>
                        <select
                            id="option-select"
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Slider */}
                    <div className="flex flex-col flex-[2] min-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                             <label htmlFor="year-slider" className="text-xs text-gray-500 font-medium uppercase">Year</label>
                             <span className="text-sm font-bold text-primary">{selectedYear}</span>
                        </div>
                        <input
                            id="year-slider"
                            type="range"
                            min="2014"
                            max="2025"
                            step="1"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>2014</span>
                            <span>2025</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
                {currentItem ? (
                    <Bar options={chartOptions} data={chartData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No data found for {selectedOption} in {selectedYear}
                    </div>
                )}
            </div>
        </div>
    );
}
