import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  FileSpreadsheet,
  FileText,
  Smartphone,
  ExternalLink,
  Search,
  MessageSquare,
  Mail,
  Eye,
  EyeOff,
  PenTool,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Table as TableIcon,
  Smile,
  FileDown
} from 'lucide-react';
import { KeyboardSettings, InsertModalTab } from '../types';

interface AndroidControllerHubProps {
  text: string;
  cursorPos: number;
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
  onClearText: () => void;
  onInsertSample: (str: string) => void;
  onOpenInsertModal?: (tab: InsertModalTab) => void;
  onExportJpg?: () => void;
  onExportPdf?: () => void;
  imagesCount?: number;
  tablesCount?: number;
}

export const AndroidControllerHub: React.FC<AndroidControllerHubProps> = ({
  text,
  cursorPos,
  settings,
  onUpdateSettings,
  onClearText,
  onInsertSample,
  onOpenInsertModal,
  onExportJpg,
  onExportPdf,
  imagesCount = 0,
  tablesCount = 0,
}) => {
  const [copiedApp, setCopiedApp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'samsungSettings'>('hub');

  // Trigger Android System Share
  const handleAndroidSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نص من لوحة مفاتيح سامسونج الملحقة',
          text: text,
        });
        showFeedback('share');
      } catch (err) {
        // user cancelled or share failed
        handleDirectCopy('share');
      }
    } else {
      handleDirectCopy('share');
    }
  };

  const showFeedback = (appName: string) => {
    setCopiedApp(appName);
    setTimeout(() => setCopiedApp(null), 2500);
  };

  const handleDirectCopy = async (appName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showFeedback(appName);
    } catch {
      // fallback
    }
  };

  // Launch or direct action for specific Android Apps
  const handleAppAction = (appName: 'whatsapp' | 'samsungNotes' | 'wordExcel' | 'sms' | 'gmail' | 'search') => {
    const encoded = encodeURIComponent(text);
    handleDirectCopy(appName);

    switch (appName) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?body=${encoded}`, '_self');
        break;
      case 'gmail':
        window.open(`mailto:?body=${encoded}&subject=${encodeURIComponent('رسالة من لوحة مفاتيح سامسونج')}`, '_self');
        break;
      case 'search':
        window.open(`https://www.google.com/search?q=${encoded}`, '_blank');
        break;
      case 'wordExcel': {
        // Create downloadable text/docx ready file and copy
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `مستند_Word_Excel_PRO_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'samsungNotes':
        // Copies to Android clipboard specifically for Samsung Notes quick paste
        break;
    }
  };

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden select-none border-b border-slate-700" dir="rtl">
      {/* 1. Android & Samsung Status Bar Indicator */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 text-[11px] font-bold">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>سامسونج نوت 10 بلس | One UI</span>
          </div>

          {settings.autoSyncClipboard && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] animate-pulse">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>مزامنة الحافظة نشطة</span>
            </div>
          )}
        </div>

        {/* Insert Media & Export & Toggle Editor Paper Buttons */}
        <div className="flex items-center gap-1">
          {onOpenInsertModal && (
            <>
              <button
                onClick={() => onOpenInsertModal('image')}
                className="px-2 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="إدراج صورة"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden xs:inline">صورة</span>
              </button>

              <button
                onClick={() => onOpenInsertModal('table')}
                className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="إدراج جدول"
              >
                <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">جدول</span>
              </button>

              <button
                onClick={() => onOpenInsertModal('symbol')}
                className="px-2 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="رموز وزخارف"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">رموز</span>
              </button>

              <button
                onClick={() => onOpenInsertModal('emoji')}
                className="px-2 py-1 bg-yellow-900/60 hover:bg-yellow-800 text-yellow-200 border border-yellow-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="إيموجي"
              >
                <Smile className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden xs:inline">إيموجي</span>
              </button>
            </>
          )}

          {onExportJpg && (
            <button
              onClick={onExportJpg}
              className="px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              title="تصدير JPG"
            >
              <span>JPG</span>
            </button>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              title="تصدير PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </button>
          )}

          <button
            id="toggle-editor-paper-btn"
            onClick={() => onUpdateSettings({ showEditorPaper: !settings.showEditorPaper })}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
              settings.showEditorPaper
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400'
            }`}
            title="إظهار أو إخفاء ورقة المحرر الورقية"
          >
            {settings.showEditorPaper ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>إخفاء الورقة</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار الورقة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Sleek Active Input Display (حقل الإدخال المباشر الذكي بدلاً من الورقة الكبيرة) */}
      <div className="p-3 bg-slate-900/90 flex-1 flex flex-col justify-between overflow-hidden">
        {/* Current text box */}
        <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
          <div className="overflow-y-auto max-h-[140px] scrollbar-thin scrollbar-thumb-slate-700 pr-1">
            <p
              className="text-slate-100 text-base leading-relaxed whitespace-pre-wrap select-text selection:bg-blue-600"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${Math.min(settings.fontSize, 20)}px`,
                color: settings.fontColor === '#1e293b' ? '#f8fafc' : settings.fontColor,
                textAlign: settings.textAlign,
              }}
            >
              {text.slice(0, cursorPos)}
              <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse align-middle mx-0.5" />
              {text.slice(cursorPos)}
              {text.length === 0 && (
                <span className="text-slate-500 italic text-sm">
                  انقر على لوحة المفاتيح أدناه للكتابة الفورية والتحكم بتطبيقات سامسونج وأندرويد...
                </span>
              )}
            </p>
          </div>

          {/* Bottom text info & quick clipboard button */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>{wordsCount} كلمة</span>
              <span>{charsCount} حرف</span>
              <span className="text-blue-400 font-medium">{settings.fontFamilyName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleDirectCopy('quick')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all active:scale-95"
                title="نسخ النص للحافظة"
              >
                {copiedApp === 'quick' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم النسخ ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </>
                )}
              </button>

              <button
                onClick={onClearText}
                className="px-2 py-0.5 rounded-md bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-all active:scale-95 text-[10px]"
                title="مسح النص"
              >
                مسح
              </button>
            </div>
          </div>
        </div>

        {/* 3. Android Apps Controller Grid (التحكم بكافة تطبيقات أندرويد وسامسونج) */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              متحكم تطبيقات أندرويد وسامسونج نوت 10+:
            </span>
            <span className="text-[10px] text-slate-500">نقل فوري بضغطة زر</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {/* 1. Word & Excel Editor PRO (كما في الصورة) */}
            <button
              onClick={() => handleAppAction('wordExcel')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="محرر Word & Excel PRO (كما في الصورة)"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600/90 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">Word & Excel</span>
            </button>

            {/* 2. Samsung Notes */}
            <button
              onClick={() => handleAppAction('samsungNotes')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="ملاحظات سامسونج (Samsung Notes) ونوت 10 بلس"
            >
              <div className="w-6 h-6 rounded-md bg-amber-600/90 text-white flex items-center justify-center shadow-xs">
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">ملاحظات سامسونج</span>
            </button>

            {/* 3. WhatsApp */}
            <button
              onClick={() => handleAppAction('whatsapp')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="إرسال إلى واتساب مباشرة"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">واتساب</span>
            </button>

            {/* 4. SMS Messages */}
            <button
              onClick={() => handleAppAction('sms')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="تطبيق رسائل أندرويد"
            >
              <div className="w-6 h-6 rounded-md bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">رسائل SMS</span>
            </button>

            {/* 5. Gmail */}
            <button
              onClick={() => handleAppAction('gmail')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-rose-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="تطبيق البريد الإلكتروني"
            >
              <div className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">بريد Gmail</span>
            </button>

            {/* 6. Google Search */}
            <button
              onClick={() => handleAppAction('search')}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="بحث في المتصفح وجوجل"
            >
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-200 truncate w-full">بحث المتصفح</span>
            </button>

            {/* 7. Full Android System Share */}
            <button
              onClick={handleAndroidSystemShare}
              className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group text-center"
              title="مشاركة نظام أندرويد لجميع التطبيقات"
            >
              <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-xs">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-blue-200 truncate w-full">كافة التطبيقات</span>
            </button>
          </div>
        </div>

        {/* 4. Samsung One UI S-Pen & Floating Keyboard Mode bar */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">نمط الكيبورد:</span>
            <button
              onClick={() =>
                onUpdateSettings({
                  keyboardDisplayMode: settings.keyboardDisplayMode === 'docked' ? 'floating' : 'docked',
                })
              }
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                settings.keyboardDisplayMode === 'docked'
                  ? 'bg-blue-900/60 border-blue-500 text-blue-200 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {settings.keyboardDisplayMode === 'docked' ? 'حجم افتراضي مثبت' : 'كيبورد عائم ملحق'}
            </button>

            <button
              onClick={() => onUpdateSettings({ autoSyncClipboard: !settings.autoSyncClipboard })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                settings.autoSyncClipboard
                  ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="مزامنة تلقائية للحافظة فور الكتابة"
            >
              مزامنة الحافظة: {settings.autoSyncClipboard ? 'مفعلة ✓' : 'معطلة'}
            </button>
          </div>

          <div className="text-[10px] text-slate-500">
            متوافق مع سامسونج نوت 10+ و S20-S24 وأندرويد 7+
          </div>
        </div>
      </div>
    </div>
  );
};
