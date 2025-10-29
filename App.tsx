import React, { useState } from 'react';
import type { ToolId } from './types';
import { InfographicGenerator } from './components/InfographicGenerator';
import { VideoScriptGenerator } from './components/VideoScriptGenerator';
import { NewsAnalyzer } from './components/NewsAnalyzer';
import { BrandProvider } from './contexts/BrandContext';
import { ContentProvider } from './contexts/ContentContext';
import { BrandProfileModal } from './components/BrandProfileModal';

const TABS: { id: ToolId; name: string }[] = [
  { id: 'infographic', name: 'Tạo Infographic & Bài viết' },
  { id: 'video', name: 'Tạo Kịch bản Video' },
  { id: 'news', name: 'Phân tích Tin tức' },
];

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.25 5.553a7.003 7.003 0 0 0-2.5 0l-.588.14a.75.75 0 0 1-.87-.076l-.41-.41a.75.75 0 0 0-1.06 0l-1.06 1.06a.75.75 0 0 0 0 1.06l.41.41c.216.216.28.552.14.82l-.14.588a7.003 7.003 0 0 0 0 2.5l.14.588a.75.75 0 0 1-.14.82l-.41.41a.75.75 0 0 0 0 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l.41-.41a.75.75 0 0 1 .87-.076l.588.14c.88.213 1.81.213 2.5 0l.588-.14a.75.75 0 0 1 .87.076l.41.41a.75.75 0 0 0 1.06 0l1.06-1.06a.75.75 0 0 0 0-1.06l-.41-.41a.75.75 0 0 1-.14-.82l.14-.588c.213-.88.213-1.81 0-2.5l-.14-.588a.75.75 0 0 1 .14-.82l.41-.41a.75.75 0 0 0 0-1.06l-1.06-1.06a.75.75 0 0 0-1.06 0l-.41.41a.75.75 0 0 1-.87.076l-.588-.14Zm-1.316 5.51a2.25 2.25 0 1 0-3.182-3.182 2.25 2.25 0 0 0 3.182 3.182Z" clipRule="evenodd" />
        <path d="M10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5ZM12.75 10a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0Z" />
    </svg>
);


function AppContent() {
  const [activeTool, setActiveTool] = useState<ToolId>('infographic');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case 'infographic':
        return <InfographicGenerator />;
      case 'video':
        return <VideoScriptGenerator />;
      case 'news':
        return <NewsAnalyzer />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-7xl mb-8 relative">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Chiến lược gia Nội dung AI Pháp lý
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              "Dạy" AI về phong cách của bạn để tạo nội dung nhất quán, chuyên nghiệp.
            </p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-200/80 rounded-lg hover:bg-slate-300/80 hover:text-slate-800 transition-colors"
            aria-label="Mở cài đặt hồ sơ thương hiệu"
        >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Hồ sơ Thương hiệu</span>
        </button>
      </header>

      <div className="w-full max-w-7xl mb-6">
        <div className="flex justify-center bg-slate-200/80 rounded-lg p-1.5 space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id)}
              className={`px-4 py-2 text-sm sm:text-base font-medium transition-all rounded-md w-full ${
                activeTool === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:bg-slate-300/60 hover:text-slate-800'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <main className="w-full max-w-7xl">
        {renderTool()}
      </main>

      <footer className="w-full max-w-7xl text-center mt-12 text-slate-500 text-sm">
        <p>Phát triển bởi React, Tailwind CSS, và Gemini API</p>
      </footer>
      
      <BrandProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function App() {
    return (
        <BrandProvider>
            <ContentProvider>
                <AppContent />
            </ContentProvider>
        </BrandProvider>
    );
}

export default App;