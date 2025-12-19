'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Layout } from 'react-grid-layout';

export interface ChartInstance {
    instanceId: string;
    chartId: number;
    name: string;
    typeChart: string;
    // We can add more properties from Graphics.json if needed
}

interface ChartContextType {
    activeCharts: ChartInstance[];
    layout: Layout;
    addChart: (chartData: any) => void;
    removeChart: (instanceId: string) => void;
    updateLayout: (newLayout: Layout) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function ChartProvider({ children }: { children: ReactNode }) {
    const [activeCharts, setActiveCharts] = useState<ChartInstance[]>([]);
    const [layout, setLayout] = useState<Layout>([]);

    const addChart = (chartData: any) => {
        const instanceId = `${chartData.id}-${Date.now()}`;
        const newChart: ChartInstance = {
            instanceId,
            chartId: chartData.id,
            name: chartData.name,
            typeChart: chartData.typeChart,
        };

        setActiveCharts((prev) => [...prev, newChart]);
        
        // Add new item to layout
        const newLayoutItem = {
            i: instanceId,
            x: 0,
            y: Infinity, // Put it at the bottom
            w: 2,
            h: 2,
        };
        // @ts-ignore
        setLayout((prev) => [...prev, newLayoutItem]);
    };

    const removeChart = (instanceId: string) => {
        setActiveCharts((prev) => prev.filter((c) => c.instanceId !== instanceId));
        // @ts-ignore
        setLayout((prev) => prev.filter((l) => l.i !== instanceId));
    };

    const updateLayout = (newLayout: Layout) => {
        setLayout(newLayout);
    };

    return (
        <ChartContext.Provider value={{ activeCharts, layout, addChart, removeChart, updateLayout }}>
            {children}
        </ChartContext.Provider>
    );
}

export function useChart() {
    const context = useContext(ChartContext);
    if (context === undefined) {
        throw new Error('useChart must be used within a ChartProvider');
    }
    return context;
}
