import React, { useState, useCallback } from 'react';
import { HUNTER_DATA_TANQUE, HUNTER_DATA_FLUXO } from './constants';
import { getCaudalInterpolado } from './services/interpolationService';

const HunterCalculator = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [tankResult, setTankResult] = useState<number | null>(null);
    const [fluxoResult, setFluxoResult] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(() => {
        setError(null);
        const hunterUnits = parseFloat(inputValue);

        if (isNaN(hunterUnits) || hunterUnits <= 0) {
            setError("Valor numérico inválido.");
            setTankResult(null);
            setFluxoResult(null);
            return;
        }

        const caudalTanque = getCaudalInterpolado(HUNTER_DATA_TANQUE, hunterUnits);
        const caudalFluxo = getCaudalInterpolado(HUNTER_DATA_FLUXO, hunterUnits);

        setTankResult(caudalTanque);
        setFluxoResult(caudalFluxo);

    }, [inputValue]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6 bg-gray-50 p-4 border border-black print:bg-white print:border-none print:p-0">
                 <label htmlFor="unidades-hunter" className="font-serif font-bold text-black min-w-fit">
                    Unidades Hunter (UH):
                </label>
                <div className="flex-grow flex items-center gap-4">
                    <input
                        type="number"
                        id="unidades-hunter"
                        step="0.1"
                        min="0.1"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ej: 25.5"
                        className="flex-grow p-2 bg-white border-b border-gray-400 font-mono focus:border-black outline-none print:p-0"
                    />
                    <button
                        onClick={handleCalculate}
                        className="px-6 py-2 border border-black bg-white text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors print:hidden"
                    >
                        Calcular
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-red-800 font-mono text-xs border-l-2 border-red-800 pl-2">
                    Error: {error}
                </div>
            )}

            {(tankResult !== null || fluxoResult !== null) && (
                <div className="mt-8">
                    <h3 className="font-bold border-b border-black mb-4 pb-1">Tabla 2.1: Resultados de Caudal Probable</h3>
                    <table className="w-full text-sm border-t-2 border-b-2 border-black">
                        <thead>
                            <tr className="border-b border-gray-400">
                                <th className="text-left py-2 font-serif italic">Tipo de Sistema</th>
                                <th className="text-right py-2 font-serif italic">Caudal Resultante (l/s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-serif">Sistema con Tanque</td>
                                <td className="py-3 text-right font-mono font-bold">
                                    {tankResult !== null ? tankResult.toFixed(3) : '-'}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 font-serif">Sistema con Fluxómetro</td>
                                <td className="py-3 text-right font-mono font-bold">
                                    {fluxoResult !== null ? fluxoResult.toFixed(3) : '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HunterCalculator;