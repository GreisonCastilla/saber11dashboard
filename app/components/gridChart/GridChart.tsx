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
    const { activeCharts, layout, updateLayout, mobileLayout } = useChart();
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

    const isMobile = width < 768;
    // Generate a default mobile layout if none exists
    const currentMobileLayout = (activeCharts || []).map((chart, i) => {
        // Check if we have a saved layout item
        const savedItem = (mobileLayout || []).find(l => l.i === chart.instanceId);
        if (savedItem) return savedItem;
        
        // Default mobile item
        return {
            i: chart.instanceId,
            x: 0,
            y: i * 10,
            w: 1,
            h: 10,
            minW: 1,
            minH: 5
        };
    });

    const currentLayout = isMobile ? currentMobileLayout : layout;

    return (
    <div ref={containerRef} id="dashboard-grid" className="w-full min-h-full">
     {mounted && (
        <ReactGridLayout
          layout={currentLayout}
          width={width}
          cols={isMobile ? 1 : 12}
          rowHeight={rowHeight}
          onLayoutChange={(l) => updateLayout(l, isMobile)}
          draggableHandle=".drag-handle"
          isResizable={true}
        >
          {activeCharts.map((item) => (
            <div key={item.instanceId} className="relative group border border-transparent hover:border-primary rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <div className="p-2 opacity-0 translate-y-2 duration-500 animate-fade-in-up" style={{ height: '100%' }}>
                    <ChartContainer chartInfo={item} />
                </div>
            </div>
          ))}
        </ReactGridLayout>
      )} 
    </div>

    )
}