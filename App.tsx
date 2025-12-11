

import React, { useState, useMemo } from 'react';
import { DEFAULT_INPUTS, PIPES } from './constants';
import { CalculationInput, Slope } from './types';
import InputPanel from './components/InputPanel';
import ResultTable from './components/ResultTable';
import { calculateAll } from './utils/calculations';
import HunterCalculator from './HunterCalculator';
import PotableWaterSizingCalculator from './PotableWaterSizingCalculator';
import DrainageSizingCalculator from './DrainageSizingCalculator';

enum Section {
  PLUVIAL = 'Pluvial Matrix',
  HUNTER = 'Hunter Units',
  POTABLE = 'Potable Water',
  DRAINAGE = 'Drainage Flow'
}

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.PLUVIAL);
  
  // -- State for Pluvial Matrix (Existing Logic) --
  const [inputs, setInputs] = useState<CalculationInput>(DEFAULT_INPUTS);
  const [calculationTrigger, setCalculationTrigger] = useState<number>(0);

  const handleInputChange = (key: keyof CalculationInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    setCalculationTrigger(prev => prev + 1);
  };

  const tableData = useMemo(() => {
    return calculateAll(inputs, PIPES, [Slope.S05, Slope.S10, Slope.S20]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, calculationTrigger]); 

  // -- Render Helper --
  const renderSection = () => {
    switch (activeSection) {
      case Section.PLUVIAL:
        return (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">1. Matriz de Diseño Pluvial</h2>
              <p className="mt-2 text-justify leading-relaxed">
                Herramienta de cálculo para validación de fuerza tractiva y capacidad hidráulica en conductos circulares. El resultado principal indica el <strong>Área de Drenaje (m²)</strong> que la tubería puede soportar.
              </p>
            </div>
            
            <InputPanel 
              inputs={inputs} 
              onChange={handleInputChange} 
              onCalculate={handleCalculate}
            />
            
            <div className="mt-8">
              <ResultTable data={tableData} fillRatio={inputs.fillRatio} />
            </div>
          </div>
        );
      case Section.HUNTER:
        return (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">2. Cálculo de Unidades Hunter</h2>
              <p className="mt-2 text-justify leading-relaxed">
                Determinación del caudal máximo probable mediante el método de Hunter. La curva de Hunter empleada es la establecida en la norma NTC 1500.
              </p>
            </div>
            <HunterCalculator />
          </div>
        );
      case Section.POTABLE:
        return (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">3. Dimensionamiento Agua Potable</h2>
              <p className="mt-2 text-justify leading-relaxed">
                Selección de diámetro comercial (PVC SCH40) basado en velocidad límite y caudal de demanda. 
                Cálculo del área hidráulica requerida.
              </p>
            </div>
            <PotableWaterSizingCalculator />
          </div>
        );
      case Section.DRAINAGE:
        return (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">4. Dimensionamiento Sanitario (Manning)</h2>
              <p className="mt-2 text-justify leading-relaxed">
                Cálculo iterativo para conductos de desagüe utilizando la ecuación de Manning para flujo a superficie libre.
                Se busca el diámetro comercial mínimo que satisfaga el caudal de diseño y el tirante máximo.
              </p>
            </div>
            <DrainageSizingCalculator />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 print:p-0 print:min-h-0 print:bg-white">
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-10 sm:p-16 border border-gray-200 relative print:shadow-none print:border-none print:max-w-none print:w-full print:p-0 print:min-h-0">
        
        {/* Paper Header */}
        <header className="border-b-4 border-double border-black pb-6 mb-10 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-gray-600 print:text-black">Informe Técnico de Ingeniería</div>
          <h1 className="text-5xl font-bold text-black mb-2 tracking-tight font-serif">Flow Core</h1>
          <div className="flex justify-center items-center gap-4 text-sm italic text-gray-700 print:text-black">
            <span>Suite de Ingeniería Hidrosanitaria</span>
            <span>&bull;</span>
            <span>v1.0.4</span>
          </div>
        </header>

        {/* Navigation / TOC - Hidden on Print */}
        <nav className="mb-12 print:hidden">
          <ul className="flex flex-wrap justify-center gap-2 sm:gap-6 border-b border-black pb-1">
            {Object.values(Section).map((sec) => (
              <li key={sec}>
                <button
                  onClick={() => setActiveSection(sec)}
                  className={`
                    px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all
                    ${activeSection === sec 
                      ? 'bg-black text-white' 
                      : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'}
                  `}
                >
                  {sec}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main>
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-6 border-t border-black text-center text-xs text-gray-500 font-mono print:mt-10 print:text-black">
          <p>Made by Victor Diaz</p>
        </footer>

      </div>
    </div>
  );
};

export default App;