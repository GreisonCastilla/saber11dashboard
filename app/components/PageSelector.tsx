'use client';

import { useChart } from "../contexts/ChartContext";
import { HiPlus, HiX, HiPencil } from "react-icons/hi";
import { useState } from "react";

export default function PageSelector() {
    const { pages, activePageId, setActivePage, addPage, removePage, updatePageName } = useChart();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAddPage = () => {
        const name = prompt("Enter page name:", "New Page");
        if (name) {
            // Check if template is needed (future feature), for now just blank
            addPage(name);
        }
    };

    const handleRemovePage = (e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this page?")) {
            removePage(pageId);
        }
    };

    const startEditing = (e: React.MouseEvent, pageId: string, currentName: string) => {
        e.stopPropagation();
        setIsEditing(pageId);
        setEditName(currentName);
    };

    const saveEdit = (pageId: string) => {
        if (editName.trim()) {
            updatePageName(pageId, editName.trim());
        }
        setIsEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
        if (e.key === 'Enter') {
            saveEdit(pageId);
        }
    };

    return (
        <div className="flex flex-col gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Pages</span>
                <button
                    onClick={handleAddPage}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-primary transition-colors"
                    title="Add Page"
                >
                    <HiPlus className="w-5 h-5" />
                </button>
            </div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {pages.map((page) => (
                    <div
                        key={page.id}
                        onClick={() => setActivePage(page.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors group ${
                            activePageId === page.id
                                ? "bg-primary/10 border-l-4 border-primary dark:bg-primary/20"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                        {isEditing === page.id ? (
                            <input
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => saveEdit(page.id)}
                                onKeyDown={(e) => handleKeyDown(e, page.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 text-sm"
                            />
                        ) : (
                            <span className={`text-sm truncate ${activePageId === page.id ? "font-medium" : ""}`}>
                                {page.name}
                            </span>
                        )}

                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => startEditing(e, page.id, page.name)}
                                className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                                <HiPencil className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => handleRemovePage(e, page.id)}
                                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                                <HiX className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
