'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react';
import { HiX, HiChevronRight, HiChevronLeft } from 'react-icons/hi';

interface HighlightBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface TutorialStep {
    title: string;
    description: string;
    targetId?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "¡Bienvenido al Dashboard ICFES Saber 11!",
        description: "Este panel interactivo te permite analizar los resultados de las pruebas Saber 11 de forma dinámica y visual. Hagamos un recorrido rápido por las funciones principales."
    },
    {
        title: "Agregar Gráficos",
        description: "En esta barra lateral puedes buscar y hacer clic en cualquier gráfico temático (ej. por Estrato, Naturaleza, Género) para agregarlo instantáneamente a tu tablero.",
        targetId: "tutorial-sidebar-charts"
    },
    {
        title: "Organizar por Páginas",
        description: "Puedes crear múltiples páginas de análisis para separar tus tableros. Haz clic en el botón '+' para añadir una nueva página en blanco o usando una plantilla prediseñada.",
        targetId: "tutorial-page-selector"
    },
    {
        title: "Personalizar tu Cuadrícula",
        description: "Arrastra los gráficos desde el ícono superior para reordenarlos. También puedes estirar las tarjetas desde la esquina inferior derecha para hacerlas más grandes o más pequeñas.",
        targetId: "dashboard-grid"
    },
    {
        title: "Exportar Reportes",
        description: "Una vez que tengas tu panel configurado a tu gusto, puedes exportarlo como un archivo PDF listo para imprimir o compartir.",
        targetId: "tutorial-export-pdf"
    },
    {
        title: "¡Todo listo!",
        description: "Has completado el recorrido. Ahora puedes empezar a explorar los datos de las pruebas Saber 11. Si necesitas ayuda, puedes recargar el tutorial en cualquier momento."
    }
];

export default function Tutorial() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Initial load: check if first time or if event is triggered
    useEffect(() => {
        const completed = localStorage.getItem('saber11_tutorial_completed');
        if (!completed) {
            setIsOpen(true);
        }

        const handleTrigger = () => {
            setStep(0);
            setIsOpen(true);
        };

        window.addEventListener('trigger-tutorial', handleTrigger);
        return () => window.removeEventListener('trigger-tutorial', handleTrigger);
    }, []);

    // Track targets dynamically
    useEffect(() => {
        if (!isOpen) {
            setHighlightBox(null);
            return;
        }

        const stepData = TUTORIAL_STEPS[step];
        if (stepData && stepData.targetId) {
            const element = document.getElementById(stepData.targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                const updateBox = () => {
                    const rect = element.getBoundingClientRect();
                    setHighlightBox({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });
                };

                // Minor delay to let scrolling settle
                const timer = setTimeout(updateBox, 300);
                
                window.addEventListener('resize', updateBox);
                window.addEventListener('scroll', updateBox);

                return () => {
                    clearTimeout(timer);
                    window.removeEventListener('resize', updateBox);
                    window.removeEventListener('scroll', updateBox);
                };
            }
        }
        setHighlightBox(null);
    }, [step, isOpen]);

    const handleNext = () => {
        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('saber11_tutorial_completed', 'true');
    };

    if (!isOpen) return null;

    const currentStep = TUTORIAL_STEPS[step];
    const isFirst = step === 0;
    const isLast = step === TUTORIAL_STEPS.length - 1;

    // Responsive positioning helper
    const getCardStyle = (): React.CSSProperties => {
        if (typeof window === 'undefined') return {};
        
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return {
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)',
                maxWidth: '400px',
            };
        }

        if (!highlightBox) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        // Intuitively place card near target
        if (currentStep.targetId === 'tutorial-sidebar-charts' || currentStep.targetId === 'tutorial-export-pdf') {
            return {
                top: `${Math.min(window.innerHeight - 320, Math.max(20, highlightBox.top + highlightBox.height / 2 - 120))}px`,
                left: `${highlightBox.left + highlightBox.width + 24}px`,
            };
        }

        if (currentStep.targetId === 'tutorial-page-selector') {
            return {
                top: `${highlightBox.top + highlightBox.height + 24}px`,
                left: `${Math.min(window.innerWidth - 420, Math.max(20, highlightBox.left + highlightBox.width / 2 - 175))}px`,
            };
        }

        if (currentStep.targetId === 'dashboard-grid') {
            return {
                top: `${Math.min(window.innerHeight - 320, Math.max(20, highlightBox.top + 100))}px`,
                left: `${Math.min(window.innerWidth - 420, Math.max(20, highlightBox.left + highlightBox.width / 2 - 175))}px`,
            };
        }

        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        };
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
            {/* Backdrop & Spotlight cutout using shadow trick */}
            {highlightBox ? (
                <div
                    className="fixed z-[9998] border-2 border-primary/80 bg-transparent rounded-xl pointer-events-auto transition-all duration-300 ease-out"
                    style={{
                        top: highlightBox.top - 6,
                        left: highlightBox.left - 6,
                        width: highlightBox.width + 12,
                        height: highlightBox.height + 12,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
                    }}
                />
            ) : (
                <div className="fixed inset-0 z-[9998] bg-slate-900/75 backdrop-blur-sm pointer-events-auto transition-all duration-300" />
            )}

            {/* Tutorial Card */}
            <div
                ref={cardRef}
                style={getCardStyle()}
                className="fixed z-[9999] pointer-events-auto flex flex-col p-6 w-[350px] sm:w-[380px] rounded-2xl backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-800/80 shadow-2xl transition-all duration-300 ease-out animate-fade-in"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                        {currentStep.title}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Cerrar tutorial"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {currentStep.description}
                </p>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-auto">
                    {/* Progress indicators */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === step
                                        ? "w-5 bg-primary"
                                        : "w-1.5 bg-gray-300 dark:bg-gray-700"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        {!isFirst && (
                            <button
                                onClick={handleBack}
                                className="flex items-center justify-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                            >
                                <HiChevronLeft className="w-4 h-4 mr-0.5" />
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center justify-center py-2 px-4 text-xs font-semibold text-white bg-primary hover:bg-primary/95 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            {isLast ? "Finalizar" : "Siguiente"}
                            {!isLast && <HiChevronRight className="w-4 h-4 ml-0.5" />}
                        </button>
                    </div>
                </div>

                {/* Skip link on welcome step */}
                {isFirst && (
                    <button
                        onClick={handleClose}
                        className="mt-4 text-center text-xs text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors underline cursor-pointer"
                    >
                        Omitir recorrido
                    </button>
                )}
            </div>
        </div>
    );
}
