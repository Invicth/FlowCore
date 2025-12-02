import React, { useState, useCallback } from 'react';
import { PVC_SANITARY_PIPES_MM } from './pipeConstants';
import type { DrainageResult } from './types';

const DrainageSizingCalculator = () => {
    const [flow, setFlow] = useState('');
    const [slope, setSlope] = useState('2.0');
    const [manningN, setManningN] = useState('0.009');
    const [fillRatio, setFillRatio] = useState('75');
    const [result, setResult] = useState<DrainageResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(() => {
        const numFlow = parseFloat(flow);
        const numSlope = parseFloat(slope);
        const numManningN = parseFloat(manningN);
        const numFillRatio = parseFloat(fillRatio);

        if (isNaN(numFlow) || isNaN(numSlope) || isNaN(numManningN) || isNaN(numFillRatio)) {
            setError('Parámetros numéricos inválidos.');
            setResult(null);
            return;
        }
        
        setError(null);

        const designFlowM3s = numFlow / 1000;
        const slopeMperM = numSlope / 100;
        const fillRatioDecimal = numFillRatio / 100;

        let suitablePipeFound = false;

        for (const diameterMm of PVC_SANITARY_PIPES_MM) {
            const D = diameterMm / 1000;
            const y = D * fillRatioDecimal;
            const acosArg = Math.max(-1, Math.min(1, 1 - (2 * y) / D));
            const theta = 2 * Math.acos(acosArg);
            const A = (Math.pow(D, 2) / 8) * (theta - Math.sin(theta));
            const P = (D / 2) * theta;
            const Rh = A / P;
            const capacityM3s = A * (1 / numManningN) * Math.pow(Rh, 2/3) * Math.pow(slopeMperM, 1/2);

            if (capacityM3s >= designFlowM3s) {
                const realVelocity = designFlowM3s / A;
                setResult({
                    recommendedDiameter: diameterMm,
                    flowVelocity: realVelocity,
                    pipeCapacityLps: capacityM3s * 1000,
                    waterHeight: y * 1000,
                });
                suitablePipeFound = true;
                break;
            }
        }

        if (!suitablePipeFound) {
            setError('Capacidad insuficiente con diámetros comerciales disponibles.');
            setResult(null);
        }

    }, [flow, slope, manningN, fillRatio]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-6">
                 <div>
                    <label className="block font-serif italic mb-1 text-black">Caudal (Q)</label>
                    <div className="flex border-b border-gray-400">
                        <input type="number" value={flow} onChange={e => setFlow(e.target.value)} className="w-full bg-transparent outline-none font-mono" placeholder="5.0" />
                        <span className="text-xs text-gray-500 print:text-black">l/s</span>
                    </div>
                </div>
                 <div>
                    <label className="block font-serif italic mb-1 text-black">Pendiente (S)</label>
                    <div className="flex border-b border-gray-400">
                        <input type="number" value={slope} onChange={e => setSlope(e.target.value)} className="w-full bg-transparent outline-none font-mono" placeholder="2.0" />
                        <span className="text-xs text-gray-500 print:text-black">%</span>
                    </div>
                </div>
                 <div>
                    <label className="block font-serif italic mb-1 text-black">Manning (n)</label>
                    <div className="flex border-b border-gray-400">
                        <input type="number" step="0.001" value={manningN} onChange={e => setManningN(e.target.value)} className="w-full bg-transparent outline-none font-mono" placeholder="0.009" />
                    </div>
                </div>
                 <div>
                    <label className="block font-serif italic mb-1 text-black">Tirante (y/D)</label>
                    <div className="flex border-b border-gray-400">
                        <input type="number" min="1" max="99" value={fillRatio} onChange={e => setFillRatio(e.target.value)} className="w-full bg-transparent outline-none font-mono" placeholder="75" />
                        <span className="text-xs text-gray-500 print:text-black">%</span>
                    </div>
                </div>
            </div>

            <button onClick={handleCalculate} className="w-full border border-black py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors print:hidden">
                Calcular Sección
            </button>

            {error && <div className="text-red-800 font-mono text-xs border-l-2 border-red-800 pl-2 mt-4">{error}</div>}

            {result && !error && (
                <div className="mt-8 border-t-2 border-b-2 border-black py-4">
                     <div className="flex justify-between items-center border-b border-dotted border-gray-300 pb-2 mb-4">
                        <span className="font-serif font-bold text-lg">Diámetro Recomendado:</span>
                        <span className="font-mono font-bold text-2xl">{result.recommendedDiameter} mm</span>
                    </div>
                    <table className="w-full text-sm">
                         <tbody>
                            <tr className="border-b border-dotted border-gray-300">
                                <td className="py-2 font-serif italic text-gray-600 print:text-black">Velocidad del Flujo (V)</td>
                                <td className="py-2 text-right font-mono">{result.flowVelocity.toFixed(3)} m/s</td>
                            </tr>
                            <tr className="border-b border-dotted border-gray-300">
                                <td className="py-2 font-serif italic text-gray-600 print:text-black">Capacidad Total Tubo (Q<sub>cap</sub>)</td>
                                <td className="py-2 text-right font-mono">{result.pipeCapacityLps.toFixed(2)} l/s</td>
                            </tr>
                            <tr className="border-b border-dotted border-gray-300">
                                <td className="py-2 font-serif italic text-gray-600 print:text-black">Altura Lámina Agua (y)</td>
                                <td className="py-2 text-right font-mono">{result.waterHeight.toFixed(2)} mm</td>
                            </tr>
                         </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DrainageSizingCalculator;