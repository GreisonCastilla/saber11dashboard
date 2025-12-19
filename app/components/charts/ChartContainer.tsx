import { MdClose, MdDragIndicator } from "react-icons/md";
import { useChart } from "../../contexts/ChartContext";
import { useEffect, useState } from "react";
import { dbService } from "../../services/indexedDB";
import { processByNaturaleza } from "../../services/dataProcessor";
import BarChartSelect from "./BarChartSelect";

export default function ChartContainer({
     chartInfo
}: {
    chartInfo: {
        name: string;
        typeChart: string;
        instanceId: string;
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
                    setProcessedData(processByNaturaleza(parsedData));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [chartInfo.instanceId]);

    if (!processedData.length) {
        return <div>Loading...</div>;
    }

    console.log(processedData);
    return (
        <div>
        <div className="flex justify-between gap-2">
            <div 
                className="drag-handle rotate-90 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
            >
                <MdDragIndicator size={14} className="text-primary" />
            </div>
            <h1>{chartInfo.name}</h1>
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
            <BarChartSelect data={processedData} options={['OFICIAL','NO OFICIAL']} />  
        </div>
    );
}