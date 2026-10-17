import React, { useState } from 'react';
import { X, Video, Calendar, ArrowRight } from 'lucide-react';
import { openWhatsApp } from '../lib/whatsapp';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ isOpen, onClose, productName }) => {
  const [view, setView] = useState<'options' | 'schedule'>('options');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  const handleInstantCall = () => {
    const message = productName 
      ? `I want to see *${productName}* on a live video call now.`
      : `I want to book an instant video consultation.`;
    openWhatsApp(message);
    onClose();
  };

  // Sends the requested slot to the shop on WhatsApp; the shop confirms the time in the chat.
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const when = new Date(`${date}T${time}`).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    openWhatsApp(
      `Hi Sanghavi Gold, I'd like to book a video call${productName ? ` to see *${productName}*` : ''}.\nPreferred time: ${when}\nPlease confirm if this works.`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
           <h3 className="font-serif font-bold text-lg text-brand-black">Video Call Consultation</h3>
           <button onClick={onClose} className="text-gray-500 hover:text-black">
             <X size={20} />
           </button>
        </div>

        <div className="p-6">
           {view === 'options' ? (
             <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600" 
                  alt="Video Call" 
                  className="w-full h-32 object-cover rounded mb-4 opacity-80"
                />
                <h4 className="text-xl font-bold mb-2">Live Video Call at your convenience</h4>
                <p className="text-gray-500 text-sm mb-6">See the product real-time and ask questions to our experts.</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleInstantCall}
                    className="w-full py-3 rounded-md bg-green-600 text-white font-bold uppercase hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Video size={18} /> Instant Video Call
                  </button>
                  <button 
                    onClick={() => setView('schedule')}
                    className="w-full py-3 rounded-md border-2 border-brand-black text-brand-black font-bold uppercase hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} /> Schedule for Later
                  </button>
                </div>
             </div>
           ) : (
             <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <h4 className="font-bold text-lg mb-4 text-left">Schedule a Call</h4>
                <div>
                  <label htmlFor="call-date" className="block text-sm font-medium text-gray-700 mb-1">Preferred date</label>
                  <input id="call-date" type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded p-2 focus:ring-1 focus:ring-brand-black" />
                </div>
                <div>
                  <label htmlFor="call-time" className="block text-sm font-medium text-gray-700 mb-1">Preferred time</label>
                  <input id="call-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded p-2 focus:ring-1 focus:ring-brand-black" />
                </div>
                <p className="text-xs text-gray-500 text-left">This opens WhatsApp with your preferred time. We'll confirm the slot in the chat.</p>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setView('options')} className="w-1/2 py-2 border rounded hover:bg-gray-50">Back</button>
                  <button type="submit" className="w-1/2 py-2 bg-brand-black text-white rounded hover:bg-gray-800">Send on WhatsApp</button>
                </div>
             </form>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;