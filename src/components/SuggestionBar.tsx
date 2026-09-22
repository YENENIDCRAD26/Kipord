import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface SuggestionBarProps {
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  fontFamily?: string;
  lang: 'ar' | 'en';
}

export const SuggestionBar: React.FC<SuggestionBarProps> = ({
  suggestions,
  onSelectSuggestion,
  fontFamily,
  lang,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      id="keyboard-prediction-bar"
      className="flex items-center px-2 py-1.5 bg-slate-100/95 border-b border-slate-300 text-xs gap-1.5 overflow-x-auto scrollbar-none shadow-2xs select-none backdrop-blur-xs shrink-0"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Icon badge */}
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 pl-1 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden xs:inline text-[10px] text-slate-400">توقع:</span>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none py-0.5">
        {suggestions.map((word, index) => {
          // Highlight the most likely first suggestion with special visual accent
          const isPrimary = index === 0;
          return (
            <button
              key={`${word}-${index}`}
              id={`prediction-chip-${index}`}
              onClick={() => onSelectSuggestion(word)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-2xs flex items-center gap-1 border cursor-pointer ${
                isPrimary
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 ring-1 ring-blue-300 font-bold'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
              style={{
                fontFamily: lang === 'ar' && fontFamily ? fontFamily : 'inherit',
              }}
              title={`إدراج "${word}"`}
            >
              {isPrimary && <Check className="w-3 h-3 stroke-[2.5]" />}
              <span>{word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
