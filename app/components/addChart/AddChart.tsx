import { MdOutlineBarChart } from "react-icons/md";
import { MdPieChart } from "react-icons/md";
import { MdOutlineShowChart } from "react-icons/md";
import { RiBarChartHorizontalFill } from "react-icons/ri";

import { useChart } from "../../contexts/ChartContext";

export default function AddChart({ chart, index }: { chart: { name: string; typeChart: string }; index?: number }) {
    const { addChart } = useChart();
    const delay = (index ?? 0) * 80; 
    return (
        <div
            onClick={() => addChart(chart)}
            style={{ animationDelay: `${delay}ms` }}
            className="opacity-0 translate-y-2 animate-fade-in-up flex gap-3 padding-2 rounded-lg hover:scale-95 transition-all ease-in-out duration-300 items-center cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30 p-2"
        >
            {chart.typeChart === "bar" && <MdOutlineBarChart className="h-6 w-6 fill-primary" />}
            {chart.typeChart === "HorizontalBar" && <RiBarChartHorizontalFill className="h-6 w-6 fill-primary" />}
            {chart.typeChart === "line" && <MdOutlineShowChart className="h-6 w-6 fill-primary" />}
            {chart.typeChart === "pie" && <MdPieChart className="h-6 w-6 fill-primary" />}
            <div className="font-semibold text-xs text-wrap">{chart.name}</div>
            <div className="ml-auto">
            </div>
        </div>
    );
}