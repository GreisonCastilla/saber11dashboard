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
    label?: string[];
    datos?: number[];
    PERIODO: string;
}

interface BarChartSelectProps {
    years?: number[];
    data: DataItem[];
    options: string[]; // Corresponds to 'name' in DataItem
    comparisonItemName?: string; // e.g., 'PROMEDIO BOLIVAR'
    onOptionSelect?: (option: string, year: number) => void;
    onYearChange?: (option: string, year: number) => void;
}

export default function BarChartSelect({ data, options, comparisonItemName, onOptionSelect, onYearChange, years }: BarChartSelectProps) {
    // State for selections
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


    // Find the specific item based on selection
    const currentItem = useMemo(() => {
        if (!data) return null;
        // Compare PERIODO (string) with selectedYear (number) loosely or by converting
        return data.find(item => item.name === selectedOption && String(item.PERIODO) === String(selectedYear));
    }, [data, selectedOption, selectedYear]);

    // Find comparison item for the same year
    const comparisonItem = useMemo(() => {
        if (!data || !comparisonItemName) return null;
        return data.find(item => item.name === comparisonItemName && String(item.PERIODO) === String(selectedYear));
    }, [data, comparisonItemName, selectedYear]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!currentItem) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const datasets = [
            {
                label: cleanLabel(selectedOption),
                data: currentItem.datos ?? [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ];

        if (comparisonItem) {
            datasets.push({
                label: comparisonItemName || 'Comparison',
                data: comparisonItem.datos ?? [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            });
        }

        return {
            labels: currentItem.label ?? [],
            datasets: datasets,
        };
    }, [currentItem, comparisonItem, selectedOption, comparisonItemName]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${cleanLabel(selectedOption)} - ${selectedYear}`,
            },
        },
        scales: {
            y: {
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
                        placeholder="Seleccionar colegio..."
                    />

                    {/* Year Slider */}
                    <div className="flex flex-col flex-[2] min-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                             <label htmlFor="year-slider" className="text-xs text-gray-500 font-medium uppercase">Año</label>
                             <span className="text-sm font-bold text-primary">{selectedYear}</span>
                        </div>
                        <input
                            id="year-slider"
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
                {currentItem ? (
                    <Bar options={chartOptions} data={chartData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No se encontraron datos para {selectedOption} en {selectedYear}
                    </div>
                )}
            </div>
        </div>
    );
}
