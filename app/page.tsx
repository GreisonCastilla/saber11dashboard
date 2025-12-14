import Image from "next/image";
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import GridChart from "./components/gridChart/GridChart";
export default function Home() {
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
