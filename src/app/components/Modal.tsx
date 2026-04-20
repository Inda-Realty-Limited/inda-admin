import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = '480px' }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl"
        style={{ maxWidth, width: '100%', margin: '0 24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#0D1117]">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        )}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
