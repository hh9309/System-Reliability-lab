/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ModuleKey } from './components/Navbar';
import { ModuleAlgebra } from './components/ModuleAlgebra';
import { ModuleWeibull } from './components/ModuleWeibull';
import { ModuleRBD } from './components/ModuleRBD';
import { ModuleFTA } from './components/ModuleFTA';
import { ModuleCases } from './components/ModuleCases';
import { ModuleCodeEngine } from './components/ModuleCodeEngine';
import { ModuleAIModal } from './components/ModuleAIModal';
import { ModuleWorkflow } from './components/ModuleWorkflow';
import { ModuleExport } from './components/ModuleExport';
import { ModuleKnowledgeSlices } from './components/ModuleKnowledgeSlices';
import { INDUSTRIAL_CASES } from './data/industrialCases';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('algebra');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('hsr-traction');
  const [isFloatingAIOpen, setIsFloatingAIOpen] = useState<boolean>(false);

  const currentCase = INDUSTRIAL_CASES.find((c) => c.id === selectedCaseId) || INDUSTRIAL_CASES[0];

  // Shared context data fed to the AI diagnostic engine
  const labContextData = {
    activeModule,
    currentCase: {
      id: currentCase.id,
      title: currentCase.title,
      industry: currentCase.industry,
    },
    weibull: {
      beta: currentCase.weibullParams.beta,
      eta: currentCase.weibullParams.eta,
    },
    rbd: {
      systemType: currentCase.rbdArchitecture.systemType,
      componentsCount: currentCase.rbdArchitecture.components.length,
      mtbf: currentCase.rbdArchitecture.components[0]?.mtbf || 5000,
    },
    maintenance: {
      cp: currentCase.maintenanceParams.cp,
      cf: currentCase.maintenanceParams.cf,
      tp: currentCase.maintenanceParams.optimalTp,
    },
  };

  const handleSelectCaseAndRoute = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveModule('workflow');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
        onToggleFloatingAI={() => setIsFloatingAIOpen((prev) => !prev)}
        isFloatingAIOpen={isFloatingAIOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Module Switcher Rendering */}
        {activeModule === 'algebra' && <ModuleAlgebra />}
        {activeModule === 'weibull' && <ModuleWeibull />}
        {activeModule === 'rbd' && <ModuleRBD />}
        {activeModule === 'fta' && <ModuleFTA />}
        {activeModule === 'cases' && (
          <ModuleCases onSelectCase={handleSelectCaseAndRoute} />
        )}
        {activeModule === 'code' && <ModuleCodeEngine />}
        {activeModule === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <ModuleAIModal contextData={labContextData} />
          </div>
        )}
        {activeModule === 'workflow' && (
          <ModuleWorkflow
            onGoToExport={() => setActiveModule('export')}
            onGoToAI={() => setIsFloatingAIOpen(true)}
          />
        )}
        {activeModule === 'export' && <ModuleExport />}
        {activeModule === 'slices' && <ModuleKnowledgeSlices />}
      </main>

      {/* Floating AI Consultant Drawer */}
      {isFloatingAIOpen && (
        <ModuleAIModal
          contextData={labContextData}
          isFloating={true}
          onCloseFloating={() => setIsFloatingAIOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>系统可靠性实验室 · System Reliability & Safety Engineering Lab</span>
          <span>遵循 IEC 61508 / ISO 26262 ASIL-D / MIL-HDBK-217F 标准规范</span>
        </div>
      </footer>
    </div>
  );
}
