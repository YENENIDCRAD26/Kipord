import React from 'react';
import {
  Mic,
  Smile,
  Settings,
  Globe,
  CornerDownLeft,
  Delete,
  Space,
  Sparkles,
  ArrowUp,
  Smartphone
} from 'lucide-react';

interface NativeKeyboardProps {
  onSwitchToAttachedKeyboard: () => void;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onSpace: () => void;
}

export const NativeKeyboard: React.FC<NativeKeyboardProps> = ({
  onSwitchToAttachedKeyboard,
  onKeyPress,
  onBackspace,
  onEnter,
  onSpace,
}) => {
  const nativeRow1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'];
  const nativeRow2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'];
  const nativeRow3 = ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'];

  return (
    <div
      id="samsung-native-keyboard"
      className="bg-[#26282b] text-white flex flex-col border-t border-slate-700 shadow-2xl select-none shrink-0 w-full animate-in slide-in-from-bottom duration-200"
      dir="rtl"
    >
      {/* 1. NATIVE SYSTEM NOTIFICATION & SWITCH BAR */}
      <div className="bg-[#1c1d1f] px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-[11px]">لوحة مفاتيح الهاتف الأصلية (Samsung Keyboard)</span>
        </div>

        {/* PRIMARY SWITCH BUTTON: فتح الكيبورد الملحق (5.5 cm) */}
        <button
          onClick={onSwitchToAttachedKeyboard}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 animate-pulse"
          title="إغلاق لوحة الهاتف وفتح الكيبورد الملحق تلقائياً"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>فتح الكيبورد الملحق (5.5 cm)</span>
        </button>
      </div>

      {/* 2. SAMSUNG KEYBOARD TOOLBAR */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#202225] border-b border-slate-700/60 text-slate-400 text-xs">
        <div className="flex items-center gap-3">
          <Smile className="w-4 h-4 cursor-pointer hover:text-white" />
          <Mic className="w-4 h-4 cursor-pointer hover:text-white" />
          <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
        <span className="text-[10px] text-slate-500">العربية (AR) • لوحة النظام الافتراضية</span>
      </div>

      {/* 3. NATIVE KEYS MATRIX */}
      <div className="p-1.5 space-y-1 bg-[#26282b]">
        {/* Row 1 */}
        <div className="flex items-center justify-center gap-1">
          {nativeRow1.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 h-9 rounded-md bg-[#383a40] hover:bg-[#43464d] active:bg-[#50535b] text-sm font-semibold flex items-center justify-center transition-all active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-center gap-1 px-2">
          {nativeRow2.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 h-9 rounded-md bg-[#383a40] hover:bg-[#43464d] active:bg-[#50535b] text-sm font-semibold flex items-center justify-center transition-all active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3 with Backspace */}
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={onBackspace}
            className="w-12 h-9 rounded-md bg-[#2d2f34] hover:bg-[#383a40] text-slate-300 flex items-center justify-center transition-all active:scale-95"
            title="حذف"
          >
            <Delete className="w-4 h-4" />
          </button>

          {nativeRow3.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 h-9 rounded-md bg-[#383a40] hover:bg-[#43464d] active:bg-[#50535b] text-sm font-semibold flex items-center justify-center transition-all active:scale-95"
            >
              {char}
            </button>
          ))}

          <button
            onClick={() => onKeyPress('!')}
            className="w-8 h-9 rounded-md bg-[#383a40] hover:bg-[#43464d] text-sm font-bold flex items-center justify-center"
          >
            !
          </button>
        </div>

        {/* Row 4: 123, Globe, Spacebar, Enter */}
        <div className="flex items-center justify-center gap-1 pt-0.5">
          <button
            onClick={() => onKeyPress('123')}
            className="w-12 h-9 rounded-md bg-[#2d2f34] text-xs font-bold text-slate-300 flex items-center justify-center"
          >
            !؟123
          </button>

          <button
            onClick={onSpace}
            className="flex-1 h-9 rounded-md bg-[#383a40] hover:bg-[#43464d] active:bg-[#50535b] text-xs font-medium text-slate-300 flex items-center justify-center transition-all active:scale-95"
          >
            مسافة (العربية)
          </button>

          <button
            onClick={() => onKeyPress('.')}
            className="w-8 h-9 rounded-md bg-[#383a40] text-sm font-bold flex items-center justify-center"
          >
            .
          </button>

          <button
            onClick={onEnter}
            className="w-14 h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all active:scale-95"
            title="إدخال"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
