import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Check, Loader2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- INPUT MODAL (For Adding/Renaming) ---
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
}

export const InputModal: React.FC<InputModalProps> = ({ 
  isOpen, onClose, onConfirm, title, label, initialValue = '', placeholder, confirmText = 'Save' 
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value);
      setValue('');
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-brand-black text-white font-bold hover:bg-gold-600 transition flex items-center gap-2">
            <Check size={18} /> {confirmText}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

// --- CONFIRMATION MODAL (For Deleting) ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, danger = false 
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        {danger && (
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
        )}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-6 py-3 rounded-lg text-white font-bold shadow-lg transition flex items-center gap-2 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-black hover:bg-gray-800'}`}
          >
            {danger ? 'Yes, Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};