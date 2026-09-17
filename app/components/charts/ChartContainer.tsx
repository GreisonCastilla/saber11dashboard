import { MdClose, MdDragIndicator } from "react-icons/md";
import { useChart } from "../../contexts/ChartContext";
import { useEffect, useState, useMemo } from "react";
import { dbService } from "../../services/indexedDB";
import { FORMATO_DATOS } from "../../services/dataLoader";
import type { DataBundle } from "../../services/dataLoader";
import { datosDelGrafico, colegiosDeBolivar } from "../../services/chartData";
import type { ChartRow, GeneroRow } from "../../services/chartData";
import BarChartSelect from "./BarChartSelect";
import BarChartCompare from "./BarChartCompare";
import BarChartGrouped from "./BarChartGrouped";
import BarChartHorizontalSelector from "./BarChartHorizontalSelector";
import BarChartCategories from "./BarChartCategories";
import LineChartSelect from "./LineChartSelect";
import PieChart from "./PieChart";
import InfoChart from "./InfoChart";

export default function ChartContainer({
     chartInfo
}: {
    chartInfo: {
        name: string;
        typeChart: string;
        instanceId: string;
        chartId: number; 
    };
}) {
    const { removeChart } = useChart();
    const [bundle, setBundle] = useState<DataBundle | null>(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const guardado = await dbService.getData('dataBundle');
                // Un paquete guardado con un formato anterior se descarta:
                // page.tsx ya está descargando el nuevo.
                if (guardado?.formato === FORMATO_DATOS) setBundle(guardado as DataBundle);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        cargar();
        window.addEventListener('datos-actualizados', cargar);
        return () => window.removeEventListener('datos-actualizados', cargar);
    }, []);

    // Colegios de Bolívar disponibles para los selectores.
    const bolivarSchools = useMemo(() => colegiosDeBolivar(bundle), [bundle]);

    // Años publicados (no están fijos en el código).
    const years = useMemo(() => bundle?.years ?? [], [bundle]);

    // Los números ya vienen calculados del servidor: aquí solo se elige el corte.
    const processedData = useMemo(
        () => (bundle ? datosDelGrafico(chartInfo.chartId, bundle) : []),
        [bundle, chartInfo.chartId]
    );

    const chartOptions = useMemo(() => {
        if ([3, 4, 5, 6, 13, 14].includes(chartInfo.chartId)) {
            return bolivarSchools;
        }
        if ([7, 8, 9, 10].includes(chartInfo.chartId)) {
             const uniqueCategories = Array.from(new Set(processedData.map(item => item.name)));
             return uniqueCategories.sort();
        }
        return ['OFICIAL', 'NO OFICIAL'];
    }, [chartInfo.chartId, bolivarSchools, processedData]);

    if (!processedData.length) {
        return <div className="p-8 text-center animate-pulse">Cargando...</div>;
    }

    return (
        <div className="h-full flex flex-col">
        <div className="flex justify-between gap-2 shrink-0 mb-2">
            <div 
                className="drag-handle rotate-90 md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity cursor-grab hover:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
            >
                <MdDragIndicator size={14} className="text-primary" />
            </div>
            <h1 className="font-semibold text-sm truncate">{chartInfo.name}</h1>
            <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeChart(chartInfo.instanceId);
                    }}
                    onMouseDown={(e) => e.stopPropagation()} 
                    className=" text-red-500 rounded-full md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <MdClose size={14} />
                </button>
        </div>  
            <div className="flex-1 min-h-0">
                {chartInfo.chartId === 1 ? (
                    <BarChartGrouped data={processedData as ChartRow[]} years={years} />
                ) : chartInfo.chartId === 2 ? (
                    <BarChartCompare data={processedData as ChartRow[]} years={years} />
                ) : chartInfo.chartId === 3 ? (
                    <BarChartSelect 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                        years={years}
                    />
                ) : chartInfo.chartId === 4 ? (
                    <BarChartHorizontalSelector 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                        years={years}
                    />
                ) : chartInfo.chartId === 5 ? (
                    <BarChartSelect 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                        years={years}
                    />
                ) : chartInfo.chartId === 6 ? (
                    <BarChartHorizontalSelector 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                        years={years}
                    />
                ) : chartInfo.chartId === 7 ? (
                    <BarChartCategories 
                        data={processedData as ChartRow[]} 
                        years={years}
                    />
                ) : chartInfo.chartId === 8 || chartInfo.chartId === 9 || chartInfo.chartId === 10 ? (
                    <BarChartCategories 
                        data={processedData as ChartRow[]} 
                        isGlobal={true}
                        years={years}
                    />
                ) : chartInfo.chartId === 11 ? (
                    <BarChartGrouped 
                        data={processedData as ChartRow[]} 
                        years={years}
                    />
                ) : chartInfo.chartId === 12 ? (
                    <BarChartCategories 
                        data={processedData as ChartRow[]} 
                        isGlobal={true}
                        isHorizontal={true}
                        years={years}
                    />
                ) : chartInfo.chartId === 13 ? (
                    <LineChartSelect 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        isGlobal={true}
                    />
                ) : chartInfo.chartId === 14 ? (
                    <LineChartSelect 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                    />
                ) : chartInfo.chartId === 15 ? (
                    <PieChart 
                        data={processedData as GeneroRow[]} 
                        years={years}
                    />
                ) : chartInfo.chartId === 16 || chartInfo.chartId === 17 ? (
                    <InfoChart 
                        data={processedData as ChartRow[]} 
                        years={years}
                    />
                ) : (
                    <BarChartSelect 
                        data={processedData as ChartRow[]} 
                        options={chartOptions} 
                        years={years}
                    />
                )}
            </div>
        </div>
    );
}
