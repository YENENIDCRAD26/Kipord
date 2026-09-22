import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  FileText,
  Send,
  Paperclip,
  Smile,
  Camera,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Search,
  CheckCheck,
  Edit3,
  Image as ImageIcon,
  Table as TableIcon,
  Sparkles,
  Download,
  Share2,
  Bookmark,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Filter,
  Sigma,
  Calendar,
  Clock,
  Table,
} from 'lucide-react';
import { KeyboardSettings, FontItem, DocImage, DocTable, TargetAppType, InsertModalTab, ActiveKeyboardType } from '../types';

interface TargetAppViewerProps {
  text: string;
  onChangeText: (newText: string) => void;
  cursorPos: number;
  onCursorChange: (pos: number) => void;
  settings: KeyboardSettings;
  activeFont: FontItem;
  images: DocImage[];
  onUpdateImages: (images: DocImage[]) => void;
  tables: DocTable[];
  onUpdateTables: (tables: DocTable[]) => void;
  activeTargetApp: TargetAppType;
  onChangeTargetApp: (app: TargetAppType) => void;
  activeKeyboard: ActiveKeyboardType;
  onToggleKeyboard: () => void;
  onOpenInsertModal: (tab: InsertModalTab) => void;
  onOpenFontsModal: () => void;
  onOpenColorModal: () => void;
  onExportJpg: () => void;
  onExportPdf: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'other' | 'me';
  text: string;
  time: string;
  fontName?: string;
}

export const TargetAppViewer: React.FC<TargetAppViewerProps> = ({
  text,
  onChangeText,
  cursorPos,
  onCursorChange,
  settings,
  activeFont,
  images,
  onUpdateImages,
  tables,
  onUpdateTables,
  activeTargetApp,
  onChangeTargetApp,
  activeKeyboard,
  onToggleKeyboard,
  onOpenInsertModal,
  onOpenFontsModal,
  onOpenColorModal,
  onExportJpg,
  onExportPdf,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Chat messages simulation for WhatsApp / Telegram / Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'other',
      text: 'السلام عليكم ورحمة الله، هل يمكنك تجربة الكتابة بالخطوط العربية الـ 18 وإرسال التقرير؟',
      time: '10:14 ص',
    },
    {
      id: '2',
      sender: 'me',
      text: 'أهلاً وسهلاً! أكتب لك الآن مباشرة عبر لوحة مفاتيح سامسونج نوت 10+ الملحقة بارتفاعها القياسي (3.5 cm).',
      time: '10:16 ص',
      fontName: 'أميري',
    },
  ]);

  // Excel Sheet Interactive State
  const [excelData, setExcelData] = useState<string[][]>([
    ['البند', 'الكمية', 'سعر الوحدة (ر.س)', 'الإجمالي'],
    ['سامسونج جالاكسي نوت 10+', '15', '3200', '48000'],
    ['شاشة Super AMOLED 6.8', '25', '450', '11250'],
    ['كيبورد ملحق 3.5cm', '60', '140', '8400'],
    ['قلم S-Pen مدمج', '40', '95', '3800'],
    ['المجموع الإجمالي =SUM', '140', '-', '71450'],
  ]);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 1, c: 0 });
  const [isExcelFiltersOn, setIsExcelFiltersOn] = useState<boolean>(true);

  // Keep chat scrolled to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, text]);

  const handleSendChat = () => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'me',
        text: text,
        time: timeStr,
        fontName: activeFont.nameArabic,
      },
    ]);
    onChangeText('');
    onCursorChange(0);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative" dir="rtl">
      {/* 1. TARGET APP SWITCHER BAR (أعلى الكيبورد: مخصص لاختيار وظهور التطبيق المستهدف) */}
      <div className="bg-slate-900 text-white px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800 text-xs shrink-0 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap pl-1">
            التطبيق المستهدف:
          </span>

          {/* WhatsApp */}
          <button
            onClick={() => onChangeTargetApp('whatsapp')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>💬 واتساب</span>
          </button>

          {/* Samsung Notes */}
          <button
            onClick={() => onChangeTargetApp('samsungNotes')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'samsungNotes'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📝 ملاحظات سامسونج</span>
          </button>

          {/* Telegram */}
          <button
            onClick={() => onChangeTargetApp('telegram')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'telegram'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>✈️ تيليجرام</span>
          </button>

          {/* Word / Document */}
          <button
            onClick={() => onChangeTargetApp('wordDoc')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'wordDoc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📄 مستند وورد</span>
          </button>

          {/* Excel / Spreadsheet */}
          <button
            onClick={() => onChangeTargetApp('excelSheet')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'excelSheet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📊 مصنف إكسل</span>
          </button>

          {/* Messages */}
          <button
            onClick={() => onChangeTargetApp('messages')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
              activeTargetApp === 'messages'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>✉️ الرسائل</span>
          </button>
        </div>

        {/* Keyboard Auto-switch status & toggle */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <button
            onClick={onToggleKeyboard}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all active:scale-95 flex items-center gap-1 ${
              activeKeyboard === 'attached'
                ? 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-400'
                : 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-400'
            }`}
            title="التبديل التلقائي بين الكيبورد الملحق ولوحة مفاتيح الهاتف الأصلية"
          >
            <span>{activeKeyboard === 'attached' ? '⌨️ كيبورد ملحق' : '📱 لوحة أصلية'}</span>
          </button>
        </div>
      </div>

      {/* 2. TARGET APPLICATION INTERFACE (WhatsApp, Samsung Notes, Telegram, Word, Messages) */}

      {/* --- APP 1: WHATSAPP INTERFACE --- */}
      {activeTargetApp === 'whatsapp' && (
        <div className="flex-1 flex flex-col bg-[#e5ddd5] overflow-hidden relative">
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center font-bold text-xs">
                  ع
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 left-0 border border-white" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-xs">د. عبد الله التميمي</p>
                <p className="text-[10px] text-emerald-200">متصل الآن • WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-emerald-100">
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* WhatsApp Chat Messages Stream */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[radial-gradient(#c8d5cb_1px,transparent_1px)] [background-size:16px_16px]"
          >
            {/* Date separator */}
            <div className="flex justify-center my-1">
              <span className="bg-white/80 backdrop-blur-xs text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                اليوم
              </span>
            </div>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[82%] ${
                  msg.sender === 'me' ? 'mr-auto items-end' : 'ml-auto items-start'
                }`}
              >
                <div
                  className={`p-2 rounded-xl text-xs shadow-2xs relative ${
                    msg.sender === 'me'
                      ? 'bg-[#dcf8c6] text-slate-900 rounded-br-none'
                      : 'bg-white text-slate-900 rounded-bl-none'
                  }`}
                  style={{
                    fontFamily: msg.fontName ? activeFont.fontFamily : 'inherit',
                  }}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-slate-400 select-none">
                    <span>{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}

            {/* Live Typing Preview Bubble if there is unsent text in the keyboard */}
            {text && (
              <div className="mr-auto items-end flex flex-col max-w-[85%]">
                <div
                  className="p-2 rounded-xl text-xs shadow-2xs bg-[#dcf8c6]/90 text-slate-900 border border-emerald-400/40 rounded-br-none"
                  style={{
                    fontFamily: activeFont.fontFamily,
                    fontSize: `${Math.min(20, Math.max(13, settings.fontSize - 4))}px`,
                    color: settings.fontColor,
                  }}
                >
                  <div className="flex items-center gap-1 text-[9px] text-emerald-800 font-bold mb-0.5">
                    <span>الكتابة عبر لوحة المفاتيح الملحقة ({activeFont.nameArabic}):</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Live Input Bar (Right above the keyboard) */}
          <div className="p-1.5 bg-[#f0f2f5] border-t border-slate-300 flex items-center gap-1.5 shrink-0 select-none">
            <button
              onClick={() => onOpenInsertModal('emoji')}
              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              title="إيموجي"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={() => onOpenInsertModal('image')}
              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              title="إرفاق صورة"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field connected to the keyboard */}
            <div className="flex-1 bg-white rounded-2xl px-3 py-1.5 border border-slate-300 shadow-2xs flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => {
                  onChangeText(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendChat();
                  }
                }}
                placeholder="اكتب رسالة باستخدام الكيبورد..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                style={{
                  fontFamily: activeFont.fontFamily,
                  color: settings.fontColor,
                }}
                inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
              />
            </div>

            {/* Send / Mic button */}
            <button
              onClick={handleSendChat}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all shadow-xs active:scale-95 ${
                text ? 'bg-[#128c7e] hover:bg-[#075e54]' : 'bg-[#128c7e] opacity-90'
              }`}
              title="إرسال في واتساب"
            >
              {text ? <Send className="w-4 h-4 -rotate-90" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* --- APP 2: SAMSUNG NOTES (Note 10+ S-Pen & One UI) --- */}
      {activeTargetApp === 'samsungNotes' && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Samsung Notes Header */}
          <div className="bg-amber-500 text-white px-3 py-1.5 flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-wide">Samsung Notes</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-600 rounded text-amber-100 font-semibold">
                Note 10+
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onExportJpg}
                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 rounded text-[11px] font-semibold flex items-center gap-1"
                title="تصدير الملاحظة JPG"
              >
                <span>حفظ JPG</span>
              </button>
              <button
                onClick={onExportPdf}
                className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 rounded text-[11px] font-semibold flex items-center gap-1"
                title="تصدير الملاحظة PDF"
              >
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Samsung Note Page Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#fdfbf7] flex flex-col space-y-3">
            {/* Note Title */}
            <div className="border-b border-amber-200/80 pb-1.5 flex items-center justify-between">
              <input
                type="text"
                defaultValue="ملاحظات سامسونج نوت 10+ الذكية"
                className="font-bold text-sm text-slate-800 bg-transparent focus:outline-none w-full"
                inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
              />
              <span className="text-[10px] text-amber-700 font-bold whitespace-nowrap bg-amber-100 px-1.5 py-0.5 rounded">
                الخط: {activeFont.nameArabic}
              </span>
            </div>

            {/* Inserted Images in Note */}
            {images.length > 0 && (
              <div className="space-y-2">
                {images.map((img) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border border-amber-200">
                    <img src={img.url} alt={img.name} className="w-full max-h-48 object-contain" />
                  </div>
                ))}
              </div>
            )}

            {/* Inserted Tables in Note */}
            {tables.length > 0 && (
              <div className="space-y-2">
                {tables.map((t) => (
                  <div key={t.id} className="border border-amber-300 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-center">
                      <thead className="bg-amber-600 text-white font-bold">
                        <tr>
                          {t.headers.map((h, i) => (
                            <th key={i} className="p-1 border border-amber-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((r, ri) => (
                          <tr key={ri} className="border-t border-amber-200">
                            {r.map((c, ci) => (
                              <td key={ci} className="p-1 border border-amber-100">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Note Textarea connected to Attached Keyboard */}
            <div className="flex-1 min-h-[140px] flex flex-col">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  onChangeText(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                placeholder="ابدأ الكتابة في ملاحظات سامسونج عبر الكيبورد..."
                className="w-full flex-1 resize-none bg-transparent focus:outline-none leading-relaxed"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  color: settings.fontColor,
                  fontWeight: settings.isBold ? 700 : 400,
                  fontStyle: settings.isItalic ? 'italic' : 'normal',
                  textDecoration: settings.isUnderline ? 'underline' : 'none',
                  textAlign: settings.textAlign,
                }}
                inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
              />
            </div>
          </div>

          {/* Quick Notes Toolbar */}
          <div className="px-2 py-1 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenInsertModal('image')}
                className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 text-[11px] font-semibold"
              >
                <ImageIcon className="w-3 h-3 text-amber-600" />
                <span>صورة</span>
              </button>
              <button
                onClick={() => onOpenInsertModal('table')}
                className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 text-[11px] font-semibold"
              >
                <TableIcon className="w-3 h-3 text-emerald-600" />
                <span>جدول</span>
              </button>
              <button
                onClick={() => onOpenInsertModal('symbol')}
                className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 text-[11px] font-semibold"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>رموز</span>
              </button>
            </div>
            <span className="text-[10px] text-amber-700">
              {text.length} حرف • {text.trim() ? text.trim().split(/\s+/).length : 0} كلمة
            </span>
          </div>
        </div>
      )}

      {/* --- APP 3: TELEGRAM INTERFACE --- */}
      {activeTargetApp === 'telegram' && (
        <div className="flex-1 flex flex-col bg-[#0e1621] text-white overflow-hidden relative">
          {/* Telegram Header */}
          <div className="bg-[#17212b] px-3 py-2 flex items-center justify-between border-b border-slate-800 shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold text-xs text-white">
                ت
              </div>
              <div className="leading-tight">
                <p className="font-bold text-xs">قناة العمل والخطوط العربية</p>
                <p className="text-[10px] text-sky-400">1,420 مشتركاً • Telegram</p>
              </div>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </div>

          {/* Telegram Chat Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0e1621]">
            <div className="p-2.5 rounded-xl bg-[#182533] text-xs text-slate-200 max-w-[85%] border border-slate-700/50">
              <p className="text-[11px] font-bold text-sky-400 mb-1">المشرف:</p>
              <p>تم اعتماد الخطوط الـ 18 المعتمدة للوحة المفاتيح الذكية، يمكنك إرسال النصوص الآن مباشرة.</p>
              <span className="text-[9px] text-slate-500 block text-left mt-1">10:00 ص</span>
            </div>

            {text && (
              <div className="mr-auto max-w-[85%] p-2.5 rounded-xl bg-[#2b5278] text-xs text-white shadow-xs border border-sky-600/40">
                <p className="text-[10px] text-sky-200 font-bold mb-1">
                  رسالتك الجارية ({activeFont.nameArabic}):
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
              </div>
            )}
          </div>

          {/* Telegram Input Bar */}
          <div className="p-1.5 bg-[#17212b] border-t border-slate-800 flex items-center gap-1.5 shrink-0">
            <button onClick={() => onOpenInsertModal('emoji')} className="p-1.5 text-slate-400 hover:text-white">
              <Smile className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                onChangeText(e.target.value);
                onCursorChange(e.target.selectionStart || 0);
              }}
              placeholder="اكتب في تيليجرام بالخط المختار..."
              className="flex-1 bg-[#242f3d] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none"
              style={{ fontFamily: activeFont.fontFamily }}
              inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
            />
            <button
              onClick={handleSendChat}
              className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg active:scale-95"
            >
              <Send className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* --- APP 4: WORD DOCUMENT (مستند وورد) --- */}
      {activeTargetApp === 'wordDoc' && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Word Ribbon */}
          <div className="bg-[#2b579a] text-white px-3 py-1.5 flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Microsoft Word Mobile</span>
              <span className="text-[10px] bg-blue-700 px-1.5 py-0.2 rounded">مستند1.docx</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onExportJpg}
                className="px-2 py-0.5 bg-blue-700 hover:bg-blue-800 rounded text-[11px] font-semibold"
              >
                تصدير JPG
              </button>
              <button
                onClick={onExportPdf}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 rounded text-[11px] font-semibold"
              >
                PDF
              </button>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex flex-col items-center">
            <div
              id="exportable-document-canvas"
              className="w-full max-w-[700px] min-h-[360px] bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 flex flex-col space-y-3"
            >
              <div className="border-b pb-1 text-[11px] text-slate-400 flex justify-between">
                <span>مستند رسمي - لوحة مفاتيح سامسونج</span>
                <span>الخط: {activeFont.nameArabic}</span>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((img) => (
                    <img key={img.id} src={img.url} alt={img.name} className="max-h-48 object-contain rounded-lg" />
                  ))}
                </div>
              )}

              {tables.length > 0 && (
                <div className="space-y-2">
                  {tables.map((t) => (
                    <table key={t.id} className="w-full text-center text-xs border border-slate-300">
                      <thead className="bg-slate-700 text-white">
                        <tr>{t.headers.map((h, i) => <th key={i} className="p-1 border">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {t.rows.map((r, ri) => (
                          <tr key={ri} className="border-t">{r.map((c, ci) => <td key={ci} className="p-1 border">{c}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                </div>
              )}

              <textarea
                value={text}
                onChange={(e) => {
                  onChangeText(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                className="w-full flex-1 min-h-[140px] resize-none focus:outline-none bg-transparent"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  color: settings.fontColor,
                  fontWeight: settings.isBold ? 700 : 400,
                  fontStyle: settings.isItalic ? 'italic' : 'normal',
                  textAlign: settings.textAlign,
                  lineHeight: 1.7,
                }}
                placeholder="اكتب مستندك بالكامل هنا..."
                inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- APP: MICROSOFT EXCEL MOBILE INTERFACE --- */}
      {activeTargetApp === 'excelSheet' && (
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
          {/* Excel Ribbon Bar */}
          <div className="bg-[#107c41] text-white px-3 py-1.5 flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Microsoft Excel Mobile</span>
              <span className="text-[10px] bg-emerald-800 px-1.5 py-0.2 rounded font-mono">مصنف1.xlsx</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExcelFiltersOn(!isExcelFiltersOn)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  isExcelFiltersOn ? 'bg-emerald-800 text-white' : 'bg-emerald-950/40 text-emerald-200'
                }`}
                title="تصفية (Ctrl + Shift + L)"
              >
                <Filter className="w-3 h-3" />
                <span>تصفية</span>
              </button>
              <button
                onClick={() => {
                  // AutoSum column
                  const colIdx = activeCell.c;
                  let sum = 0;
                  for (let r = 1; r < excelData.length - 1; r++) {
                    const val = parseFloat(excelData[r][colIdx]) || 0;
                    sum += val;
                  }
                  const updated = [...excelData];
                  updated[excelData.length - 1][colIdx] = sum.toString();
                  setExcelData(updated);
                }}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 rounded text-[11px] font-semibold flex items-center gap-1"
                title="الجمع التلقائي (Alt + =)"
              >
                <Sigma className="w-3 h-3 text-amber-300" />
                <span>AutoSum</span>
              </button>
            </div>
          </div>

          {/* Excel Formula Bar */}
          <div className="bg-white border-b border-slate-300 px-3 py-1 flex items-center gap-2 text-xs shrink-0">
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 min-w-[36px] text-center">
              {String.fromCharCode(65 + activeCell.c)}{activeCell.r + 1}
            </span>
            <span className="font-serif italic font-bold text-slate-400 select-none">fx</span>
            <input
              type="text"
              value={excelData[activeCell.r]?.[activeCell.c] || ''}
              onChange={(e) => {
                const updated = excelData.map((row, ri) =>
                  ri === activeCell.r
                    ? row.map((cell, ci) => (ci === activeCell.c ? e.target.value : cell))
                    : row
                );
                setExcelData(updated);
              }}
              className="flex-1 bg-transparent focus:outline-none font-mono text-xs text-slate-800"
              placeholder="أدخل صيغة أو قيمة..."
            />
          </div>

          {/* Interactive Spreadsheet Grid */}
          <div className="flex-1 overflow-auto bg-slate-50 p-2">
            <div className="inline-block min-w-full bg-white rounded-lg shadow-xs border border-slate-300 overflow-hidden">
              <table className="w-full border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 text-center font-bold">
                    <th className="w-8 border border-slate-300 bg-slate-300 text-slate-600 text-[10px]">#</th>
                    {['A', 'B', 'C', 'D'].map((colName, cIndex) => (
                      <th key={colName} className="p-1.5 border border-slate-300 text-slate-800 relative min-w-[100px]">
                        <div className="flex items-center justify-between px-1">
                          <span>{colName} - {excelData[0]?.[cIndex] || ''}</span>
                          {isExcelFiltersOn && (
                            <Filter className="w-2.5 h-2.5 text-slate-500 hover:text-emerald-700 cursor-pointer" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(1).map((row, rowIdx) => {
                    const actualRowIdx = rowIdx + 1;
                    const isTotalRow = actualRowIdx === excelData.length - 1;
                    return (
                      <tr
                        key={actualRowIdx}
                        className={`border-b border-slate-200 hover:bg-slate-50 ${
                          isTotalRow ? 'bg-emerald-50/70 font-bold border-t-2 border-emerald-500' : ''
                        }`}
                      >
                        <td className="w-8 p-1 text-center bg-slate-100 border-r border-slate-300 text-slate-500 font-mono text-[10px]">
                          {actualRowIdx + 1}
                        </td>
                        {row.map((cellVal, colIdx) => {
                          const isSelected = activeCell.r === actualRowIdx && activeCell.c === colIdx;
                          return (
                            <td
                              key={colIdx}
                              onClick={() => setActiveCell({ r: actualRowIdx, c: colIdx })}
                              className={`p-1.5 border border-slate-200 transition-colors cursor-cell relative ${
                                isSelected
                                  ? 'bg-emerald-100/70 ring-2 ring-emerald-600 z-10'
                                  : ''
                              }`}
                            >
                              <input
                                type="text"
                                value={cellVal}
                                onChange={(e) => {
                                  const updated = excelData.map((r, ri) =>
                                    ri === actualRowIdx
                                      ? r.map((c, ci) => (ci === colIdx ? e.target.value : c))
                                      : r
                                  );
                                  setExcelData(updated);
                                }}
                                onFocus={() => setActiveCell({ r: actualRowIdx, c: colIdx })}
                                className="w-full bg-transparent focus:outline-none text-slate-800 font-medium"
                                style={{
                                  fontFamily: settings.fontFamily,
                                  textAlign: colIdx === 0 ? 'right' : 'center',
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Excel Footer Quick Shortcuts Helper */}
          <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-bold flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-emerald-700" />
                <span>ورقة1</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-mono">Alt + = (AutoSum)</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-mono">Ctrl + Shift + L (فلترة)</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-mono">F2 (تحرير الخلية)</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold shrink-0">
              Excel 365 جاهز
            </span>
          </div>
        </div>
      )}

      {/* --- APP 5: MESSAGES (One UI SMS) --- */}
      {activeTargetApp === 'messages' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
          <div className="bg-purple-700 text-white px-3 py-2 flex items-center justify-between text-xs shrink-0 select-none">
            <span className="font-bold">الرسائل القصيرة (Samsung Messages)</span>
            <span className="text-[10px] text-purple-200">One UI</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="bg-white p-3 rounded-2xl shadow-2xs border border-slate-200 max-w-[85%] text-xs">
              <p className="font-semibold text-purple-800 text-[11px] mb-1">رسالة نصية واردة:</p>
              <p>تم استلام مستندك، يمكنك الرد الآن باستخدام لوحة المفاتيح الملحقة.</p>
            </div>

            {text && (
              <div className="mr-auto bg-purple-600 text-white p-3 rounded-2xl shadow-xs max-w-[85%] text-xs">
                <p className="text-[10px] text-purple-200 mb-0.5">نص الرسالة الحالي:</p>
                <p style={{ fontFamily: activeFont.fontFamily }}>{text}</p>
              </div>
            )}
          </div>

          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                onChangeText(e.target.value);
                onCursorChange(e.target.selectionStart || 0);
              }}
              placeholder="اكتب رسالة SMS..."
              className="flex-1 bg-slate-100 text-xs px-3 py-1.5 rounded-full focus:outline-none"
              style={{ fontFamily: activeFont.fontFamily }}
              inputMode={activeKeyboard === 'attached' ? 'none' : 'text'}
            />
            <button onClick={handleSendChat} className="p-2 bg-purple-600 text-white rounded-full active:scale-95">
              <Send className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
