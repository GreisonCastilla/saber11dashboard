"use client";
import Logo from "./Logo";
import { HiChevronLeft } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi";
import { useState } from "react";
import { useMemo } from "react";
import chart from "../graphics/Graphics.json";
import AddChart from "./addChart/AddChart";
import SearchChart from "./input/SearchChart";

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
  const [state, setState] = useState(true);
  const [query, setQuery] = useState("");

  const filteredCharts = useMemo(() => filterChartsList(chart as any[], query), [query]);

  function toggleSidebar() {
    setState(!state);
  }
  return (
    <aside
      className={
        "flex flex-col absolute z-30  border-r dark:border-gray-700 border-gray-300 bg-white h-full dark:bg-gray-900 p-4 transition-all ease-in-out duration-500 " +
        (state
          ? " w-72 md:static"
          : " w-10 max-h-10 m-2 absolute border-r-0 rounded-lg justify-center items-center")
      }
    >
      <div className="flex items-center ">
        <HiChevronLeft
          onClick={toggleSidebar}
          className={
            "h-8 w-8 fill-primary transition-all ease-in-out duration-300" +
            (state ? " block" : " hidden")
          }
        />
        <HiChevronRight
          onClick={toggleSidebar}
          className={
            "h-8 w-8 fill-primary transition-all ease-in-out duration-300" +
            (state ? " hidden" : " block")
          }
        />
        {state && <Logo />}
      </div>
      <div
        className={
          "mt-6 flex flex-col gap-2 max-h-full  transition-all ease-in-out duration-300" +
          (state ? " block" : " hidden")
        }
      >
        <span className="font-semibold">Gráficos</span>
        <SearchChart onSearch={setQuery} delay={400} />
        <div className="flex flex-col h-full  mt-2">
            {filteredCharts.map((chartItem, i) => (
              <AddChart key={`${(chartItem as any).id ?? i}-${i}`} chart={chartItem} index={i} />
            ))}
        </div>
        {filteredCharts.length === 0 && (
          <div className="mt-4 text-center text-gray-500">
            No se encontraron gráficos.
          </div>
        )}
      </div>
    </aside>
  );
}
