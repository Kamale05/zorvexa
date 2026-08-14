import React, { useState, useEffect, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Search,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCheck,
  Sparkles,
  Smile,
  X,
} from 'lucide-react';
import { User, Conversation } from '../../types';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    users,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    startOrOpenConversationWith,
    setSelectedUserProfile,
    setActiveTab,
    language,
    t,
  } = useSocial();

  const [chatSearch, setChatSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== currentUser?.id
  ) || activeConversation?.participants[0];

  const currentMessages = messages.filter((m) => m.conversationId === activeConversationId);

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrlInput(event.target.result as string);
        setShowPhotoInput(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter((c) => {
    const partner = c.participants.find((p) => p.id !== currentUser?.id) || c.participants[0];
    if (!chatSearch.trim()) return true;
    return (
      partner?.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      partner?.username.toLowerCase().includes(chatSearch.toLowerCase())
    );
  });

  const sampleChatImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  ];

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.lastMessage, activeConversation?.isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || (!inputText.trim() && !photoUrlInput.trim())) return;
    sendMessage(activeConversationId, inputText, photoUrlInput || undefined);
    setInputText('');
    setPhotoUrlInput('');
    setShowPhotoInput(false);
  };

  const handleUserClick = (user: User) => {
    setSelectedUserProfile(user);
    setActiveTab('profile');
  };

  return (
    <div
      className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex flex-col md:flex-row transition-colors"
      id="messages-view"
    >
      {/* Left / Master: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-e border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{t('chats')}</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
              {conversations.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={t('searchConversations')}
              className="w-full ps-8 pe-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Online friends quick icons strip */}
        <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto flex items-center gap-2.5 scrollbar-none">
          {users
            .filter((u) => u.id !== currentUser?.id)
            .map((u) => (
              <div
                key={u.id}
                onClick={() => startOrOpenConversationWith(u)}
                className="relative cursor-pointer shrink-0 group flex flex-col items-center gap-1"
                title={u.name}
              >
                <div className="relative">
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 transition"
                    referrerPolicy="no-referrer"
                  />
                  {u.isOnline && (
                    <span className="absolute bottom-0 end-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 max-w-[44px] truncate">
                  {u.name.split(' ')[0]}
                </span>
              </div>
            ))}
        </div>

        {/* Conversation rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              {t('noMessagesYet')}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partner = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
              const isSelected = conv.id === activeConversationId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800/90'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={partner?.avatarUrl}
                      alt={partner?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    {partner?.isOnline && (
                      <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {partner?.name}
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        {conv.lastMessage?.createdAt || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {conv.isTyping ? (
                          <span className="text-zinc-700 dark:text-zinc-300 font-semibold animate-pulse">
                            {t('typing')}
                          </span>
                        ) : (
                          conv.lastMessage?.text || 'محادثة جديدة'
                        )}
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right / Detail: Chat window */}
      <div
        className={`flex-1 flex flex-col bg-zinc-50/50 dark:bg-[#0c0c0e] ${
          activeConversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                </button>

                <div
                  onClick={() => handleUserClick(otherParticipant)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={otherParticipant.avatarUrl}
                      alt={otherParticipant.name}
                      className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    {otherParticipant.isOnline && (
                      <span className="absolute bottom-0 end-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline transition">
                      {otherParticipant.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400">
                      {otherParticipant.isOnline ? t('online') : otherParticipant.lastSeen || t('offline')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUserClick(otherParticipant)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="الملف الشخصي"
                >
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Initial conversation greeting banner */}
              <div className="text-center py-3">
                <img
                  src={otherParticipant.avatarUrl}
                  alt={otherParticipant.name}
                  className="w-14 h-14 rounded-2xl mx-auto mb-2 object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{otherParticipant.name}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{otherParticipant.bio}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-md text-[10px] text-zinc-500">
                  محادثة آمنة ومشفرة على Zorvexa 🔒
                </span>
              </div>

              {/* Message stream */}
              {currentMessages.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">
                  {t('startConversation')}
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-3.5 py-2 text-xs shadow-xs leading-relaxed ${
                          isMine
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-se-none'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-ss-none border border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {msg.mediaUrl && (
                          <div className="rounded-lg overflow-hidden mb-1.5 max-w-xs">
                            <img
                              src={msg.mediaUrl}
                              alt="Attached media"
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <div
                          className={`text-[9px] text-end mt-1 flex items-center justify-end gap-1 ${
                            isMine ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-400'
                          }`}
                        >
                          <span>{msg.createdAt}</span>
                          {isMine && (
                            <CheckCheck className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {activeConversation.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl rounded-ss-none border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Photo Attachment Drawer */}
            {showPhotoInput && (
              <div className="p-3 bg-white dark:bg-[#121215] border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>إرفاق صورة في الرسالة:</span>
                  <button onClick={() => setShowPhotoInput(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition flex items-center gap-1 shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{t('uploadFromDevice')}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceFileUpload}
                    className="hidden"
                  />

                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="أو ضع رابط صورة..."
                    className="flex-1 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>

                {photoUrlInput && (
                  <div className="relative inline-block mt-1">
                    <img
                      src={photoUrlInput}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrlInput('')}
                      className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-zinc-400">عينة:</span>
                  {sampleChatImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoUrlInput(img)}
                      className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:underline"
                    >
                      صورة {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#121215] border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-3 py-1 border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPhotoInput(!showPhotoInput)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  title="إرفاق صورة"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('typeMessage')}
                  className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !photoUrlInput.trim()}
                  className="p-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-900 rounded-lg shadow-xs transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center mb-3">
              <Send className="w-5 h-5 rtl:rotate-180" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              رسائلك الخاصة
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              {t('startConversation')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
