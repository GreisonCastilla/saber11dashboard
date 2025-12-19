'use client'
import { useContainerWidth } from "react-grid-layout"
import ReactGridLayout from "react-grid-layout/legacy"
import ChartContainer from "../charts/ChartContainer"
import { useChart } from "../../contexts/ChartContext";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export default function GridChart() {

    const {width, containerRef, mounted} = useContainerWidth()
    const { activeCharts, layout, updateLayout } = useChart();

    return (
    <div ref={containerRef} className="w-full min-h-full">
     {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          cols={12}
          rowHeight={30}
          onLayoutChange={updateLayout}
          draggableHandle=".drag-handle"
          isResizable={true}
        >
          {activeCharts.map((item) => (
            <div key={item.instanceId} className="relative group border border-transparent hover:border-primary rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <div className=" p-2">
                    <ChartContainer chartInfo={item} />
                </div>
            </div>
          ))}
        </ReactGridLayout>
      )} 
    </div>

    )
}