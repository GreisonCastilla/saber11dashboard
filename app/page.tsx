'use client'
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import GridChart from "./components/gridChart/GridChart";
import PageSelector from "./components/PageSelector";
import Tutorial from "./components/Tutorial";
import { useEffect } from "react";
import { dbService } from "./services/indexedDB";
import { loadAllData, setBundle, FORMATO_DATOS } from "./services/dataLoader";

export default function Home() {

  useEffect(() => {
    // Los datos agregados solo cambian cuando el ICFES publica un período nuevo.
    const MAX_EDAD_MS = 12 * 60 * 60 * 1000;

    const cargar = async () => {
      let guardado = null;

      try {
        guardado = await dbService.getData("dataBundle");
      } catch (error) {
        console.error("No se pudo leer lo guardado:", error);
      }

      // Si hay algo guardado se muestra de inmediato, aunque esté vencido:
      // es mejor ver el tablero al instante y refrescar por detrás.
      const sirve = guardado?.formato === FORMATO_DATOS;
      if (sirve) setBundle(guardado);

      const vigente = sirve && Date.now() - new Date(guardado.actualizado).getTime() < MAX_EDAD_MS;
      if (vigente) return;

      try {
        // Cada corte que llega se pinta sin esperar a los demás.
        const bundle = await loadAllData((parcial) => setBundle(parcial));
        setBundle(bundle);
        await dbService.putData("dataBundle", bundle);
      } catch (error) {
        console.error("Failed to process or save data:", error);
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
