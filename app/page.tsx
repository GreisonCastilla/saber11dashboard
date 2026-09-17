'use client'
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import GridChart from "./components/gridChart/GridChart";
import PageSelector from "./components/PageSelector";
import Tutorial from "./components/Tutorial";
import { useEffect } from "react";
import { dbService } from "./services/indexedDB";
import { loadAllData, FORMATO_DATOS } from "./services/dataLoader";

export default function Home() {

  useEffect(() => {
    // Los datos agregados cambian solo cuando el ICFES publica un período nuevo,
    // así que se reutiliza lo guardado por medio día antes de volver a descargar.
    const MAX_EDAD_MS = 12 * 60 * 60 * 1000;

    const cargar = async () => {
      try {
        const guardado = await dbService.getData("dataBundle");
        const edad = guardado?.actualizado
          ? Date.now() - new Date(guardado.actualizado).getTime()
          : Infinity;

        const sirve = guardado?.formato === FORMATO_DATOS;

        if (sirve && edad < MAX_EDAD_MS) {
          window.dispatchEvent(new Event("datos-actualizados"));
          return;
        }

        const bundle = await loadAllData();
        await dbService.putData("dataBundle", bundle);
        console.log(
          `Datos cargados: ${bundle.years[0]} a ${bundle.years[bundle.years.length - 1]}`,
          bundle
        );
        window.dispatchEvent(new Event("datos-actualizados"));
      } catch (error) {
        console.error("Failed to process or save data:", error);
        // Si falla la descarga pero hay datos viejos, que la app siga funcionando.
        window.dispatchEvent(new Event("datos-actualizados"));
      }
    };

    cargar();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-500 font-sans dark:bg-slate-500">
      
      <main className="flex flex-col md:flex-row w-full h-full bg-slate-300 dark:bg-slate-800">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div className="hidden md:block shrink-0">
            <PageSelector mode="topbar" />
          </div>
          <div className="flex-grow overflow-y-auto p-4 md:p-6" id="dashboard-scroll-container">
            <GridChart />
          </div>
          <div className="shrink-0">
            <Footer />
          </div>
        </div>
      </main>
      <Tutorial />
    </div>
  );
}
