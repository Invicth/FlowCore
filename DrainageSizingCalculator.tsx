import React, { useState, useCallback } from 'react';
import { PIPES } from './constants';
import { PipeDef } from './types';

interface DrainageRow {
    pipe: PipeDef;
    capacityLps: number;
    velocity: number;
    waterHeightMm: number;
    isViable: boolean;
}

const DrainageSizingCalculator = () => {
    const [flow, setFlow] = useState('');
    const [slope, setSlope] = useState('2.0');
    const [manningN, setManningN] = useState('0.009');
    const [fillRatio, setFillRatio] = useState('75');
    
    const [results, setResults] = useState<DrainageRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [calculatedFlow, setCalculatedFlow] = useState<number>(0); // Store the input flow used for comparison

    const handleCalculate = useCallback(() => {
        const numFlow = parseFloat(flow);
        const numSlope = parseFloat(slope);
        const numManningN = parseFloat(manningN);
        const numFillRatio = parseFloat(fillRatio);

        if (isNaN(numFlow) || isNaN(numSlope) || isNaN(numManningN) || isNaN(numFillRatio)) {
            setError('Parámetros numéricos inválidos.');
            setResults(null);
            return;
        }
        
        setError(null);
        setCalculatedFlow(numFlow);

        const designFlowM3s = numFlow / 1000;
        const slopeMperM = numSlope / 100;
        const fillRatioDecimal = numFillRatio / 100;

        const calculatedRows: DrainageRow[] = PIPES.map(pipe => {
            const D = pipe.id_mm / 1000; // Convert ID to meters
            
            // Geometric properties for partially filled circular pipe
            // Theta = 2 * acos(1 - 2(y/D))
            const y = D * fillRatioDecimal;
            const acosArg = Math.max(-1, Math.min(1, 1 - (2 * y) / D));
            const theta = 2 * Math.acos(acosArg);
            
            const A = (Math.pow(D, 2) / 8) * (theta - Math.sin(theta));
            const P = (D / 2) * theta;
            const Rh = P > 0 ? A / P : 0;
            
            // Manning Equation: Q = (1/n) * A * Rh^(2/3) * S^(1/2)
            const capacityM3s = A * (1 / numManningN) * Math.pow(Rh, 2/3) * Math.pow(slopeMperM, 1/2);
            
            const realVelocity = A > 0 ? capacityM3s / A : 0;
            
            // Check viability: Pipe capacity must be >= Design Flow
            const isViable = capacityM3s >= designFlowM3s;

            return {
                pipe,
                capacityLps: capacityM3s * 1000,
                velocity: realVelocity,
                waterHeightMm: y * 1000,
                isViable
            };
        });

        setResults(calculatedRows);

    }, [flow, slope, manningN, fillRatio]);
    
    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-6">
                 <div>
                    <label className="block font-serif italic mb-1 text-black">Caudal Diseño (Q)</label>
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

            {results && !error && (
                <div className="mt-8">
                     <div className="mb-3 border-l-4 border-black pl-3 py-1 bg-gray-50 print:bg-white">
                        <h4 className="font-bold font-serif text-black text-lg leading-none mb-1">Tabla de Evaluación Hidráulica</h4>
                        <p className="font-serif italic text-sm text-gray-700">
                            Evaluación de capacidad para Q = <span className="font-mono font-bold">{calculatedFlow.toFixed(2)} l/s</span>. 
                            Las filas resaltadas en verde cumplen con la capacidad requerida.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-t-2 border-b border-black bg-white">
                                    <th className="py-2 px-2 text-left font-serif font-bold italic w-1/4">Diámetro Comercial</th>
                                    <th className="py-2 px-2 text-center font-serif font-bold italic">ID (mm)</th>
                                    <th className="py-2 px-2 text-center font-serif font-bold italic">Capacidad (l/s)</th>
                                    <th className="py-2 px-2 text-center font-serif font-bold italic">Velocidad (m/s)</th>
                                    <th className="py-2 px-2 text-center font-serif font-bold italic">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 border-b-2 border-black">
                                {results.map((row, index) => (
                                    <tr 
                                        key={index} 
                                        className={`
                                            transition-colors 
                                            ${row.isViable ? 'bg-green-100 print:bg-gray-100' : 'hover:bg-gray-50 bg-white'}
                                        `}
                                    >
                                        <td className="py-2 px-2 font-serif font-bold text-black border-r border-transparent">
                                            {row.pipe.nombre}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono text-gray-600">
                                            {row.pipe.id_mm.toFixed(1)}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono font-bold text-black">
                                            {row.capacityLps.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono text-gray-800">
                                            {row.velocity.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-2 text-center font-serif text-xs">
                                            {row.isViable ? (
                                                <span className="text-green-900 font-bold uppercase tracking-wider border border-green-800 px-1 rounded-sm bg-white">
                                                    Cumple
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">
                                                    Insuficiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-2 text-[10px] text-gray-500 font-mono text-right print:text-black">
                        * Capacidad calculada al {fillRatio}% del diámetro interno.
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrainageSizingCalculator;