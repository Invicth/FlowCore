

import React from 'react';
import { CalculationInput } from '../types';

interface InputPanelProps {
  inputs: CalculationInput;
  onChange: (key: keyof CalculationInput, value: number) => void;
  onCalculate: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ inputs, onChange, onCalculate }) => {
  const handleChange = (key: keyof CalculationInput, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(key, val);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4 border-b border-gray-300 pb-2">
        <h3 className="text-lg font-bold text-black">1.1 Parámetros de Entrada</h3>
        <button
          onClick={onCalculate}
          className="bg-white border border-black px-4 py-1 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors print:hidden"
        >
          Actualizar Cálculos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-sm">
        
        {/* Input Item */}
        <div className="flex justify-between items-center border-b border-gray-400 pb-1">
          <label className="font-serif italic text-gray-800 print:text-black">
            Intensidad de Diseño <span className="font-normal not-italic ml-1">(I)</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.01"
              value={inputs.intensity}
              onChange={(e) => handleChange('intensity', e)}
              className="text-right w-24 font-mono bg-transparent outline-none focus:bg-gray-100 pr-1 print:text-black"
            />
            <span className="font-mono text-xs text-gray-500 w-12 text-right print:text-black">mm/hr</span>
          </div>
        </div>

        {/* Input Item */}
        <div className="flex justify-between items-center border-b border-gray-400 pb-1">
          <label className="font-serif italic text-gray-800 print:text-black">
            Coeficiente Escorrentía <span className="font-normal not-italic ml-1">(C)</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="1.0"
              value={inputs.coeffC}
              onChange={(e) => handleChange('coeffC', e)}
              className="text-right w-24 font-mono bg-transparent outline-none focus:bg-gray-100 pr-1 print:text-black"
            />
            <span className="font-mono text-xs text-gray-500 w-12 text-right print:text-black">[-]</span>
          </div>
        </div>

        {/* Input Item */}
        <div className="flex justify-between items-center border-b border-gray-400 pb-1">
          <label className="font-serif italic text-gray-800 print:text-black">
            Rugosidad Absoluta <span className="font-normal not-italic ml-1">(k<sub>s</sub>)</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="1e-7"
              value={inputs.ks}
              onChange={(e) => handleChange('ks', e)}
              className="text-right w-24 font-mono bg-transparent outline-none focus:bg-gray-100 pr-1 print:text-black"
            />
            <span className="font-mono text-xs text-gray-500 w-12 text-right print:text-black">m</span>
          </div>
        </div>

        {/* Input Item */}
        <div className="flex justify-between items-center border-b border-gray-400 pb-1">
          <label className="font-serif italic text-gray-800 print:text-black">
            Viscosidad Cinemática <span className="font-normal not-italic ml-1">(ν)</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="1e-7"
              value={inputs.viscosity}
              onChange={(e) => handleChange('viscosity', e)}
              className="text-right w-24 font-mono bg-transparent outline-none focus:bg-gray-100 pr-1 print:text-black"
            />
            <span className="font-mono text-xs text-gray-500 w-12 text-right print:text-black">m²/s</span>
          </div>
        </div>

        {/* Input Item */}
        <div className="flex justify-between items-center border-b border-gray-400 pb-1">
          <label className="font-serif italic text-gray-800 print:text-black">
            Relación de Llenado <span className="font-normal not-italic ml-1">(y/D)</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              value={inputs.fillRatio}
              onChange={(e) => handleChange('fillRatio', e)}
              className="text-right w-24 font-mono bg-transparent outline-none focus:bg-gray-100 pr-1 print:text-black"
            />
            <span className="font-mono text-xs text-gray-500 w-12 text-right print:text-black">%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InputPanel;