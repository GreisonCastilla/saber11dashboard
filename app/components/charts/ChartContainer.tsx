import { MdClose, MdDragIndicator } from "react-icons/md";
import { useChart } from "../../contexts/ChartContext";
import { useEffect, useState, useMemo } from "react";
import { dbService } from "../../services/indexedDB";
import { fetchDatos } from "../../api/data/query";
import { 
    processByNaturaleza, 
    processGlobalScoreByNaturaleza, 
    processByEstablecimiento, 
    processGlobalScoreByEstablecimiento,
    processByEstablecimientoNational,
    processGlobalScoreByEstablecimientoNational
} from "../../services/dataProcessor";
import BarChartSelect from "./BarChartSelect";
import BarChartCompare from "./BarChartCompare";
import BarChartGrouped from "./BarChartGrouped";
import BarChartHorizontalSelector from "./BarChartHorizontalSelector";

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
    const [processedData, setProcessedData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rawData = await dbService.getData('apiResponse');
                if (rawData) {
                    const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                    
                    if (chartInfo.chartId === 2) {
                        setProcessedData(processGlobalScoreByNaturaleza(parsedData));
                    } else if (chartInfo.chartId === 3) {
                        setProcessedData(processByEstablecimiento(parsedData));
                    } else if (chartInfo.chartId === 4) {
                        setProcessedData(processGlobalScoreByEstablecimiento(parsedData));
                    } else if (chartInfo.chartId === 5) {
                        setProcessedData(processByEstablecimientoNational(parsedData));
                    } else if (chartInfo.chartId === 6) {
                        setProcessedData(processGlobalScoreByEstablecimientoNational(parsedData));
                    } else {
                        // Chart 1 and others use this default processing
                        setProcessedData(processByNaturaleza(parsedData));
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [chartInfo.instanceId, chartInfo.chartId]);

    const handleOptionSelect = async (option: string) => {
        if (![3, 4, 5, 6].includes(chartInfo.chartId)) return;

        try {
            console.log(`Fetching data for ${option}...`);
            const newDataString = await fetchDatos(`SELECT * WHERE COLE_NOMBRE_ESTABLECIMIENTO = '${option}'`);
            
            if (!newDataString) return;

            const newData = JSON.parse(newDataString);
            
            const formattedNewData = newData.map((item: any) => ({
                 ...item,
                  PERIODO: Number(item.PERIODO),
                  PUNT_MATEMATICAS: Number(item.PUNT_MATEMATICAS),
                  PUNT_INGLES: Number(item.PUNT_INGLES),
                  PUNT_SOCIALES_CIUDADANAS: Number(item.PUNT_SOCIALES_CIUDADANAS),
                  PUNT_C_NATURALES: Number(item.PUNT_C_NATURALES),
                  PUNT_LECTURA_CRITICA: Number(item.PUNT_LECTURA_CRITICA),
                  PUNT_GLOBAL: Number(item.PUNT_GLOBAL),
            }));

            const currentDataRaw = await dbService.getData('apiResponse');
            let currentData = [];
            if (currentDataRaw) {
                 currentData = typeof currentDataRaw === 'string' ? JSON.parse(currentDataRaw) : currentDataRaw;
            }

            // Filter out existing entries for this establishment to avoid duplicates before merging (optional strategy)
            // Or just merge. Assuming we want to ensure we have data for this school.
            // Simple merge might duplicate if it already exists, effectively it's ok as map usually handles processing. 
            // Better to filter to be safe.
            const otherData = currentData.filter((item: any) => item.cole_nombre_establecimiento !== option && item.COLE_NOMBRE_ESTABLECIMIENTO !== option);
            const mergedData = [...otherData, ...formattedNewData];

            await dbService.putData('apiResponse', mergedData);
            
            // Re-process data based on chart type
             if (chartInfo.chartId === 2) {
                setProcessedData(processGlobalScoreByNaturaleza(mergedData));
            } else if (chartInfo.chartId === 3) {
                setProcessedData(processByEstablecimiento(mergedData));
            } else if (chartInfo.chartId === 4) {
                setProcessedData(processGlobalScoreByEstablecimiento(mergedData));
            } else if (chartInfo.chartId === 5) {
                setProcessedData(processByEstablecimientoNational(mergedData));
            } else if (chartInfo.chartId === 6) {
                setProcessedData(processGlobalScoreByEstablecimientoNational(mergedData));
            } else {
                setProcessedData(processByNaturaleza(mergedData));
            }

        } catch (error) {
            console.error("Error fetching on-demand data:", error);
        }
    };

    const chartOptions = useMemo(() => {
        if ([3, 4, 5, 6].includes(chartInfo.chartId)) {
            // Extract unique names from processedData for options, excluding the comparison items
            const uniqueNames = Array.from(new Set(processedData
                .map(item => item.name)
                .filter(name => name !== 'PROMEDIO BOLIVAR' && name !== 'PROMEDIO COLOMBIA')
            ));
            return uniqueNames.sort();
        }
        return ['OFICIAL', 'NO OFICIAL'];
    }, [chartInfo.chartId, processedData]);

    if (!processedData.length) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-full flex flex-col">
        <div className="flex justify-between gap-2 shrink-0 mb-2">
            <div 
                className="drag-handle rotate-90 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:cursor-grabbing"
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
                    className=" text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <MdClose size={14} />
                </button>
        </div>  
            <div className="flex-1 min-h-0">
                {chartInfo.chartId === 1 ? (
                    <BarChartGrouped data={processedData} />
                ) : chartInfo.chartId === 2 ? (
                    <BarChartCompare data={processedData} />
                ) : chartInfo.chartId === 3 ? (
                    <BarChartSelect 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                        onOptionSelect={handleOptionSelect}
                    />
                ) : chartInfo.chartId === 4 ? (
                    <BarChartHorizontalSelector 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                         onOptionSelect={handleOptionSelect}
                    />
                ) : chartInfo.chartId === 5 ? (
                    <BarChartSelect 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                         onOptionSelect={handleOptionSelect}
                    />
                ) : chartInfo.chartId === 6 ? (
                    <BarChartHorizontalSelector 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                         onOptionSelect={handleOptionSelect}
                    />
                ) : (
                    <BarChartSelect data={processedData} options={chartOptions} />
                )}
            </div>
        </div>
    );
}
