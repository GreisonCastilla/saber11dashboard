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
    processGlobalScoreByEstablecimientoNational,
    processByEstrato,
    processGlobalScoreByEstrato,
    processGlobalScoreByEducationPadre,
    processGlobalScoreByEducationMadre,
    processBolivarVsNationalAreas,
    processBolivarVsNationalGlobal
} from "../../services/dataProcessor";
import BarChartSelect from "./BarChartSelect";
import BarChartCompare from "./BarChartCompare";
import BarChartGrouped from "./BarChartGrouped";
import BarChartHorizontalSelector from "./BarChartHorizontalSelector";
import BarChartCategories from "./BarChartCategories";

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
                    reprocessData(parsedData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [chartInfo.instanceId, chartInfo.chartId]);

    const handleSelectionChange = async (option: string, year: number) => {
        try {
            let query = "";
            if ([3, 4, 5, 6].includes(chartInfo.chartId)) {
                console.log(`Fetching targeted data for ${option} in ${year}...`);
                query = `SELECT * WHERE COLE_NOMBRE_ESTABLECIMIENTO = '${option}' AND PERIODO LIKE '${year}%'`;
            } else {
                 console.log(`Fetching general data for year ${year}...`);
                 query = `SELECT * WHERE PERIODO LIKE '${year}%'`;
            }

            const newDataString = await fetchDatos(query);
            if (!newDataString) return;

            const newData = JSON.parse(newDataString);
            const formattedNewData = newData.map((item: any) => ({
                 ...item,
                  PERIODO: Number(item.PERIODO),
                  PUNT_MATEMATICAS: Number(item.PUNT_MATEMATICAS),
                  PUNT_INGLES: Number(item.PUNT_INGLES) || Number(item.punt_ingles),
                  PUNT_SOCIALES_CIUDADANAS: Number(item.PUNT_SOCIALES_CIUDADANAS) || Number(item.punt_sociales_ciudadanas),
                  PUNT_C_NATURALES: Number(item.PUNT_C_NATURALES) || Number(item.punt_c_naturales),
                  PUNT_LECTURA_CRITICA: Number(item.PUNT_LECTURA_CRITICA) || Number(item.punt_lectura_critica),
                  PUNT_GLOBAL: Number(item.PUNT_GLOBAL) || Number(item.punt_global),
            }));

            const currentDataRaw = await dbService.getData('apiResponse');
            let currentData = [];
            if (currentDataRaw) {
                 currentData = typeof currentDataRaw === 'string' ? JSON.parse(currentDataRaw) : currentDataRaw;
            }

            let mergedData = [];
            if ([3, 4, 5, 6].includes(chartInfo.chartId) && option) {
                // Remove only this school-year combination
                const otherData = currentData.filter((item: any) => {
                    const matchesSchool = (item.cole_nombre_establecimiento || item.COLE_NOMBRE_ESTABLECIMIENTO) === option;
                    const matchesYear = String(item.PERIODO || item.periodo).startsWith(String(year));
                    return !(matchesSchool && matchesYear);
                });
                mergedData = [...otherData, ...formattedNewData];
            } else {
                // Remove entire year prefix
                const otherData = currentData.filter((item: any) => !String(item.PERIODO || item.periodo).startsWith(String(year)));
                mergedData = [...otherData, ...formattedNewData];
            }

            await dbService.putData('apiResponse', mergedData);
            reprocessData(mergedData);

        } catch (error) {
            console.error("Error in handleSelectionChange:", error);
        }
    };

    const handleYearChangeGeneral = (year: number) => {
        handleSelectionChange("", year);
    };

    const reprocessData = (data: any[]) => {
        if (chartInfo.chartId === 2) {
            setProcessedData(processGlobalScoreByNaturaleza(data));
        } else if (chartInfo.chartId === 3) {
            setProcessedData(processByEstablecimiento(data));
        } else if (chartInfo.chartId === 4) {
            setProcessedData(processGlobalScoreByEstablecimiento(data));
        } else if (chartInfo.chartId === 5) {
            setProcessedData(processByEstablecimientoNational(data));
        } else if (chartInfo.chartId === 6) {
            setProcessedData(processGlobalScoreByEstablecimientoNational(data));
        } else if (chartInfo.chartId === 7) {
            setProcessedData(processByEstrato(data));
        } else if (chartInfo.chartId === 8) {
            setProcessedData(processGlobalScoreByEstrato(data));
        } else if (chartInfo.chartId === 9) {
            setProcessedData(processGlobalScoreByEducationPadre(data));
        } else if (chartInfo.chartId === 10) {
            setProcessedData(processGlobalScoreByEducationMadre(data));
        } else if (chartInfo.chartId === 11) {
            setProcessedData(processBolivarVsNationalAreas(data));
        } else if (chartInfo.chartId === 12) {
            setProcessedData(processBolivarVsNationalGlobal(data));
        } else {
            setProcessedData(processByNaturaleza(data));
        }
    };

    const chartOptions = useMemo(() => {
        if ([3, 4, 5, 6].includes(chartInfo.chartId)) {
            const uniqueNames = Array.from(new Set(processedData
                .map(item => item.name)
                .filter(name => name !== 'PROMEDIO BOLIVAR' && name !== 'PROMEDIO COLOMBIA')
            ));
            return uniqueNames.sort();
        }
        if ([7, 8, 9, 10].includes(chartInfo.chartId)) {
             const uniqueCategories = Array.from(new Set(processedData.map(item => item.name)));
             return uniqueCategories.sort();
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
                    <BarChartGrouped data={processedData} onYearChange={handleYearChangeGeneral} />
                ) : chartInfo.chartId === 2 ? (
                    <BarChartCompare data={processedData} onYearChange={handleYearChangeGeneral} />
                ) : chartInfo.chartId === 3 ? (
                    <BarChartSelect 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                        onOptionSelect={handleSelectionChange}
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 4 ? (
                    <BarChartHorizontalSelector 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO BOLIVAR"
                        onOptionSelect={handleSelectionChange}
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 5 ? (
                    <BarChartSelect 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                        onOptionSelect={handleSelectionChange}
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 6 ? (
                    <BarChartHorizontalSelector 
                        data={processedData} 
                        options={chartOptions} 
                        comparisonItemName="PROMEDIO COLOMBIA"
                        onOptionSelect={handleSelectionChange}
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 7 ? (
                    <BarChartCategories 
                        data={processedData} 
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 8 || chartInfo.chartId === 9 || chartInfo.chartId === 10 ? (
                    <BarChartCategories 
                        data={processedData} 
                        isGlobal={true}
                        onYearChange={handleSelectionChange}
                    />
                ) : chartInfo.chartId === 11 ? (
                    <BarChartGrouped 
                        data={processedData} 
                        onYearChange={handleYearChangeGeneral} 
                    />
                ) : chartInfo.chartId === 12 ? (
                    <BarChartCategories 
                        data={processedData} 
                        isGlobal={true}
                        isHorizontal={true}
                        onYearChange={handleSelectionChange}
                    />
                ) : (
                    <BarChartSelect 
                        data={processedData} 
                        options={chartOptions} 
                        onYearChange={handleSelectionChange}
                    />
                )}
            </div>
        </div>
    );
}
