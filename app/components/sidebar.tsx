"use client";
import Logo from "./Logo";
import { HiChevronLeft } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi";
import { useState } from "react";
import { useMemo } from "react";
import chart from "../graphics/Graphics.json";
import AddChart from "./addChart/AddChart";
import SearchChart from "./input/SearchChart";
import PageSelector from "./PageSelector";
import { HiDownload } from "react-icons/hi";
import { exportToPDF } from "../services/exportService";

function filterChartsList(charts: any[], q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return charts;
  return charts.filter((chartItem) => {
    const itemAny = chartItem as any;
    const title = (itemAny.title || itemAny.name || "").toString().toLowerCase();
    const id = (itemAny.id || "").toString().toLowerCase();
    const tags = (itemAny.tags || []).join(" ").toLowerCase();
    return title.includes(query) || id.includes(query) || tags.includes(query);
  });
}

export default function Sidebar() {
  const [state, setState] = useState(true); // Desktop: true = open, false = minimized. Mobile: true = open (overlay), false = closed.
  const [query, setQuery] = useState("");

  const filteredCharts = useMemo(() => filterChartsList(chart as any[], query), [query]);

  function toggleSidebar() {
    setState(!state);
  }

  return (
    <>
      {/* Mobile Hero */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between h-16">
        <Logo />
        <button onClick={toggleSidebar} className="p-2 text-primary">
            {state ? <HiChevronRight className="h-6 w-6" /> : <HiChevronLeft className="h-6 w-6" />}
        </button>
      </div>

      {/* Spacer for Mobile Hero */}
      <div className="md:hidden h-16 w-full shrink-0" />

      {/* Sidebar */}
      <aside
        className={
          "flex flex-col border-r dark:border-gray-700 border-gray-300 bg-white h-full dark:bg-gray-900 transition-all ease-in-out duration-500 z-30 " +
          (state ? "p-4 " : "py-4 px-0 ") +
          // Mobile: Fixed overlay on RIGHT side
          "fixed md:static inset-y-0 right-0 md:left-auto " + 
          (state
            ? "translate-x-0 w-72"
            : "translate-x-full md:translate-x-0 w-10 max-h-10 m-2 md:m-0 md:max-h-full border-r-0 md:border-r rounded-lg md:rounded-none justify-center items-center")
        }
      >
        <div className="flex items-center group relative min-h-[32px]">
          {/* Maximize Button (Hidden when closed, show on hover. Adjusted to opacity-50 for visibility hint) */}
          {!state && (
            <div className="absolute left-0 w-full h-full flex items-center justify-center cursor-pointer" onClick={toggleSidebar}>
               <HiChevronRight className={"h-8 w-8 text-primary" + (state ? " block" : " hidden")} />
            </div>
          )}

          <HiChevronRight onClick={toggleSidebar} className={"h-8 w-8 text-primary" + (state ? " hidden" : " block")} />
          <HiChevronLeft
            onClick={toggleSidebar}
            className={
              "h-8 w-8 text-primary transition-all ease-in-out duration-300 cursor-pointer " +
              (state ? "hidden md:block" : "hidden")
            }
          />
          
          <div className={state ? "block" : "hidden"}>
             <Logo />
          </div>
        </div>

        <div
          className={
            "mt-6 flex flex-col gap-2 max-h-full transition-all ease-in-out duration-300 overflow-hidden" +
            (state ? " block" : " hidden")
          }
        >
          <div className="md:hidden">
              <PageSelector mode="sidebar" />
          </div>
          <span className="font-semibold">Gráficos</span>
          <SearchChart onSearch={setQuery} delay={400} />
          <div className="flex flex-col mt-2 max-h-[calc(100vh-250px)] overflow-y-auto items-stretch pr-1">
              {filteredCharts.map((chartItem, i) => (
                <AddChart key={`${(chartItem as any).id ?? i}-${i}`} chart={chartItem} index={i} />
              ))}
          </div>
          {filteredCharts.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              No se encontraron gráficos.
            </div>
          )}

          <div className="mt-auto pt-6 border-t dark:border-gray-700 border-gray-200">
            <button
              onClick={() => exportToPDF('dashboard-grid', 'dashboard-saber11.pdf')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              <HiDownload className="w-5 h-5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Overlay Backdrop */}
      {state && (
        <div 
            className="md:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
            onClick={() => setState(false)}
        />
      )}
    </>
  );
}
