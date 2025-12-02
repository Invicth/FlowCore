import React, { useState, useCallback } from 'react';
import { PVC_SCH40_PIPES } from './pipeConstants';
import type { PotableWaterResult } from './types';

const PotableWaterSizingCalculator = () => {
    const [flow, setFlow] = useState('');
    const [velocity, setVelocity] = useState('2.0');
    const [result, setResult] = useState<PotableWaterResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(() => {
        const numFlow = parseFloat(flow);
        const numVelocity = parseFloat(velocity);

        if (isNaN(numFlow) || isNaN(numVelocity) || numFlow <= 0 || numVelocity <= 0) {
            setError('Entradas inválidas.');
            setResult(null);
            return;
        }
        
        setError(null);
        const flowM3s = numFlow / 1000;
        const minAreaM2 = flowM3s / numVelocity;
        const theoreticalDiameterM = Math.sqrt((4 * minAreaM2) / Math.PI);
        const theoreticalDiameterMm = theoreticalDiameterM * 1000;
        const commercialPipe = PVC_SCH40_PIPES.find(pipe => pipe.id_mm >= theoreticalDiameterMm);

        if (!commercialPipe) {
             setError('Diámetro fuera de rango comercial.');
             setResult(null);
             return;
        }

        setResult({
            theoreticalDiameter: theoreticalDiameterMm,
            commercialPipe: commercialPipe
        });

    }, [flow, velocity]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
                <div>
                    <label htmlFor="potable-flow" className="block text-sm font-serif italic mb-1 text-black">Caudal de Diseño (Q)</label>
                    <div className="flex border-b border-gray-400">
                        <input type="number" id="potable-flow" value={flow} onChange={e => setFlow(e.target.value)} className="w-full bg-transparent outline-none font-mono text-sm py-1" placeholder="0.00" />
                        <span className="text-xs font-mono text-gray-500 py-1 print:text-black">l/s</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="potable-velocity" className="block text-sm font-serif italic mb-1 text-black">Velocidad Límite (V<sub>max</sub>)</label>
                     <div className="flex border-b border-gray-400">
                        <input type="number" id="potable-velocity" value={velocity} onChange={e => setVelocity(e.target.value)} className="w-full bg-transparent outline-none font-mono text-sm py-1" placeholder="2.0" />
                        <span className="text-xs font-mono text-gray-500 py-1 print:text-black">m/s</span>
                    </div>
                </div>
            </div>

            <button onClick={handleCalculate} className="w-full border border-black py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors print:hidden">
                Ejecutar Cálculo
            </button>

            {error && <div className="text-red-800 font-mono text-xs border-l-2 border-red-800 pl-2 mt-4">{error}</div>}

            {result && !error && (
                <div className="mt-8 border-t-2 border-b-2 border-black py-4">
                    <h3 className="font-bold mb-4 pb-1 text-sm uppercase">Resultados: Selección de Diámetro</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="font-serif">Diámetro Teórico (Mínimo):</div>
                        <div className="font-mono text-right">{result.theoreticalDiameter.toFixed(2)} mm</div>
                        
                        <div className="font-serif font-bold">Diámetro Comercial (PVC SCH40):</div>
                        <div className="font-mono font-bold text-right border-b-2 border-black w-fit justify-self-end">
                            {result.commercialPipe.nominal}
                        </div>
                    </div>
                    
                    <div className="mt-4 text-[10px] font-mono text-gray-500 text-right print:text-black">
                        ID Real: {result.commercialPipe.id_mm} mm | Nominal ISO: {result.commercialPipe.nominal_mm} mm
                    </div>
                </div>
            )}
        </div>
    );
};

export default PotableWaterSizingCalculator;