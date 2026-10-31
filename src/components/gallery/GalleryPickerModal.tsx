import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Image as ImageIcon, Folder, Upload, X, Camera, Plus } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  url: string;
  file?: File;
  name?: string;
  date?: string;
}

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedPhotos: GalleryPhoto[]) => void;
  maxSelect?: number;
  initialSelected?: GalleryPhoto[];
}

export const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  maxSelect = 10,
  initialSelected = [],
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'albums'>('photos');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelected.map((p) => p.id)
  );
  const [customPhotos, setCustomPhotos] = useState<GalleryPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High quality sample gallery images matching reference theme (landscapes, nature, lifestyle)
  const defaultGalleryPhotos: GalleryPhoto[] = [
    {
      id: 'gal-1',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      name: 'بحيرة جبلية',
      date: 'اليوم',
    },
    {
      id: 'gal-2',
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
      name: 'غابة طبيعية',
      date: 'اليوم',
    },
    {
      id: 'gal-3',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
      name: 'سيارة رياضية',
      date: 'أمس',
    },
    {
      id: 'gal-4',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
      name: 'قطة أليفة',
      date: 'أمس',
    },
    {
      id: 'gal-5',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
      name: 'طبيعة ساحرة',
      date: 'الخميس',
    },
    {
      id: 'gal-6',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      name: 'غروب الجبال',
      date: 'الخميس',
    },
    {
      id: 'gal-7',
      url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=80',
      name: 'وادي أخضر',
      date: 'الأسبوع الماضي',
    },
    {
      id: 'gal-8',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      name: 'برمجة وتقنية',
      date: 'الأسبوع الماضي',
    },
    {
      id: 'gal-9',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      name: 'حيوان لطيف',
      date: 'الشهر الماضي',
    },
  ];

  const allPhotos = [...customPhotos, ...defaultGalleryPhotos];

  if (!isOpen) return null;

  const toggleSelect = (photo: GalleryPhoto) => {
    setSelectedIds((prev) => {
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id);
      } else {
        if (prev.length >= maxSelect) return prev;
        return [...prev, photo.id];
      }
    });
  };

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newCustoms: GalleryPhoto[] = [];
    const newSelectedIds: string[] = [];

    Array.from(files).forEach((file: File) => {
      const objUrl = URL.createObjectURL(file);
      const newPhoto: GalleryPhoto = {
        id: `device_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: objUrl,
        file,
        name: file.name,
        date: 'من الهاتف',
      };
      newCustoms.unshift(newPhoto);
      newSelectedIds.push(newPhoto.id);
    });

    setCustomPhotos((prev) => [...newCustoms, ...prev]);
    setSelectedIds((prev) => [...prev, ...newSelectedIds]);
    e.target.value = '';
  };

  const handleConfirm = () => {
    const selected = allPhotos.filter((p) => selectedIds.includes(p.id));
    onConfirm(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" id="gallery-picker-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window matching Screen 6 */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg bg-[#070D1E] text-white border border-[#1A2846] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1A2846] flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              إلغاء
            </button>

            <h3 className="text-base font-bold text-white tracking-wide">
              اختر الصور
            </h3>

            {/* Direct Device Gallery File Input Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition flex items-center gap-1 text-xs font-semibold"
              title="فتح ملفات الهاتف"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>جهازي</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleDeviceFileUpload}
            />
          </div>

          {/* Segmented Tabs: [الصور] / [الألبومات] */}
          <div className="px-5 pt-3 pb-2 flex justify-center">
            <div className="flex bg-[#0B1428] p-1 rounded-2xl border border-[#1C2C4E] w-full max-w-xs">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeTab === 'photos'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الصور
              </button>
              <button
                onClick={() => setActiveTab('albums')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeTab === 'albums'
                    ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الألبومات
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {activeTab === 'photos' ? (
              <div className="grid grid-cols-3 gap-2.5">
                {/* Device Camera / Add Photo Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-[#24355A] hover:border-blue-500 bg-[#0A1224] flex flex-col items-center justify-center gap-1 cursor-pointer transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 group-hover:text-blue-300">
                    من المعرض
                  </span>
                </div>

                {/* Photo Grid */}
                {allPhotos.map((photo) => {
                  const isSelected = selectedIds.includes(photo.id);
                  const selectedIndex = selectedIds.indexOf(photo.id) + 1;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => toggleSelect(photo)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer select-none group border transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/50 scale-[0.98]'
                          : 'border-transparent hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name || 'Photo'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Dark overlay when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px]" />
                      )}

                      {/* Selection Checkmark Badge */}
                      <div className="absolute bottom-2 end-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white/70 bg-black/30 group-hover:border-white transition" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Albums view */
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setActiveTab('photos')}
                  className="bg-[#0D162B] p-3 rounded-2xl border border-[#1A2846] cursor-pointer hover:border-blue-500 transition"
                >
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 mb-2 overflow-hidden flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-xs font-bold text-white">الكاميرا</p>
                  <p className="text-[10px] text-slate-400">142 صورة</p>
                </div>

                <div
                  onClick={() => setActiveTab('photos')}
                  className="bg-[#0D162B] p-3 rounded-2xl border border-[#1A2846] cursor-pointer hover:border-blue-500 transition"
                >
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-sky-700 to-teal-800 mb-2 overflow-hidden flex items-center justify-center">
                    <Folder className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-xs font-bold text-white">التنزيلات</p>
                  <p className="text-[10px] text-slate-400">58 صورة</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar matching Screen 6 */}
          <div className="p-4 border-t border-[#1A2846] bg-[#0A1224] flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-300">
              {selectedIds.length > 0 ? (
                <span className="text-blue-400">
                  {selectedIds.length} {selectedIds.length === 1 ? 'صورة محددة' : 'صور محددة'}
                </span>
              ) : (
                <span className="text-slate-500">لم يتم تحديد صور</span>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`py-2.5 px-6 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5 ${
                selectedIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.45)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              متابعة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
