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

interface CategoryDataItem {
    name: string;
    label?: string[];
    datos?: number[];
    avgGlobal?: number;
    PERIODO: string;
}

interface BarChartCategoriesProps {
    data: CategoryDataItem[];
    isGlobal?: boolean;
    isHorizontal?: boolean;
    onYearChange?: (option: string, year: number) => void;
}

export default function BarChartCategories({ data, isGlobal = false, isHorizontal = false, onYearChange }: BarChartCategoriesProps) {
    const [selectedYear, setSelectedYear] = useState<number>(2014);
    const [selectedAreaIndex, setSelectedAreaIndex] = useState<number>(0);

    const areas = useMemo(() => {
        if (isGlobal || !data.length || !data[0].label) return [];
        return data[0].label;
    }, [data, isGlobal]);

    const currentItems = useMemo(() => {
        if (!data) return [];
        const filtered = data.filter(item => String(item.PERIODO) === String(selectedYear));
        
        // Custom sort for Estratos and Education
        return [...filtered].sort((a, b) => {
            const customOrder: { [key: string]: number } = {
                // Estratos
                'ESTRATO 1': 1,
                'ESTRATO 2': 2,
                'ESTRATO 3': 3,
                'ESTRATO 4': 4,
                'ESTRATO 5': 5,
                'ESTRATO 6': 6,
                
                // Education levels
                'NINGUNO': 10,
                'PRIMARIA INCOMPLETA': 11,
                'PRIMARIA COMPLETA': 12,
                'SECUNDARIA (BACHILLERATO) INCOMPLETA': 13,
                'SECUNDARIA (BACHILLERATO) COMPLETA': 14,
                'TÉCNICA O TECNOLÓGICA INCOMPLETA': 15,
                'TÉCNICA O TECNOLÓGICA COMPLETA': 16,
                'EDUCACIÓN PROFESIONAL INCOMPLETA': 17,
                'EDUCACIÓN PROFESIONAL COMPLETA': 18,
                'POSTGRADO': 19,

                // Others
                'SIN ESPECIFICAR': 98,
                'NO SABE': 99,
                'NO INFORMA': 100
            };

            const orderA = customOrder[a.name.toUpperCase()] || 999;
            const orderB = customOrder[b.name.toUpperCase()] || 999;

            return orderA - orderB;
        });
    }, [data, selectedYear]);

    const chartData = useMemo(() => {
        const labels = currentItems.map(item => item.name);
        const values = currentItems.map(item => {
            if (isGlobal) {
                return item.avgGlobal || 0;
            } else {
                return item.datos ? item.datos[selectedAreaIndex] : 0;
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: isGlobal ? 'Promedio Global' : areas[selectedAreaIndex],
                    data: values,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
            ],
        };
    }, [currentItems, isGlobal, selectedAreaIndex, areas]);

    const chartOptions = {
        indexAxis: isHorizontal ? 'y' as const : 'x' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${isGlobal ? 'Promedio Global' : areas[selectedAreaIndex]} por Categoría - ${selectedYear}`,
            },
        },
        scales: {
            x: {
                beginAtZero: true
            },
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
                <div className="flex flex-wrap items-end gap-6">
                    {!isGlobal && areas.length > 0 && (
                        <SearchableSelect
                            label="Área"
                            options={areas}
                            value={areas[selectedAreaIndex]}
                            onChange={(value) => {
                                const index = areas.indexOf(value);
                                if (index !== -1) setSelectedAreaIndex(index);
                            }}
                            placeholder="Seleccionar área..."
                        />
                    )}

                    <div className="flex flex-col flex-[2] min-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                             <label htmlFor="cat-year-slider" className="text-xs text-gray-500 font-medium uppercase">año</label>
                             <span className="text-sm font-bold text-primary">{selectedYear}</span>
                        </div>
                        <input
                            id="cat-year-slider"
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
            </div>
            
            <div className="flex-grow w-full min-h-0 relative">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
}
