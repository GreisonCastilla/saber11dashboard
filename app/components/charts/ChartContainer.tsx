import { MdClose, MdDragIndicator } from "react-icons/md";
import { useChart } from "../../contexts/ChartContext";
import { useEffect, useState, useMemo } from "react";
import { dbService } from "../../services/indexedDB";
import { processByNaturaleza, processGlobalScoreByNaturaleza, processByEstablecimiento, processGlobalScoreByEstablecimiento } from "../../services/dataProcessor";
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

    const chartOptions = useMemo(() => {
        if (chartInfo.chartId === 3 || chartInfo.chartId === 4) {
            // Extract unique names from processedData for options, excluding the comparison item
            const uniqueNames = Array.from(new Set(processedData
                .map(item => item.name)
                .filter(name => name !== 'PROMEDIO BOLIVAR')
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
                    />
                ) : chartInfo.chartId === 4 ? (
                    <BarChartHorizontalSelector 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                    />
                ) : (
                    <BarChartSelect data={processedData} options={chartOptions} />
                )}
            </div>
        </div>
    );
}
