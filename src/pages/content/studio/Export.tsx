import React, { useState } from 'react';
import { 
  FileText, 
  FileCode, 
  Download, 
  Globe, 
  Mail, 
  Share2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportFormat {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  type: 'web' | 'document' | 'email' | 'social';
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'html', label: 'Web Page (HTML)', description: 'Clean, SEO-friendly HTML code.', icon: Globe, type: 'web' },
  { id: 'pdf', label: 'PDF Document', description: 'High-quality print-ready PDF.', icon: FileText, type: 'document' },
  { id: 'email', label: 'Email Ready (HTML)', description: 'Optimized for email clients.', icon: Mail, type: 'email' },
  { id: 'social', label: 'Social Post Formats', description: 'Optimized for various platforms.', icon: Share2, type: 'social' },
  { id: 'markdown', label: 'Markdown', description: 'Perfect for static site generators.', icon: FileCode, type: 'document' },
];

export default function Export() {
  const [selectedFormat, setSelectedFormat] = useState<string>('html');
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-zinc-900">Export & Distribute</h2>
        <p className="text-zinc-500 mt-1">Get your content ready for any platform with a single click.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => setSelectedFormat(format.id)}
            className={cn(
              "flex items-start gap-4 p-5 text-left rounded-2xl border transition-all group",
              selectedFormat === format.id
                ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              selectedFormat === format.id ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
            )}>
              <format.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-zinc-900",
                selectedFormat === format.id ? "text-emerald-900" : ""
              )}>{format.label}</h3>
              <p className="text-sm text-zinc-500 mt-1">{format.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 bg-zinc-900 rounded-3xl text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Ready to publish?</h3>
            <p className="text-zinc-400 text-sm">Your content is optimized and ready for export in {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.label}.</p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-white rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/20"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download size={20} className="group-hover:animate-bounce" />
                Download Now
              </>
            )}
          </button>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {exported && (
        <div className="fixed bottom-8 right-8 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="text-emerald-400" />
          <span className="font-medium">Export started successfully!</span>
        </div>
      )}
    </div>
  );
}
