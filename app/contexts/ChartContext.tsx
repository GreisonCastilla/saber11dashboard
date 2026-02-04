'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Layout } from 'react-grid-layout';

export interface ChartInstance {
    instanceId: string;
    chartId: number;
    name: string;
    typeChart: string;
}

export interface Page {
    id: string;
    name: string;
    charts: ChartInstance[];
    layout: Layout;
}

interface ChartContextType {
    pages: Page[];
    activePageId: string;
    activeCharts: ChartInstance[]; // Computed from active page
    layout: Layout; // Computed from active page
    addChart: (chartData: any) => void;
    removeChart: (instanceId: string) => void;
    updateLayout: (newLayout: Layout) => void;
    addPage: (name: string, predefinedCharts?: ChartInstance[], predefinedLayout?: Layout) => void;
    removePage: (pageId: string) => void;
    setActivePage: (pageId: string) => void;
    updatePageName: (pageId: string, newName: string) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

const STORAGE_KEY = 'gridchart_data';

export function ChartProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
                    setPages(parsed.pages);
                    setActivePageId(parsed.activePageId || parsed.pages[0].id);
                } else {
                    // Initialize default if parsed data is invalid/empty
                    const defaultPage: Page = { id: 'default', name: 'Home', charts: [], layout: [] };
                    setPages([defaultPage]);
                    setActivePageId(defaultPage.id);
                }
            } catch (e) {
                console.error("Failed to parse saved chart data", e);
                const defaultPage: Page = { id: 'default', name: 'Home', charts: [], layout: [] };
                setPages([defaultPage]);
                setActivePageId(defaultPage.id);
            }
        } else {
            // Initialize default page
            const defaultPage: Page = { id: 'default', name: 'Home', charts: [], layout: [] };
            setPages([defaultPage]);
            setActivePageId(defaultPage.id);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever pages or activePageId changes
    useEffect(() => {
        if (!isLoaded) return;
        const dataToSave = {
            pages,
            activePageId
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [pages, activePageId, isLoaded]);

    const getActivePage = () => pages.find(p => p.id === activePageId) || pages[0];

    const addChart = (chartData: any) => {
        if (!activePageId) return;

        const instanceId = `${chartData.id}-${Date.now()}`;
        const newChart: ChartInstance = {
            instanceId,
            chartId: chartData.id,
            name: chartData.name,
            typeChart: chartData.typeChart,
        };

        const newLayoutItem = {
            i: instanceId,
            x: 0,
            y: Infinity,
            w: 4,
            h: 13,
            minW: 3,
            minH: 5,
        };

        setPages(prev => prev.map(p => {
            if (p.id === activePageId) {
                return {
                    ...p,
                    charts: [...p.charts, newChart],
                    // @ts-ignore
                    layout: [...p.layout, newLayoutItem]
                };
            }
            return p;
        }));
    };

    const removeChart = (instanceId: string) => {
        if (!activePageId) return;
        setPages(prev => prev.map(p => {
            if (p.id === activePageId) {
                return {
                    ...p,
                    charts: p.charts.filter(c => c.instanceId !== instanceId),
                    // @ts-ignore
                    layout: p.layout.filter(l => l.i !== instanceId)
                };
            }
            return p;
        }));
    };

    const updateLayout = (newLayout: Layout) => {
        if (!activePageId) return;
        setPages(prev => prev.map(p => {
            if (p.id === activePageId) {
                return { ...p, layout: newLayout };
            }
            return p;
        }));
    };

    const addPage = (name: string, predefinedCharts: ChartInstance[] = [], predefinedLayout: Layout = []) => {
        const newPageId = `page-${Date.now()}`;
        const newPage: Page = {
            id: newPageId,
            name,
            charts: predefinedCharts,
            layout: predefinedLayout
        };
        setPages(prev => [...prev, newPage]);
        setActivePageId(newPageId);
    };

    const removePage = (pageId: string) => {
        if (pages.length <= 1) {
            alert("Cannot delete the only page.");
            return;
        }
        const newPages = pages.filter(p => p.id !== pageId);
        setPages(newPages);
        if (activePageId === pageId) {
            setActivePageId(newPages[0].id);
        }
    };

    const setActivePage = (pageId: string) => {
        if (pages.find(p => p.id === pageId)) {
            setActivePageId(pageId);
        }
    };

    const updatePageName = (pageId: string, newName: string) => {
        setPages(prev => prev.map(p => {
            if (p.id === pageId) {
                return { ...p, name: newName };
            }
            return p;
        }));
    };

    const activePage = getActivePage();

    if (!isLoaded && pages.length === 0) {
        return null; // Or a loading spinner
    }

    return (
        <ChartContext.Provider value={{
            pages,
            activePageId,
            activeCharts: activePage?.charts || [],
            layout: activePage?.layout || [],
            addChart,
            removeChart,
            updateLayout,
            addPage,
            removePage,
            setActivePage,
            updatePageName
        }}>
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
