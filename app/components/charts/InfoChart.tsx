'use client';

import React, { useMemo, useState } from 'react';
import { 
    MdLanguage, 
    MdFunctions, 
    MdPublic, 
    MdScience, 
    MdMenuBook,
    MdStar
} from 'react-icons/md';

interface DataItem {
    name: string;
    label: string[];
    datos: number[];
    PERIODO: string;
}

interface InfoChartProps {
    data: DataItem[];
    onYearChange?: (option: string, year: number) => void;
}

const icons = [
    <MdLanguage key="ingles" className="text-blue-500" size={24} />,
    <MdFunctions key="matematicas" className="text-red-500" size={24} />,
    <MdPublic key="sociales" className="text-green-500" size={24} />,
    <MdScience key="ciencias" className="text-yellow-500" size={24} />,
    <MdMenuBook key="lectura" className="text-purple-500" size={24} />,
    <MdStar key="global" className="text-orange-500" size={24} />
];

export default function InfoChart({ data, onYearChange }: InfoChartProps) {
    const [selectedYear, setSelectedYear] = useState<number>(2014);

    const currentItem = useMemo(() => {
        if (!data) return null;
        return data.find(item => String(item.PERIODO) === String(selectedYear));
    }, [data, selectedYear]);

    if (!data || data.length === 0) {
        return <div className="p-4 text-center">No hay datos disponibles</div>;
    }

    return (
        <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col flex-1 min-w-[200px]">
                    <div className="flex justify-between items-center mb-1">
                         <label htmlFor="year-slider-info" className="text-xs text-gray-500 font-medium uppercase">Año</label>
                         <span className="text-sm font-bold text-primary">{selectedYear}</span>
                    </div>
                    <input
                        id="year-slider-info"
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

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItem ? (
                    currentItem.label.map((subject, index) => (
                        <div key={subject} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-full mr-4">
                                {icons[index]}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{subject}</span>
                                <span className="text-2xl font-bold text-gray-800 dark:text-white">{currentItem.datos[index]}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center h-full text-gray-400">
                        No se encontraron datos para el año {selectedYear}
                    </div>
                )}
            </div>
        </div>
    );
}
