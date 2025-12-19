'use client'
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import GridChart from "./components/gridChart/GridChart";
import { fetchDatos } from "./api/data/query";
import { useEffect } from "react";
import { dbService } from "./services/indexedDB";

export default function Home() {

  useEffect(() => {
    fetchDatos("SELECT * WHERE PERIODO >'2014'").then(async (data) => {
      try {
        const parsedData = JSON.parse(data);
        const formattedData = parsedData.map((item: any) => ({
          ...item,
          PERIODO: Number(item.PERIODO),
          PUNT_MATEMATICAS: Number(item.PUNT_MATEMATICAS),
          PUNT_INGLES: Number(item.PUNT_INGLES),
          PUNT_SOCIALES_CIUDADANAS: Number(item.PUNT_SOCIALES_CIUDADANAS),
          PUNT_C_NATURALES: Number(item.PUNT_C_NATURALES),
          PUNT_LECTURA_CRITICA: Number(item.PUNT_LECTURA_CRITICA),
          PUNT_GLOBAL: Number(item.PUNT_GLOBAL),
        }));
        console.log(formattedData);
        await dbService.putData("apiResponse", formattedData);
        console.log("Success: Data saved to IndexedDB");
      } catch (error) {
        console.error("Failed to process or save data:", error);
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen min-w-screen items-left justify-left bg-gray-500 font-sans dark:bg-slate-500">
      
      <main className=" flex w-full min-w-screen max-w-3xl justify-left bg-slate-300 dark:bg-slate-800 sm:items-start">
        <Sidebar />
        <div className="flex flex-col w-full h-full min-h-screen">
          <div className="flex flex-1 grow">
            <GridChart />
          </div>
          <Footer />
        </div>
        
        
      </main>
    </div>
  );
}
