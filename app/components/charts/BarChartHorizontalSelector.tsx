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
import SearchableSelect from '../ui/SearchableSelect';

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
    avgGlobal: number;
    PERIODO: string;
}

interface BarChartHorizontalSelectorProps {
    data: DataItem[];
    options: string[];
    comparisonItemName?: string;
    onOptionSelect?: (option: string, year: number) => void;
    onYearChange?: (option: string, year: number) => void;
}

export default function BarChartHorizontalSelector({ data, options, comparisonItemName, onOptionSelect, onYearChange }: BarChartHorizontalSelectorProps) {
    // State
    const [selectedYear, setSelectedYear] = useState<number>(2014);
    const [selectedOption, setSelectedOption] = useState<string>(options[0] || '');

    // Reset option if options prop changes
    React.useEffect(() => {
        if (options.length > 0 && !options.includes(selectedOption)) {
             setSelectedOption(options[0]);
        }
    }, [options, selectedOption]);

    // Find current selected item
    const currentItem = useMemo(() => {
        if (!data) return null;
        return data.find(item => item.name === selectedOption && String(item.PERIODO) === String(selectedYear));
    }, [data, selectedOption, selectedYear]);

    // Find comparison item
    const comparisonItem = useMemo(() => {
        if (!data || !comparisonItemName) return null;
        return data.find(item => item.name === comparisonItemName && String(item.PERIODO) === String(selectedYear));
    }, [data, comparisonItemName, selectedYear]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        const itemVal = currentItem ? currentItem.avgGlobal : 0;
        const comparisonVal = comparisonItem ? comparisonItem.avgGlobal : 0;

        const labels = [selectedOption];
        const datasetData = [itemVal];
        const bgColors = ['rgba(53, 162, 235, 0.5)'];

        if (comparisonItemName) {
            labels.push(comparisonItemName);
            datasetData.push(comparisonVal);
            bgColors.push('rgba(255, 99, 132, 0.5)'); // Red for comparison
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Promedio Global',
                    data: datasetData,
                    backgroundColor: bgColors,
                },
            ],
        };
    }, [currentItem, comparisonItem, selectedOption, comparisonItemName]);

    const chartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${selectedOption} vs ${comparisonItemName || ''} - ${selectedYear}`,
            },
        },
        scales: {
            x: {
                beginAtZero: true
            }
        }
    };

    if (!data || data.length === 0) {
        return <div className="p-4 text-center">No hay datos disponibles</div>;
    }

    return (
        <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex flex-col gap-4 mb-4">
                 {/* Controls Row */}
                 <div className="flex flex-wrap items-end gap-6">
                    {/* Option Select */}
                    <SearchableSelect
                        label="Colegio"
                        options={options}
                        value={selectedOption}
                        onChange={(value) => {
                            setSelectedOption(value);
                            if (onOptionSelect) onOptionSelect(value, selectedYear);
                        }}
                        placeholder="Buscar colegio..."
                    />

                    {/* Year Slider */}
                    <div className="flex flex-col flex-[2] min-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                                <label htmlFor="h-year-slider" className="text-xs text-gray-500 font-medium uppercase">Año</label>
                                <span className="text-sm font-bold text-primary">{selectedYear}</span>
                        </div>
                        <input
                            id="h-year-slider"
                            type="range"
                            min="2014"
                            max="2022"
                            step="1"
                            value={selectedYear}
                            onChange={(e) => {
                                const year = Number(e.target.value);
                                setSelectedYear(year);
                                if (onYearChange) onYearChange(selectedOption, year);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>2014</span>
                            <span>2022</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow w-full min-h-0 relative">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
}
