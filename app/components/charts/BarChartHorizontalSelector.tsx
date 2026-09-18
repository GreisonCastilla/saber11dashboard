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
import { useYearRange } from './useYearRange';
import SearchableSelect from '../ui/SearchableSelect';
import { cleanLabel } from '../../services/textUtils';

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
    avgGlobal?: number | null;
    PERIODO: string;
}

interface BarChartHorizontalSelectorProps {
    years?: number[];
    data: DataItem[];
    options: string[];
    comparisonItemName?: string;
    onOptionSelect?: (option: string, year: number) => void;
    onYearChange?: (option: string, year: number) => void;
}

export default function BarChartHorizontalSelector({ data, options, comparisonItemName, onOptionSelect, onYearChange, years }: BarChartHorizontalSelectorProps) {
    // State
    const { minYear, maxYear, selectedYear, setSelectedYear } = useYearRange(years);
    // Elección explícita del usuario; mientras no la haya, se usa un valor con datos.
    const [eleccion, setEleccion] = useState<string | null>(null);

    // No todos los colegios tienen datos en todos los años (36 de 506 no llegan al
    // último), así que por defecto se muestra el primero que sí los tenga.
    const selectedOption = useMemo(() => {
        if (eleccion && options.includes(eleccion)) return eleccion;
        const conDatos = new Set(
            data
                .filter((item) => String(item.PERIODO) === String(selectedYear))
                .map((item) => item.name)
        );
        return options.find((option) => conDatos.has(option)) ?? options[0] ?? '';
    }, [eleccion, options, data, selectedYear]);


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
        const itemVal = currentItem?.avgGlobal ?? 0;
        const comparisonVal = comparisonItem?.avgGlobal ?? 0;

        const labels = [cleanLabel(selectedOption)];
        const datasetData = [itemVal];
        const bgColors = ['rgba(53, 162, 235, 0.5)'];

        if (comparisonItemName) {
            labels.push(cleanLabel(comparisonItemName));
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
                text: `${cleanLabel(selectedOption)} vs ${cleanLabel(comparisonItemName || '')} - ${selectedYear}`,
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
                            setEleccion(value);
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
                            min={minYear}
                            max={maxYear}
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
                            <span>{minYear}</span>
                            <span>{maxYear}</span>
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
