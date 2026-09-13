import React, { useState } from 'react';
import { ModuleType, CompanyInfo } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CompanyModal } from './components/CompanyModal';
import { HelpModal } from './components/HelpModal';
import { HomeModule } from './components/HomeModule';
import { RateConversionModule } from './components/RateConversionModule';
import { TimeValueOfMoneyModule } from './components/TimeValueOfMoneyModule';
import { EconomicDiagramModule } from './components/EconomicDiagramModule';
import { AmortizationModule } from './components/AmortizationModule';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');

  // Company Information State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    nit: '',
    address: '',
    processType: ''
  });

  // Modal States
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [helpTopicId, setHelpTopicId] = useState<string | null>(null);

  const handleOpenHelp = (topicId: string) => {
    setHelpTopicId(topicId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-red-900 selection:text-white antialiased">
      
      {/* Top Fixed Header with Gothic Brand "Mora" & Nav */}
      <Header
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        companyInfo={companyInfo}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {currentModule === 'home' && (
          <HomeModule setCurrentModule={setCurrentModule} />
        )}

        {currentModule === 'rate-conversion' && (
          <RateConversionModule
            companyInfo={companyInfo}
            onOpenHelp={handleOpenHelp}
          />
        )}

        {currentModule === 'tvm' && (
          <TimeValueOfMoneyModule
            companyInfo={companyInfo}
            onOpenHelp={handleOpenHelp}
          />
        )}

        {currentModule === 'economic-diagram' && (
          <EconomicDiagramModule
            companyInfo={companyInfo}
            onOpenHelp={handleOpenHelp}
          />
        )}

        {currentModule === 'amortization' && (
          <AmortizationModule
            companyInfo={companyInfo}
            onOpenHelp={handleOpenHelp}
          />
        )}
      </main>

      {/* Company Info Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        companyInfo={companyInfo}
        onSave={(updated) => setCompanyInfo(updated)}
      />

      {/* Help / Pedagogical Modal */}
      <HelpModal
        topicId={helpTopicId}
        onClose={() => setHelpTopicId(null)}
      />

      {/* Persistent Footer */}
      <Footer />

    </div>
  );
}
