import React from 'react';
import { PipeDef, ResultCell, Slope } from '../types';

interface ResultTableProps {
  data: {
    pipe: PipeDef;
    results: { [slopeKey: string]: ResultCell };
  }[];
}

const slopes = [Slope.S05, Slope.S10, Slope.S20];

const formatNumber = (num: number | undefined) => {
  if (num === undefined) return '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
};

const CellContent: React.FC<{ result: ResultCell }> = ({ result }) => {
  if (!result.isValid) {
    return (
      <div className="flex flex-col items-center justify-center py-2 opacity-50 bg-gray-50 mx-1">
        <span className="text-[9px] uppercase font-bold text-red-900 border-b border-red-900 mb-1">
          {result.failReason === 'LOW_TAU_MAX' ? 'Fuerza Tractiva < 0.15' : 'Rango Inválido'}
        </span>
        <span className="text-[9px] font-mono">τ={result.tauMax.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-1 px-1">
      {/* Explicit Unit Label for clarity */}
      <div className="text-[9px] text-gray-500 font-serif italic text-center mb-0.5 leading-tight">
        Área Drenaje (m²)
      </div>
      
      {/* Primary Result: Area Range */}
      <div className="text-center font-mono text-sm font-bold text-black border-b border-dotted border-gray-300 pb-1 mb-1">
        {formatNumber(result.areaMin)} - {formatNumber(result.areaMax)}
      </div>
      
      {/* Secondary Metrics */}
      <div className="flex justify-between items-end text-[9px] text-gray-600 font-serif">
        <span title="Caudal Máximo">Q<sub>max</sub>: {result.qMax?.toFixed(1)} l/s</span>
        <span title="Fuerza Tractiva">τ: {result.tauMax.toFixed(2)}</span>
      </div>
    </div>
  );
};

const ResultTable: React.FC<ResultTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      {/* Scientific Table Caption */}
      <div className="mb-3 border-l-4 border-black pl-3 py-1 bg-gray-50 print:bg-white">
        <h4 className="font-bold font-serif text-black text-lg leading-none mb-1">Tabla 1: Matriz de Áreas de Drenaje Permisibles</h4>
        <p className="font-serif italic text-sm text-gray-700">
          Valores indican la superficie máxima en <strong>metros cuadrados (m²)</strong> que cada diámetro puede drenar eficientemente cumpliendo criterios de autolimpieza.
        </p>
      </div>

      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr className="border-t-2 border-b border-black bg-white">
            <th className="py-3 px-2 text-left font-serif font-bold italic text-black w-1/5 bg-gray-50 print:bg-white">
              Diámetro Nominal
            </th>
            {slopes.map((slope) => (
              <th key={slope} className="py-3 px-2 text-center font-serif font-bold text-black w-1/4">
                Pendiente <span className="font-normal italic block text-xs mt-1">S = {slope.toFixed(1)}%</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-b-2 border-black">
          {data.map((row) => (
            <tr key={row.pipe.nombre} className="hover:bg-gray-50 transition-colors break-inside-avoid">
              <td className="py-3 px-2 align-middle bg-gray-50/50 print:bg-white">
                <div className="font-serif font-bold text-black">{row.pipe.nombre}</div>
                <div className="font-mono text-[10px] text-gray-500">ID Real: {row.pipe.id_mm.toFixed(1)} mm</div>
              </td>
              {slopes.map((slope) => (
                <td key={slope} className="py-2 px-1 border-l border-gray-200 align-middle bg-white">
                  <CellContent result={row.results[slope.toString()]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-gray-600 font-serif bg-gray-50 p-2 border border-gray-200 print:bg-white print:border-none print:p-0">
         <div>
            <strong>Criterios de Diseño:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Régimen Parcialmente Lleno (y/D = 0.85).</li>
                <li>Fuerza Tractiva Mínima τ ≥ 0.15 kg/m².</li>
            </ul>
         </div>
         <div>
            <strong>Nomenclatura:</strong>
             <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Q<sub>max</sub>: Capacidad hidráulica máxima (l/s).</li>
                <li>τ: Esfuerzo cortante en la pared (kg/m²).</li>
            </ul>
         </div>
      </div>
    </div>
  );
};

export default ResultTable;