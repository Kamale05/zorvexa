import React, { useState, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Phone,
  MessageSquare,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCategory, ProductCondition } from '../../types';
import { uploadMediaFile } from '../../services/firebaseService';

export const AddProductModal: React.FC = () => {
  const {
    currentUser,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    saveProduct,
    showToast,
    t,
  } = useSocial();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState<'USD' | 'SAR' | 'AED' | 'EGP' | 'EUR'>('USD');
  const [category, setCategory] = useState<ProductCategory>('electronics');
  const [condition, setCondition] = useState<ProductCondition>('used');
  const [location, setLocation] = useState('الرياض، السعودية');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAddProductModalOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = (Array.from(files) as File[]).map((file) =>
        uploadMediaFile(file, 'marketplace')
      );
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      showToast('تم تحميل الصور بنجاح!', 'success');
    } catch (err) {
      showToast('تعذر رفع الصور، تم استخدام المعاينة المحلية', 'info');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || price === '' || Number(price) <= 0) {
      showToast('يرجى تعبئة العنوان والسعر بشكل صحيح', 'error');
      return;
    }

    const defaultSampleImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

    await saveProduct({
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerAvatar: currentUser.avatarUrl,
      title,
      description,
      price: Number(price),
      currency,
      images: images.length > 0 ? images : [defaultSampleImage],
      category,
      condition,
      location,
      contactPhone: contactPhone || undefined,
      contactWhatsapp: contactWhatsapp || undefined,
      status: 'active',
    });

    setIsAddProductModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2846] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t('addNewProduct')}
              </h3>
              <p className="text-xs text-blue-400/80">
                اعرض منتجاتك لآلاف المشترين في متجر Zorvexa
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddProductModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A2846] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Images Section */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              {t('productImages')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-[#1A2846] group"
                >
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 end-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square rounded-2xl border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-[#070D1E] flex flex-col items-center justify-center text-blue-400 transition hover:bg-blue-950/20"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-semibold">
                  {isUploading ? 'جاري الرفع...' : 'إضافة صورة'}
                </span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t('productTitle')} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: آيفون 15 برو ماكس 256 جيجابايت أزرق تيتانيوم"
              className="w-full px-3.5 py-2.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Price, Currency, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('productPrice')} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (ريال سعودي)</option>
                <option value="AED">AED (درهم إماراتي)</option>
                <option value="EGP">EGP (جنيه مصري)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="electronics">{t('electronics')}</option>
                <option value="vehicles">{t('vehicles')}</option>
                <option value="realestate">{t('realestate')}</option>
                <option value="fashion">{t('fashion')}</option>
                <option value="furniture">{t('furniture')}</option>
                <option value="services">{t('services')}</option>
                <option value="other">{t('otherCategory')}</option>
              </select>
            </div>
          </div>

          {/* Condition & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('condition')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('new')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    condition === 'new'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#070D1E] border-[#1A2846] text-zinc-400 hover:text-white'
                  }`}
                >
                  {t('conditionNew')}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('used')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    condition === 'used'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#070D1E] border-[#1A2846] text-zinc-400 hover:text-white'
                  }`}
                >
                  {t('conditionUsed')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('productLocation')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="المدينة والحي"
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Details (Phone & WhatsApp) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('contactPhone')} (اختياري)</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+966500000000"
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('contactWhatsapp')} (اختياري)</span>
              </label>
              <input
                type="tel"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+966500000000"
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t('productDescription')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب مواصفات المنتج، مدة الاستخدام، الملحقات، وأي تفاصيل تهم المشتري..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2846]">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 active:scale-95 transition"
            >
              {t('publishProduct')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
