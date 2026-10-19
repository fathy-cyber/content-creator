import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ToolPageLayoutProps {
  children: React.ReactNode;
}

export default function ToolPageLayout({ children }: ToolPageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/marketing');
    }
  };

  return (
    <div className="flex flex-col">
      <div className="shrink-0 px-6 pt-5 pb-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      {children}
    </div>
  );
}
