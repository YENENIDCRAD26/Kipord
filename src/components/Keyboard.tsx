import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Sparkles,
  Smartphone,
  Hash,
  Palette,
  Globe,
  CornerDownLeft,
  Delete,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Type,
  ChevronDown,
  FileEdit,
  RotateCw,
  Plus,
  Image as ImageIcon,
  Zap,
  Command,
  BookOpen,
  Edit3,
} from 'lucide-react';
import {
  ARABIC_ROWS_NORMAL,
  ARABIC_ROWS_SHIFT,
  ENGLISH_ROWS_NORMAL,
  TASHKEEL_MARKS,
  KeyDef,
} from '../data/keyboardLayouts';
import { KeyboardSettings, InsertModalTab } from '../types';
import { soundPlayer } from '../utils/audio';
import { SuggestionBar } from './SuggestionBar';

const WESTERN_TO_ARABIC_DIGITS: Record<string, string> = {
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
};

// Map of key code to Arabic shortcut label when Ctrl is active
const CTRL_SHORTCUT_LABELS: Record<string, string> = {
  KeyS: 'حفظ (S)',
  KeyN: 'جديد (N)',
  KeyO: 'فتح (O)',
  KeyP: 'طباعة (P)',
  KeyB: 'غامق (B)',
  KeyI: 'مائل (I)',
  KeyU: 'تسطير (U)',
  KeyZ: 'تراجع (Z)',
  KeyY: 'إعادة (Y)',
  KeyF: 'بحث (F)',
  KeyH: 'استبدال (H)',
  KeyA: 'تحديد (A)',
  KeyC: 'نسخ (C)',
  KeyX: 'قص (X)',
  KeyV: 'لصق (V)',
  Semicolon: 'تاريخ (;)',
};

interface KeyboardProps {
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onSpace: () => void;
  onTab: () => void;
  onArrowMove: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onOpenFonts: () => void;
  onOpenColors: () => void;
  onOpenTools: () => void;
  onTogglePhoneMode: () => void;
  isPhoneFrame: boolean;
  orientation: 'portrait' | 'landscape';
  onToggleOrientation: () => void;
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  onOpenInsertModal?: (tab: InsertModalTab) => void;
  onOpenFeaturesDropdown?: () => void;
  onToggleNativeKeyboard?: () => void;
  isPaperFolded?: boolean;
  onTogglePaperFold?: () => void;
  onShortcut?: (shortcutId: string) => void;
  onOpenShortcutsModal?: () => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  settings,
  onUpdateSettings,
  onKeyPress,
  onBackspace,
  onEnter,
  onSpace,
  onTab,
  onArrowMove,
  onOpenFonts,
  onOpenColors,
  onOpenTools,
  onTogglePhoneMode,
  isPhoneFrame,
  orientation,
  onToggleOrientation,
  suggestions,
  onSelectSuggestion,
  onOpenInsertModal,
  onOpenFeaturesDropdown,
  onToggleNativeKeyboard,
  isPaperFolded = false,
  onTogglePaperFold,
  onShortcut,
  onOpenShortcutsModal,
}) => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [numberFormat, setNumberFormat] = useState<'western' | 'arabic'>('western');
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [isCtrl, setIsCtrl] = useState(false);
  const [isAlt, setIsAlt] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const backspaceTimerRef = useRef<number | null>(null);
  const backspaceIntervalRef = useRef<number | null>(null);

  // Trigger sound / haptic feedback
  const triggerFeedback = (isSpecial = false) => {
    if (settings.soundEnabled) {
      soundPlayer.playKeyClick(isSpecial);
    }
    if (settings.hapticEnabled) {
      soundPlayer.playHaptic();
    }
  };

  const handleKeyClick = (key: KeyDef) => {
    setPressedKey(key.code);
    setTimeout(() => setPressedKey(null), 120);

    triggerFeedback(key.type === 'action' || key.type === 'modifier');

    if (key.code === 'Backspace') {
      onBackspace();
      return;
    }

    if (key.code === 'Enter') {
      onEnter();
      return;
    }

    if (key.code === 'Space') {
      onSpace();
      return;
    }

    if (key.code === 'Tab') {
      onTab();
      return;
    }

    if (key.code === 'CapsLock') {
      setIsCaps(!isCaps);
      return;
    }

    if (key.code === 'ShiftLeft' || key.code === 'ShiftRight') {
      setIsShift(!isShift);
      return;
    }

    if (key.code === 'ControlLeft') {
      setIsCtrl(!isCtrl);
      return;
    }

    if (key.code === 'AltLeft') {
      setIsAlt(!isAlt);
      return;
    }

    // --- SHORTCUTS EXECUTION WHEN MODIFIERS ARE ACTIVE ---

    // 1. Alt + = (AutoSum)
    if (isAlt) {
      if (key.code === 'PlusMinus' || key.label === '=' || key.label === '±' || key.label === '+' || key.shiftLabel === '+') {
        onShortcut?.('auto_sum');
        setIsAlt(false);
        return;
      }
    }

    // 2. Ctrl + Shift combinations
    if (isCtrl && isShift) {
      // Ctrl + Shift + L -> Toggle Filters (Excel)
      if (key.code === 'KeyL') {
        onShortcut?.('toggle_filters');
        setIsCtrl(false);
        setIsShift(false);
        return;
      }
      // Ctrl + Shift + : -> Insert Current Time (Excel)
      if (key.code === 'Semicolon' || key.label === ':' || key.label === ';' || key.shiftLabel === ':') {
        onShortcut?.('insert_time');
        setIsCtrl(false);
        setIsShift(false);
        return;
      }
    }

    // 3. Ctrl combinations (Common Word & Excel)
    if (isCtrl) {
      switch (key.code) {
        case 'KeyN':
          onShortcut?.('new_doc');
          setIsCtrl(false);
          return;
        case 'KeyO':
          onShortcut?.('open_file');
          setIsCtrl(false);
          return;
        case 'KeyS':
          onShortcut?.('save_doc');
          setIsCtrl(false);
          return;
        case 'KeyP':
          onShortcut?.('print_doc');
          setIsCtrl(false);
          return;
        case 'KeyC':
          onShortcut?.('copy_text');
          setIsCtrl(false);
          return;
        case 'KeyX':
          onShortcut?.('cut_text');
          setIsCtrl(false);
          return;
        case 'KeyV':
          onShortcut?.('paste_text');
          setIsCtrl(false);
          return;
        case 'KeyA':
          onShortcut?.('select_all');
          setIsCtrl(false);
          return;
        case 'KeyZ':
          onShortcut?.('undo');
          setIsCtrl(false);
          return;
        case 'KeyY':
          onShortcut?.('redo');
          setIsCtrl(false);
          return;
        case 'KeyF':
          onShortcut?.('search');
          setIsCtrl(false);
          return;
        case 'KeyH':
          onShortcut?.('replace');
          setIsCtrl(false);
          return;
        case 'KeyB':
          onShortcut?.('bold');
          setIsCtrl(false);
          return;
        case 'KeyI':
          onShortcut?.('italic');
          setIsCtrl(false);
          return;
        case 'KeyU':
          onShortcut?.('underline');
          setIsCtrl(false);
          return;
        case 'Semicolon':
          onShortcut?.('insert_date');
          setIsCtrl(false);
          return;
        default:
          break;
      }
    }

    if (key.code === 'LangToggle') {
      setLang(lang === 'ar' ? 'en' : 'ar');
      return;
    }

    if (key.code === 'ArrowLeft') {
      onArrowMove('left');
      return;
    }

    if (key.code === 'ArrowRight') {
      onArrowMove('right');
      return;
    }

    // Determine actual character output
    let outputChar = key.label;
    if (lang === 'ar') {
      if (isShift && key.shiftLabel) {
        outputChar = key.shiftLabel;
      }
    } else {
      if (isShift || isCaps) {
        outputChar = key.label.toUpperCase();
      } else {
        outputChar = key.label.toLowerCase();
      }
    }

    if (numberFormat === 'arabic' && WESTERN_TO_ARABIC_DIGITS[outputChar]) {
      outputChar = WESTERN_TO_ARABIC_DIGITS[outputChar];
    }

    onKeyPress(outputChar);

    // Turn off shift after one character unless Caps is on
    if (isShift && !isCaps) {
      setIsShift(false);
    }
  };

  // Backspace continuous press
  const handleBackspaceStart = () => {
    triggerFeedback(true);
    onBackspace();
    backspaceTimerRef.current = window.setTimeout(() => {
      backspaceIntervalRef.current = window.setInterval(() => {
        triggerFeedback(true);
        onBackspace();
      }, 70);
    }, 320);
  };

  const handleBackspaceEnd = () => {
    if (backspaceTimerRef.current) clearTimeout(backspaceTimerRef.current);
    if (backspaceIntervalRef.current) clearInterval(backspaceIntervalRef.current);
  };

  // Select key rows to render
  const rows = lang === 'ar'
    ? (isShift ? ARABIC_ROWS_SHIFT : ARABIC_ROWS_NORMAL)
    : ENGLISH_ROWS_NORMAL;

  // Minimized state bar
  if (settings.isMinimized) {
    return (
      <div className="bg-slate-800 text-white px-3 py-2 rounded-t-xl shadow-lg flex items-center justify-between border-t border-slate-700 animate-in slide-in-from-bottom duration-200 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">لوحة المفاتيح مصغرة</span>
          <span className="text-slate-400">({settings.fontFamilyName})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateSettings({ isMinimized: false })}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            استعادة الكيبورد
          </button>
        </div>
      </div>
    );
  }

  const isLandscape = orientation === 'landscape';

  return (
    <div
      id="android-keyboard-root"
      className="bg-[#d5dbe3] border-t-2 border-slate-300 shadow-2xl select-none flex flex-col font-sans transition-all shrink-0 w-full overflow-hidden"
      style={{
        height: '6.3cm',
        minHeight: '6.3cm',
        maxHeight: '6.3cm',
      }}
      dir="ltr"
    >
      {/* 1. TOP CONTROL BAR (طابق الشكل المرفق بالصورة: ✕ — ▼ أدوات ✨ هاتف 📱 أرقام: ١٢٣ نسق: قياسي 101 لون الخط 🎨) */}
      <div
        id="keyboard-top-control-bar"
        className="flex items-center px-1.5 sm:px-2 py-0.5 bg-[#e2e8f0]/95 border-b border-slate-300 text-xs text-slate-800 gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none shrink-0 select-none h-[30px]"
        dir="ltr"
      >
        {/* 1. Close ✕ */}
        <button
          id="kb-close-btn"
          onClick={() => {
            triggerFeedback(true);
            if (onTogglePaperFold) onTogglePaperFold();
            else onUpdateSettings({ isMinimized: true });
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-300/70 text-slate-700 hover:text-slate-900 transition-colors font-bold text-xs shrink-0 active:scale-95"
          title="إغلاق / تصغير"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* 2. Minimize Dash — */}
        <button
          id="kb-minimize-btn"
          onClick={() => {
            triggerFeedback(true);
            if (onTogglePaperFold) onTogglePaperFold();
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-300/70 text-slate-700 hover:text-slate-900 transition-colors font-bold text-sm shrink-0 active:scale-95"
          title="طي الورقة إلى أسفل / إظهار شاشة الهاتف"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* 3. ▼ أدوات ✨ */}
        <button
          id="kb-tools-dropdown-btn"
          onClick={() => {
            triggerFeedback(true);
            onOpenTools();
          }}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
          title="أدوات الكيبورد"
        >
          <ChevronDown className="w-3 h-3 text-slate-600 stroke-[2.5]" />
          <span>أدوات</span>
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
        </button>

        {/* 4. هاتف 📱 */}
        <button
          id="kb-phone-view-btn"
          onClick={() => {
            triggerFeedback(true);
            if (onTogglePaperFold) {
              onTogglePaperFold();
            } else if (onToggleNativeKeyboard) {
              onToggleNativeKeyboard();
            }
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-blue-400 bg-white hover:bg-blue-50 text-blue-600 font-bold shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
          title="عرض شاشة الهاتف الافتراضي / طي ورقة المحرر"
        >
          <span>هاتف</span>
          <Smartphone className="w-3 h-3 text-blue-600" />
        </button>

        {/* 5. أرقام: ١٢٣ */}
        <button
          id="kb-toggle-digits-btn"
          onClick={() => {
            triggerFeedback(false);
            setNumberFormat(numberFormat === 'arabic' ? 'western' : 'arabic');
          }}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
          title="تبديل الأرقام بين العربية والمشرقية"
        >
          <span>أرقام: {numberFormat === 'arabic' ? '123' : '١٢٣'}</span>
        </button>

        {/* 6. نسق: قياسي 101 */}
        <button
          id="kb-layout-spec-btn"
          onClick={() => {
            triggerFeedback(false);
          }}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
          title="نسق لوحة المفاتيح: قياسي 101 مفتاح"
        >
          <span>نسق: قياسي 101</span>
        </button>

        {/* 7. لون الخط 🎨 */}
        <button
          id="kb-font-color-btn"
          onClick={() => {
            triggerFeedback(true);
            onOpenColors();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
          title="تغيير لون وحجم الخط"
        >
          <span>لون الخط</span>
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
            style={{ backgroundColor: settings.fontColor }}
          />
        </button>

        {/* 8. اختصارات ⚡ (دليل واختصارات Word & Excel) */}
        {onOpenShortcutsModal && (
          <button
            id="kb-shortcuts-btn"
            onClick={() => {
              triggerFeedback(true);
              onOpenShortcutsModal();
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold shadow-2xs transition-all active:scale-95 text-[11px] shrink-0"
            title="دليل واختصارات وورد وإكسل (Ctrl & Alt & Shift)"
          >
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>اختصارات</span>
          </button>
        )}

        {/* 9. F2 (تحرير الخلية / المحرر) */}
        <button
          id="kb-f2-btn"
          onClick={() => {
            triggerFeedback(true);
            onShortcut?.('edit_cell');
          }}
          className="px-1.5 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-mono font-bold shadow-2xs transition-all active:scale-95 text-[10px] shrink-0"
          title="F2: تحرير الخلية في إكسل أو التركيز على المحرر"
        >
          F2
        </button>

        {/* 10. F7 (التدقيق الإملائي والنحوي) */}
        <button
          id="kb-f7-btn"
          onClick={() => {
            triggerFeedback(true);
            onShortcut?.('spell_check');
          }}
          className="px-1.5 py-0.5 rounded-md border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono font-bold shadow-2xs transition-all active:scale-95 text-[10px] shrink-0"
          title="F7: إجراء التدقيق الإملائي والنحوي الشامل"
        >
          F7
        </button>
      </div>

      {/* ACTIVE MODIFIERS HELPER BANNER (شريط توجيهي لاختصارات Ctrl و Alt النشطة) */}
      {isCtrl && (
        <div
          id="kb-ctrl-active-banner"
          className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-[10px] sm:text-[11px] font-bold shrink-0 animate-in fade-in"
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="bg-white text-blue-800 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-wider font-extrabold shadow-2xs">
              Ctrl مفعّل
            </span>
            <span className="truncate">
              S: حفظ | N: جديد | O: فتح | P: طباعة | B: غامق | Z: تراجع | F: بحث | C: نسخ | V: لصق | A: تحديد | ;: تاريخ
            </span>
          </div>
          <button
            onClick={() => setIsCtrl(false)}
            className="text-white/90 hover:text-white px-1.5 py-0.5 text-[9px] bg-blue-900/80 hover:bg-blue-900 rounded mr-1 shrink-0"
          >
            إلغاء ✕
          </button>
        </div>
      )}

      {isAlt && (
        <div
          id="kb-alt-active-banner"
          className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white text-[10px] sm:text-[11px] font-bold shrink-0 animate-in fade-in"
          dir="rtl"
        >
          <div className="flex items-center gap-1.5">
            <span className="bg-white text-purple-900 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-wider font-extrabold shadow-2xs">
              Alt مفعّل
            </span>
            <span>اضغط مفتاح (=) أو (±) لإدراج دالة التجميع التلقائي (=SUM)</span>
          </div>
          <button
            onClick={() => setIsAlt(false)}
            className="text-white/90 hover:text-white px-1.5 py-0.5 text-[9px] bg-purple-900/80 hover:bg-purple-900 rounded mr-1 shrink-0"
          >
            إلغاء ✕
          </button>
        </div>
      )}

      {/* 2. PREDICTIVE WORD SUGGESTIONS BAR (الشريط العلوي لاقتراحات الكلمات التنبؤية) */}
      {settings.showSuggestionsBar && (
        <SuggestionBar
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
          fontFamily={settings.fontFamily}
          lang={lang}
        />
      )}

      {/* 3. TASHKEEL BAR (اختياري للتشكيل الفوري) */}
      {settings.showTashkeelBar && lang === 'ar' && (
        <div
          id="kb-tashkeel-bar"
          className="flex items-center justify-center gap-1 py-0.5 px-1.5 bg-slate-200/90 border-b border-slate-300 overflow-x-auto scrollbar-none shrink-0"
          dir="rtl"
        >
          <span className="text-[9px] font-bold text-slate-500 pl-1 shrink-0">تشكيل:</span>
          {TASHKEEL_MARKS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerFeedback(false);
                onKeyPress(item.char);
              }}
              title={item.name}
              className="min-w-[24px] sm:min-w-[26px] h-6 px-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-300 rounded text-xs font-bold flex items-center justify-center shadow-2xs active:scale-95 transition-all text-slate-800"
            >
              {item.char}
            </button>
          ))}
        </div>
      )}

      {/* 4. KEYBOARD KEYS MATRIX - Fitted comfortably to 6.3cm */}
      <div
        className="flex-1 min-h-0 p-1 flex flex-col justify-between bg-[#dbe1e9] max-w-full overflow-hidden gap-0.5"
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex-1 min-h-0 flex items-center justify-center gap-0.5 w-full my-[0.5px]">
            {row.map((key) => {
              // Custom rendering for Backspace / مسح
              if (key.code === 'Backspace') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-backspace"
                    onMouseDown={handleBackspaceStart}
                    onMouseUp={handleBackspaceEnd}
                    onMouseLeave={handleBackspaceEnd}
                    onTouchStart={handleBackspaceStart}
                    onTouchEnd={handleBackspaceEnd}
                    className="flex-none px-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 active:bg-rose-200 shadow-2xs flex items-center justify-center gap-0.5 transition-all active:scale-95 min-w-[34px] sm:min-w-[44px] h-full max-h-[38px] min-h-[26px]"
                    title="حذف (مسح)"
                  >
                    <Delete className="w-4 h-4 stroke-[2]" />
                    <span className="text-[10px] font-bold hidden xs:inline">مسح</span>
                  </button>
                );
              }

              // Enter key ↵
              if (key.code === 'Enter') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-enter"
                    onClick={() => handleKeyClick(key)}
                    className="flex-none px-1.5 rounded-md bg-[#1a73e8] border border-blue-700 text-white hover:bg-blue-700 active:bg-blue-800 shadow-2xs flex items-center justify-center gap-1 transition-all active:scale-95 font-bold min-w-[36px] sm:min-w-[48px] h-full max-h-[38px] min-h-[26px]"
                    title="إدخال (Enter)"
                  >
                    <CornerDownLeft className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-[10px] font-bold hidden xs:inline">Enter</span>
                  </button>
                );
              }

              // Alt Purple Key
              if (key.code === 'AltLeft') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-alt"
                    onClick={() => handleKeyClick(key)}
                    className={`rounded-md border font-bold text-[10px] sm:text-[11px] shadow-2xs flex items-center justify-center transition-all active:scale-95 min-w-[26px] sm:min-w-[34px] h-full max-h-[38px] min-h-[26px] px-1 ${
                      isAlt
                        ? 'bg-purple-800 text-white border-purple-900 ring-2 ring-purple-400'
                        : 'bg-[#9333ea] text-white border-purple-700 hover:bg-purple-700'
                    }`}
                  >
                    Alt
                  </button>
                );
              }

              // Language Toggle Key (Green 🌐 EN / عربي)
              if (key.code === 'LangToggle') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-lang-toggle"
                    onClick={() => handleKeyClick(key)}
                    className="rounded-md border border-emerald-300 bg-[#d1fae5] hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] sm:text-xs shadow-2xs flex items-center justify-center gap-0.5 transition-all active:scale-95 min-w-[32px] sm:min-w-[42px] h-full max-h-[38px] min-h-[26px] px-1"
                    title="تغيير لغة الإدخال"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
                  </button>
                );
              }

              // Space Bar
              if (key.code === 'Space') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-space"
                    onClick={() => handleKeyClick(key)}
                    className="flex-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm shadow-2xs flex items-center justify-center transition-all active:scale-98 h-full max-h-[38px] min-h-[26px]"
                  >
                    {lang === 'ar' ? 'مسافة (Space)' : 'Space'}
                  </button>
                );
              }

              // Arrow Cluster (Up / Down)
              if (key.code === 'ArrowCluster') {
                return (
                  <div
                    key={key.code}
                    className="flex flex-col gap-0.5 justify-between w-5 sm:w-6 h-full max-h-[38px] min-h-[26px]"
                  >
                    <button
                      onClick={() => {
                        triggerFeedback(true);
                        onArrowMove('up');
                      }}
                      className="w-full flex-1 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs active:scale-95"
                      title="سهم لأعلى"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => {
                        triggerFeedback(true);
                        onArrowMove('down');
                      }}
                      className="w-full flex-1 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs active:scale-95"
                      title="سهم لأسفل"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              }

              // Left Arrow
              if (key.code === 'ArrowLeft') {
                return (
                  <button
                    key={key.code}
                    onClick={() => {
                      triggerFeedback(true);
                      onArrowMove('left');
                    }}
                    className="rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs active:scale-95 w-5 sm:w-6 h-full max-h-[38px] min-h-[26px]"
                    title="سهم لليسار"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                );
              }

              // Right Arrow
              if (key.code === 'ArrowRight') {
                return (
                  <button
                    key={key.code}
                    onClick={() => {
                      triggerFeedback(true);
                      onArrowMove('right');
                    }}
                    className="rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs active:scale-95 w-5 sm:w-6 h-full max-h-[38px] min-h-[26px]"
                    title="سهم لليمين"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                );
              }

              // Shift Keys
              if (key.code === 'ShiftLeft' || key.code === 'ShiftRight') {
                return (
                  <button
                    key={key.code}
                    onClick={() => handleKeyClick(key)}
                    className={`flex-none rounded-md border font-bold text-[10px] sm:text-xs shadow-2xs flex items-center justify-center transition-all active:scale-95 min-w-[28px] sm:min-w-[36px] h-full max-h-[38px] min-h-[26px] ${
                      isShift
                        ? 'bg-blue-100 border-blue-400 text-blue-700 ring-1 ring-blue-300'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Shift
                  </button>
                );
              }

              // Caps Lock Key
              if (key.code === 'CapsLock') {
                return (
                  <button
                    key={key.code}
                    onClick={() => handleKeyClick(key)}
                    className={`flex-none rounded-md border font-bold text-[10px] sm:text-xs shadow-2xs flex items-center justify-center transition-all active:scale-95 min-w-[28px] sm:min-w-[36px] h-full max-h-[38px] min-h-[26px] ${
                      isCaps
                        ? 'bg-amber-100 border-amber-400 text-amber-800 ring-1 ring-amber-300'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Caps
                  </button>
                );
              }

              // Tab Key
              if (key.code === 'Tab') {
                return (
                  <button
                    key={key.code}
                    onClick={() => handleKeyClick(key)}
                    className="flex-none rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-[10px] sm:text-xs shadow-2xs flex items-center justify-center transition-all active:scale-95 min-w-[24px] sm:min-w-[32px] h-full max-h-[38px] min-h-[26px]"
                  >
                    Tab
                  </button>
                );
              }

              // Ctrl Key
              if (key.code === 'ControlLeft') {
                return (
                  <button
                    key={key.code}
                    id="kb-key-ctrl"
                    onClick={() => handleKeyClick(key)}
                    className={`rounded-md border font-bold text-[10px] sm:text-xs shadow-2xs flex items-center justify-center transition-all active:scale-95 min-w-[26px] sm:min-w-[34px] h-full max-h-[38px] min-h-[26px] px-1 ${
                      isCtrl
                        ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400 font-extrabold animate-pulse'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Control (Ctrl): تفعيل اختصارات Word & Excel"
                  >
                    Ctrl
                  </button>
                );
              }

              // Standard Character Key
              const isPressed = pressedKey === key.code;
              const hasCtrlShortcut = isCtrl && Boolean(CTRL_SHORTCUT_LABELS[key.code]);
              const hasAltAutoSum = isAlt && (key.code === 'PlusMinus' || key.label === '=' || key.label === '±' || key.shiftLabel === '+');

              return (
                <button
                  key={key.code}
                  onClick={() => handleKeyClick(key)}
                  className={`flex-1 rounded-md border text-slate-900 shadow-2xs flex flex-col items-center justify-center relative transition-all select-none hover:border-slate-400 active:scale-95 min-w-[18px] sm:min-w-[24px] h-full max-h-[38px] min-h-[26px] px-0.5 ${
                    hasCtrlShortcut
                      ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                      : hasAltAutoSum
                      ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-300'
                      : isPressed
                      ? 'bg-blue-100 border-blue-400 scale-95 ring-1 ring-blue-300'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                  style={{
                    fontFamily: lang === 'ar' ? settings.fontFamily : 'inherit',
                  }}
                >
                  {/* Shortcut badge if Ctrl is active */}
                  {hasCtrlShortcut && (
                    <span className="absolute -top-1.5 left-0 right-0 mx-auto text-[7px] bg-blue-600 text-white font-bold rounded-xs px-0.5 pointer-events-none truncate text-center shadow-xs max-w-[96%] leading-tight">
                      {CTRL_SHORTCUT_LABELS[key.code]}
                    </span>
                  )}

                  {/* AutoSum badge if Alt is active */}
                  {hasAltAutoSum && (
                    <span className="absolute -top-1.5 left-0 right-0 mx-auto text-[7px] bg-purple-700 text-white font-bold rounded-xs px-0.5 pointer-events-none truncate text-center shadow-xs max-w-[96%] leading-tight">
                      ∑ AutoSum
                    </span>
                  )}

                  {/* Shift label in corner if available */}
                  {!hasCtrlShortcut && !hasAltAutoSum && lang === 'ar' && key.shiftLabel && (
                    <span className="absolute top-0.5 right-1 text-[8px] text-slate-400 font-normal leading-none pointer-events-none">
                      {key.shiftLabel}
                    </span>
                  )}
                  <span className="text-[12px] sm:text-sm font-semibold leading-none">
                    {(() => {
                      const baseLabel = lang === 'ar'
                        ? (isShift && key.shiftLabel ? key.shiftLabel : key.label)
                        : (isShift || isCaps ? key.label.toUpperCase() : key.label.toLowerCase());
                      return (numberFormat === 'arabic' && WESTERN_TO_ARABIC_DIGITS[baseLabel])
                        ? WESTERN_TO_ARABIC_DIGITS[baseLabel]
                        : baseLabel;
                    })()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
