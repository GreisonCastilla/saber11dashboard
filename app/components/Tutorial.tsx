'use client';

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
    /** El objetivo vive dentro de la barra lateral: hay que abrirla para señalarlo. */
    necesitaSidebar?: boolean;
}

const MARGEN = 16;

/**
 * ¿Se puede señalar este elemento? Descarta lo que está oculto (`display:none`,
 * `visibility`, opacidad 0), lo que mide casi nada y lo que quedó fuera de la
 * pantalla (por ejemplo la barra lateral cerrada, que se desplaza hacia afuera).
 */
function esSeñalable(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return false;
    if (rect.right <= 0 || rect.bottom <= 0) return false;
    if (rect.left >= window.innerWidth || rect.top >= window.innerHeight) return false;

    const estilo = window.getComputedStyle(el);
    if (estilo.visibility === 'hidden' || estilo.display === 'none') return false;
    return Number(estilo.opacity) > 0.05;
}

/**
 * Busca el objetivo de un paso. Algunos componentes se pintan dos veces (la barra
 * de páginas existe en la barra lateral y en la superior, y solo una está visible
 * según el ancho de pantalla), así que hay que quedarse con la que de verdad se ve.
 */
function buscarObjetivo(targetId: string): HTMLElement | null {
    const candidatos = Array.from(
        document.querySelectorAll<HTMLElement>(`#${targetId}, [data-tutorial="${targetId}"]`)
    );
    return candidatos.find(esSeñalable) ?? null;
}

const mismaCaja = (a: HighlightBox | null, b: HighlightBox) =>
    !!a && Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1 &&
    Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "¡Bienvenido al Dashboard ICFES Saber 11!",
        description: "Este panel interactivo te permite analizar los resultados de las pruebas Saber 11 de forma dinámica y visual. Hagamos un recorrido rápido por las funciones principales."
    },
    {
        title: "Agregar Gráficos",
        description: "En esta barra lateral puedes buscar y hacer clic en cualquier gráfico temático (ej. por Estrato, Naturaleza, Género) para agregarlo instantáneamente a tu tablero.",
        targetId: "tutorial-sidebar-charts",
        necesitaSidebar: true
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
        targetId: "tutorial-export-pdf",
        necesitaSidebar: true
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
    // Tamaño real de la tarjeta, medido mientras el tutorial está abierto: se
    // necesita para colocarla sin que tape lo señalado ni se salga de pantalla.
    const [cardSize, setCardSize] = useState({ ancho: 380, alto: 260 });
    const cardRef = useRef<HTMLDivElement>(null);

    // Initial load: check if first time or if event is triggered
    useEffect(() => {
        const completed = localStorage.getItem('saber11_tutorial_completed');
        if (!completed) {
            // localStorage no existe al renderizar en el servidor, así que esta
            // comprobación tiene que ocurrir después del montaje.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsOpen(true);
        }

        const handleTrigger = () => {
            setStep(0);
            setIsOpen(true);
        };

        window.addEventListener('trigger-tutorial', handleTrigger);
        return () => window.removeEventListener('trigger-tutorial', handleTrigger);
    }, []);

    // Seguimiento del objetivo de cada paso.
    useEffect(() => {
        if (!isOpen) return;

        const stepData = TUTORIAL_STEPS[step];
        const targetId = stepData?.targetId;

        if (targetId && stepData.necesitaSidebar) {
            // Si está plegada, el objetivo no se ve (o queda fuera de pantalla).
            window.dispatchEvent(new Event('abrir-sidebar'));
        }

        let raf = 0;
        let yaCentrado = false;

        // Se vuelve a medir en cada cuadro: el objetivo puede aparecer más tarde,
        // moverse mientras la barra lateral se despliega (medio segundo de
        // animación), o desplazarse con el scroll suave. Solo se actualiza el
        // estado cuando la caja cambia de verdad.
        const medir = () => {
            const element = targetId ? buscarObjetivo(targetId) : null;

            if (element) {
                if (!yaCentrado) {
                    yaCentrado = true;
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                const rect = element.getBoundingClientRect();
                const caja = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
                setHighlightBox((previa) => (mismaCaja(previa, caja) ? previa : caja));
            } else {
                // Nada que señalar: mejor el fondo completo que un marco en un
                // sitio equivocado.
                setHighlightBox((previa) => (previa === null ? previa : null));
            }

            const tarjeta = cardRef.current;
            if (tarjeta) {
                const ancho = tarjeta.offsetWidth;
                const alto = tarjeta.offsetHeight;
                setCardSize((previo) =>
                    previo.ancho === ancho && previo.alto === alto ? previo : { ancho, alto }
                );
            }

            raf = requestAnimationFrame(medir);
        };

        raf = requestAnimationFrame(medir);
        return () => cancelAnimationFrame(raf);
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

    /**
     * Coloca la tarjeta junto a lo señalado sin taparlo: prueba abajo, a la
     * derecha, arriba y a la izquierda, y se queda con el primer lado donde
     * quepa de verdad (según el tamaño real de la tarjeta, no uno supuesto).
     */
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

        const centrada: React.CSSProperties = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        };

        if (!highlightBox) return centrada;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const { ancho, alto } = cardSize;

        const caja = highlightBox;
        const centroX = caja.left + caja.width / 2 - ancho / 2;
        const centroY = caja.top + caja.height / 2 - alto / 2;

        const lados = [
            { top: caja.top + caja.height + MARGEN, left: centroX,
              cabe: caja.top + caja.height + MARGEN + alto <= vh - MARGEN },
            { top: centroY, left: caja.left + caja.width + MARGEN,
              cabe: caja.left + caja.width + MARGEN + ancho <= vw - MARGEN },
            { top: caja.top - alto - MARGEN, left: centroX,
              cabe: caja.top - alto - MARGEN >= MARGEN },
            { top: centroY, left: caja.left - ancho - MARGEN,
              cabe: caja.left - ancho - MARGEN >= MARGEN },
        ];

        const elegido = lados.find((lado) => lado.cabe);
        // Si el objetivo ocupa casi toda la pantalla no hay hueco libre: la
        // tarjeta va abajo del todo, que es lo que menos estorba.
        if (!elegido) {
            return { top: `${vh - alto - MARGEN}px`, left: `${Math.max(MARGEN, vw / 2 - ancho / 2)}px` };
        }

        const limitar = (valor: number, maximo: number) =>
            Math.max(MARGEN, Math.min(valor, maximo - MARGEN));

        return {
            top: `${limitar(elegido.top, vh - alto)}px`,
            left: `${limitar(elegido.left, vw - ancho)}px`,
        };
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
            {/* Backdrop & Spotlight cutout using shadow trick */}
            {currentStep.targetId && highlightBox ? (
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
