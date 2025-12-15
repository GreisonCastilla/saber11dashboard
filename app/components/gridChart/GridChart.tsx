'use client'
import { useContainerWidth } from "react-grid-layout"
import ReactGridLayout from "react-grid-layout/legacy"
import ChartContainer from "../charts/ChartContainer"
import { useChart } from "../../contexts/ChartContext";
import { MdClose } from "react-icons/md";

export default function GridChart() {

    const {width, containerRef, mounted} = useContainerWidth()
    const { activeCharts, layout, updateLayout, removeChart } = useChart();

    return (
    <div ref={containerRef} className="w-full min-h-full">
     {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          cols={12}
          rowHeight={30}
          onLayoutChange={updateLayout}
        >
          {activeCharts.map((item) => (
            <div key={item.instanceId} className="relative group border border-transparent hover:border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        // Prevent drag start if possible, though grid layout handles handles
                        removeChart(item.instanceId);
                    }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                    className="absolute top-1 right-1 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                >
                    <MdClose size={14} />
                </button>
                <div className="h-full w-full p-2">
                    <ChartContainer chartInfo={item} />
                </div>
            </div>
          ))}
        </ReactGridLayout>
      )} 
    </div>

    )
}