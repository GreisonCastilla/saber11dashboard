import Image from "next/image";
import Sidebar from "./components/sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-screen w-full items-left justify-left bg-gray-500 font-sans dark:bg-slate-500">
      <main className="min-h-screen min-w-screen w-full max-w-3xl flex-col items-center justify-left bg-slate-300 dark:bg-slate-800 sm:items-start">
        <Sidebar />
      </main>
    </div>
  );
}
