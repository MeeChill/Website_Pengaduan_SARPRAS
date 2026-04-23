'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Upload, CheckCircle, Clock, AlertCircle, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'status' | 'progress';
  content: string;
  image?: string;
  ticketNumber?: string;
  status?: string;
  progress?: string;
}

interface FormData {
  judul: string;
  lokasi: string;
  deskripsi: string;
  foto: File[];
}

export default function ChatbotWidget({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    judul: '',
    lokasi: '',
    deskripsi: '',
    foto: []
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: isLoggedIn 
        ? 'Halo! 👋 Saya akan membantu Anda mengajukan aspirasi/pengaduan sarpras. Silakan ikuti langkah-langkah berikut.'
        : 'Halo! 👋 Untuk mengajukan aspirasi, silakan login terlebih dahulu menggunakan tombol Login di atas.'
    }
  ]);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingMode, setTrackingMode] = useState(false);
  const [displayedUpdates, setDisplayedUpdates] = useState<Set<number>>(new Set());
  const [lastStatus, setLastStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time tracking functionality
  useEffect(() => {
    if (ticketNumber && trackingMode) {
      // Poll for updates every 10 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/aspirasi?nomor_tiket=${ticketNumber}`);
          if (response.ok) {
            const data = await response.json();
            const aspirasi = data.aspirasi;
            
            if (aspirasi) {
              // Check for status updates
              if (aspirasi.status !== lastStatus) {
                setLastStatus(aspirasi.status);
                if (aspirasi.status === 'dalam_progres') {
                  addMessage(
                    `🔄 Status Update: Aspirasi Anda sedang dalam progres pengerjaan oleh admin.`,
                    'status'
                  );
                } else if (aspirasi.status === 'selesai') {
                  addMessage(
                    `✅ Aspirasi Selesai!\nTanggal Selesai: ${aspirasi.tanggal_selesai ? new Date(aspirasi.tanggal_selesai).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}`,
                    'status'
                  );
                  
                  // Show after photo if available
                  if (aspirasi.foto_after) {
                    addMessage(
                      '📸 Foto After (Hasil Perbaikan):',
                      'status',
                      aspirasi.foto_after
                    );
                  }
                }
              }

              if (aspirasi.status === 'selesai') {
                clearInterval(interval);
              }

              // Check for progress updates
              if (aspirasi.progres_updates && aspirasi.progres_updates.length > 0) {
                aspirasi.progres_updates.forEach((update: any) => {
                  if (!displayedUpdates.has(update.id)) {
                    addMessage(
                      `📋 Update Progres (${new Date(update.tanggal_update).toLocaleDateString('id-ID')}):\n${update.deskripsi_update}`,
                      'progress'
                    );
                    setDisplayedUpdates(prev => {
                      const newSet = new Set(prev);
                      newSet.add(update.id);
                      return newSet;
                    });
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching updates:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ticketNumber, trackingMode, displayedUpdates, lastStatus]);

  const steps = [
    { key: 'judul', question: 'Silakan masukkan judul aspirasi Anda (singkat & jelas):', placeholder: 'Contoh: AC rusak di ruang kelas' },
    { key: 'lokasi', question: 'Dimana lokasi masalahnya?', placeholder: 'Contoh: Gedung A, Lantai 2, Ruang Kelas 203' },
    { key: 'deskripsi', question: 'Jelaskan detail masalahnya:', placeholder: 'Deskripsikan masalah secara detail...' },
    { key: 'foto', question: 'Upload foto bukti (minimal 1 foto, maksimal 3):', type: 'file' }
  ];

  const addMessage = (content: string, type: 'bot' | 'user' | 'status' | 'progress', image?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      image
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleNextStep = (value: string) => {
    const currentStepKey = steps[currentStep].key as keyof FormData;
    
    if (currentStepKey === 'foto') return; // Handle separately
    
    setFormData(prev => ({ ...prev, [currentStepKey]: value }));
    addMessage(value, 'user');
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        addMessage(steps[currentStep + 1].question, 'bot');
      }, 500);
    } else {
      // All steps completed, show submit button
      setTimeout(() => {
        addMessage('Semua data telah terisi. Silakan kirim aspirasi Anda.', 'bot');
      }, 500);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 3 - formData.foto.length);
    setFormData(prev => ({ ...prev, foto: [...prev.foto, ...newFiles] }));
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        addMessage(`Foto: ${file.name}`, 'user', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    if (formData.foto.length + newFiles.length >= 1) {
      setTimeout(() => {
        addMessage('Semua data telah terisi. Silakan kirim aspirasi Anda.', 'bot');
      }, 500);
    }
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ASP-${dateStr}-${random}`;
  };

  const handleSubmit = async () => {
    if (formData.foto.length === 0) {
      addMessage('Mohon upload minimal 1 foto bukti.', 'bot');
      return;
    }

    setIsSubmitting(true);
    addMessage('Mengirim aspirasi...', 'bot');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('judul', formData.judul);
      formDataToSend.append('lokasi', formData.lokasi);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('nomor_tiket', generateTicketNumber());
      
      formData.foto.forEach((file) => {
        formDataToSend.append('foto', file);
      });

      const response = await fetch('/api/aspirasi', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        setTicketNumber(result.nomor_tiket);
        setTrackingMode(true);
        
        addMessage(
          `✅ Aspirasi berhasil dikirim!\n\n🎫 Nomor Tiket: ${result.nomor_tiket}\n\n📱 Anda dapat melacak progres secara real-time di chat ini. Setiap update dari admin akan muncul otomatis.`,
          'status'
        );
        
        // Add initial status card
        addMessage(
          `Status: Menunggu Review\nTanggal: ${new Date().toLocaleDateString('id-ID')}`,
          'status'
        );
        
        // Reset form after successful submission but keep chat open for tracking
        setTimeout(() => {
          setCurrentStep(0);
          setFormData({ judul: '', lokasi: '', deskripsi: '', foto: [] });
        }, 2000);
      } else {
        addMessage('❌ Gagal mengirim aspirasi. Silakan coba lagi.', 'bot');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      addMessage('❌ Terjadi kesalahan. Silakan coba lagi.', 'bot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full p-4 shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-110 active:scale-95"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">NEO-SARANA Assistant</h3>
                <p className="text-white/70 text-xs">
                  {trackingMode ? `Tracking: ${ticketNumber}` : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {trackingMode && (
                <button
                  onClick={() => {
                    setTrackingMode(false);
                    setTicketNumber(null);
                    setMessages([
                      {
                        id: '1',
                        type: 'bot',
                        content: 'Halo! 👋 Saya akan membantu Anda mengajukan aspirasi/pengaduan sarpras. Silakan ikuti langkah-langkah berikut.'
                      }
                    ]);
                    setCurrentStep(0);
                  }}
                  className="text-white/70 hover:text-white transition-colors text-xs"
                  title="Buat Aspirasi Baru"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 ${
                  message.type === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : message.type === 'status'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-bl-none'
                    : message.type === 'progress'
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-bl-none'
                    : 'bg-white/10 text-slate-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.image && (
                    <img src={message.image} alt="Uploaded" className="mt-2 rounded-lg max-w-full h-32 object-cover" />
                  )}
                </div>
              </div>
            ))}
            
            {/* Current Step Input */}
            {currentStep < steps.length && !ticketNumber && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white/10 text-slate-200 rounded-xl rounded-bl-none p-3">
                  <p className="text-sm mb-3">{steps[currentStep].question}</p>
                  
                  {steps[currentStep].type === 'file' ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Foto
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      {formData.foto.length > 0 && (
                        <p className="text-xs text-slate-400">
                          {formData.foto.length} foto terupload
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={steps[currentStep].placeholder}
                        onKeyPress={(e) => handleKeyPress(e, () => {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            handleNextStep(input.value.trim());
                            input.value = '';
                          }
                        })}
                        className="flex-1 bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          if (input.value.trim()) {
                            handleNextStep(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {currentStep >= steps.length && !ticketNumber && formData.foto.length > 0 && (
              <div className="flex justify-start">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl px-6 py-3 font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Mengirim...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Kirim Aspirasi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}