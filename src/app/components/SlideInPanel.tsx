import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function SlideInPanel({ isOpen, onClose, title, children }: SlideInPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="absolute right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-[#0D1117]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
