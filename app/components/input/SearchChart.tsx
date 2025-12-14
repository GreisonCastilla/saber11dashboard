"use client"
import { useEffect, useState } from "react";

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
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border p-1 rounded-lg outline-none dark:border-white"
            placeholder={placeholder}
            aria-label="buscar gráficos"
        />
    );
}