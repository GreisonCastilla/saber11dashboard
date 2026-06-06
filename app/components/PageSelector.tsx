'use client';

import { useChart, PRESET_TEMPLATES } from "../contexts/ChartContext";
import { HiPlus, HiX, HiPencil, HiTemplate, HiDocumentText } from "react-icons/hi";
import { useState } from "react";
import Modal from "./ui/Modal";
import graphics from "../graphics/Graphics.json";

interface PageSelectorProps {
    mode?: 'sidebar' | 'topbar';
}

export default function PageSelector({ mode = 'sidebar' }: PageSelectorProps) {
    const { pages, activePageId, setActivePage, addPage, addPageFromTemplate, removePage, updatePageName } = useChart();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    
    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<string | null>(null);
    const [newPageName, setNewPageName] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [creationMode, setCreationMode] = useState<'blank' | 'template'>('blank');

    const handleAddPage = () => {
        setNewPageName("");
        setIsAddModalOpen(true);
    };

    const confirmAddPage = () => {
        if (creationMode === 'template' && selectedTemplate) {
            addPageFromTemplate(selectedTemplate, graphics);
            setIsAddModalOpen(false);
        } else if (newPageName.trim()) {
            addPage(newPageName.trim());
            setIsAddModalOpen(false);
        }
    };

    const handleRemovePage = (e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        setPageToDelete(pageId);
        setIsDeleteModalOpen(true);
    };

    const confirmRemovePage = () => {
        if (pageToDelete) {
            removePage(pageToDelete);
            setIsDeleteModalOpen(false);
            setPageToDelete(null);
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

    // Styles based on mode
    const containerClass = mode === 'sidebar' 
        ? "flex flex-col gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
        : "flex items-center gap-2 overflow-x-auto p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700";
    
    const headerClass = mode === 'sidebar'
        ? "flex justify-between items-center mb-1"
        : "hidden"; // No header in topbar mode

    const listClass = mode === 'sidebar'
        ? "flex flex-col gap-1 max-h-40 overflow-y-auto"
        : "flex flex-row gap-2";

    const itemClass = (pageId: string) => {
        const isActive = activePageId === pageId;
        if (mode === 'sidebar') {
            return `flex items-center justify-between p-2 rounded cursor-pointer transition-colors group ${
                isActive
                    ? "bg-primary/10 border-l-4 border-primary dark:bg-primary/20"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`;
        } else {
            return `flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors cursor-pointer whitespace-nowrap group ${
                isActive
                    ? "border-primary text-primary bg-primary/5 font-medium"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`;
        }
    };

    return (
        <>
            <div id="tutorial-page-selector" className={containerClass}>
                <div className={headerClass}>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Páginas</span>
                    <button
                        onClick={handleAddPage}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-primary transition-colors"
                        title="Nueva Página"
                    >
                        <HiPlus className="w-5 h-5" />
                    </button>
                </div>
                
                <div className={listClass}>
                    {pages.map((page) => (
                        <div
                            key={page.id}
                            onClick={() => setActivePage(page.id)}
                            className={itemClass(page.id)}
                        >
                            {isEditing === page.id ? (
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => saveEdit(page.id)}
                                    onKeyDown={(e) => handleKeyDown(e, page.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 text-sm min-w-20"
                                />
                            ) : (
                                <span className="text-sm truncate max-w-[150px]">
                                    {page.name}
                                </span>
                            )}

                            <div className={`flex items-center gap-1 md:opacity-0 group-hover:opacity-100 opacity-100 transition-opacity ${mode === 'topbar' ? 'ml-2' : ''}`}>
                                <button
                                    onClick={(e) => startEditing(e, page.id, page.name)}
                                    className="p-0.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                    title="Renombrar"
                                >
                                    <HiPencil className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => handleRemovePage(e, page.id)}
                                    className="p-0.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                    title="Eliminar"
                                >
                                    <HiX className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {mode === 'topbar' && (
                        <button
                            onClick={handleAddPage}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-primary transition-colors ml-2"
                            title="Nueva Página"
                        >
                            <HiPlus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Modal Crear Página */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nueva Página">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <button
                            onClick={() => setCreationMode('blank')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                creationMode === 'blank' 
                                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            }`}
                        >
                            <HiDocumentText className="w-4 h-4" />
                            Página en blanco
                        </button>
                        <button
                            onClick={() => setCreationMode('template')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                creationMode === 'template' 
                                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            }`}
                        >
                            <HiTemplate className="w-4 h-4" />
                            Usar Plantilla
                        </button>
                    </div>

                    {creationMode === 'blank' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre de la página
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirmAddPage()}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
                                placeholder="Ej. Análisis Mensual"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Selecciona una configuración predeterminada
                            </label>
                            {PRESET_TEMPLATES.map((template) => (
                                <div
                                    key={template.name}
                                    onClick={() => setSelectedTemplate(template.name)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedTemplate === template.name
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                                    }`}
                                >
                                    <h4 className="font-semibold text-sm">{template.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">
                                        Incluye {template.chartIds.length} gráficos relacionados
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmAddPage}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                            disabled={creationMode === 'blank' ? !newPageName.trim() : !selectedTemplate}
                        >
                            Crear Página
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Eliminar Página */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Página">
                <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmRemovePage}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
