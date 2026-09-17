"use client"
import { useEffect, useState } from "react";
import { HiOutlineSearch, HiX } from "react-icons/hi";

type Props = {
    onSearch: (query: string) => void;
    delay?: number; // milliseconds
    placeholder?: string;
};

export default function SearchChart({ onSearch, delay = 800, placeholder = "Buscar gráfico..." }: Props) {
    const [input, setInput] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(input.trim());
        }, delay);

        return () => clearTimeout(handler);
    }, [input, delay, onSearch]);

    return (
        <div className="relative flex items-center">
            <HiOutlineSearch className="absolute left-0 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        setInput("");
                        onSearch("");
                    }
                }}
                className="w-full border-b-2 p-1 pl-6 pr-6 focus:border-primary transition-colors duration-500 outline-none dark:border-white"
                placeholder={placeholder}
                aria-label="buscar gráficos"
            />
            {input && (
                <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                        setInput("");
                        onSearch("");
                    }}
                    className="absolute right-0 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                    <HiX className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
