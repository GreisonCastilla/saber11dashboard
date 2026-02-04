'use client'
import { useContainerWidth } from "react-grid-layout"
import ReactGridLayout from "react-grid-layout/legacy"
import ChartContainer from "../charts/ChartContainer"
import { useChart } from "../../contexts/ChartContext";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useEffect, useState } from "react";

export default function GridChart() {

    const {width, containerRef, mounted} = useContainerWidth()
    const { activeCharts, layout, updateLayout } = useChart();
    const [rowHeight, setRowHeight] = useState(30);

    useEffect(() => {
        const handleResize = () => {
            // Calculate row height based on window height
            // We aim for approx 30-40 rows to fit screen, or adjust based on preference
            // Base 30px is good for standard desktop.
            // On smaller vertical screens, we shrink it.
            const height = window.innerHeight;
            // E.g., if height is 900, 900/30 = 30. If height is 600, 600/30 = 20.
            const calculatedHeight = Math.max(15, Math.floor(height / 40)); 
            setRowHeight(calculatedHeight);
        };

        handleResize(); // Initial calc
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
    <div ref={containerRef} className="w-full min-h-full">
     {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          cols={12}
          rowHeight={rowHeight} // Dynamic row height
          onLayoutChange={updateLayout}
          draggableHandle=".drag-handle"
          isResizable={true}
        >
          {activeCharts.map((item) => (
            <div key={item.instanceId} className="relative group border border-transparent hover:border-primary rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <div className=" p-2" style={{ height: '100%' }}>
                    <ChartContainer chartInfo={item} />
                </div>
            </div>
          ))}
        </ReactGridLayout>
      )} 
    </div>

    )
}