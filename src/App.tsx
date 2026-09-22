import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { APPROVED_FONTS } from './data/fonts';
import {
  KeyboardSettings,
  FontItem,
  DocImage,
  DocTable,
  InsertModalTab,
  TargetAppType,
  ActiveKeyboardType
} from './types';
import { Keyboard } from './components/Keyboard';
import { NativeKeyboard } from './components/NativeKeyboard';
import { TargetAppViewer } from './components/TargetAppViewer';
import { FeaturesDropdown } from './components/FeaturesDropdown';
import { EditorArea } from './components/EditorArea';
import { AndroidControllerHub } from './components/AndroidControllerHub';
import { FontsModal } from './components/FontsModal';
import { ColorPickerModal } from './components/ColorPickerModal';
import { ToolsMenu } from './components/ToolsMenu';
import { HelpModal } from './components/HelpModal';
import { InsertMediaModal } from './components/InsertMediaModal';
import { PhoneFrame } from './components/PhoneFrame';
import { ApkBuildModal } from './components/ApkBuildModal';
import { getWordSuggestions } from './utils/predictiveText';
import { exportElementAsJpg, exportElementAsPdf } from './utils/exportUtils';

const INITIAL_TEXT = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
مرحباً بك في لوحة مفاتيح سامسونج نوت 10+ الملحقة.
يمكنك الآن الكتابة بالخطوط الـ 18 المعتمدة، إدراج الصور والجداول والرموز والإيموجي، وحفظ المستند بصيغة JPG و PDF.`;

export default function App() {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [cursorPos, setCursorPos] = useState<number>(INITIAL_TEXT.length);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Active keyboard state: 'attached' (Custom 3.5cm keyboard) or 'native' (Samsung Original Keyboard)
  const [activeKeyboard, setActiveKeyboard] = useState<ActiveKeyboardType>('attached');

  // Active target app interface shown above keyboard: whatsapp, samsungNotes, telegram, wordDoc, messages
  const [activeTargetApp, setActiveTargetApp] = useState<TargetAppType>('samsungNotes');

  // Paper folding state: when true, paper folds down to reveal virtual phone screen
  const [isPaperFolded, setIsPaperFolded] = useState<boolean>(false);

  // View mode for the space above the keyboard: 'targetApp' (default), 'editorPaper', 'controllerHub'
  const [viewMode, setViewMode] = useState<'targetApp' | 'editorPaper' | 'controllerHub'>('editorPaper');

  // Features Dropdown state
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState<boolean>(false);

  // Inserted Images and Tables state
  const [images, setImages] = useState<DocImage[]>([]);
  const [tables, setTables] = useState<DocTable[]>([]);

  // Hidden document container ref for exporting even if user triggers export from Hub or Tools menu
  const hiddenCanvasRef = useRef<HTMLDivElement>(null);

  // Settings: Default font Amiri, editor paper is HIDDEN by default as requested
  const [settings, setSettings] = useState<KeyboardSettings>({
    soundEnabled: true,
    hapticEnabled: true,
    showTashkeelBar: true,
    showSuggestionsBar: true,
    showEditorPaper: false, // Default is false: Hide editor paper as requested
    keyboardSize: 'samsungDefault',
    samsungDeviceModel: 'note10plus',
    keyboardDisplayMode: 'docked',
    autoSyncClipboard: true, // Automatically keeps Android clipboard updated
    fontSize: 22,
    fontColor: '#1e293b',
    fontFamily: "'Amiri', serif",
    fontFamilyName: 'أميري',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'right',
    lineHeight: 1.7,
    activeLayout: 'standard101',
    isFloating: false,
    isMinimized: false,
  });

  // Auto-sync clipboard to control any Android app seamlessly
  useEffect(() => {
    if (settings.autoSyncClipboard && text && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // Safe catch for permissions
      });
    }
  }, [text, settings.autoSyncClipboard]);

  // Modals state
  const [isFontsModalOpen, setIsFontsModalOpen] = useState<boolean>(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [insertModalTab, setInsertModalTab] = useState<InsertModalTab>('image');

  // Find active font object
  const activeFont: FontItem = APPROVED_FONTS.find(
    (f) => f.fontFamily === settings.fontFamily
  ) || APPROVED_FONTS[4]; // fallback to Amiri

  const updateSettings = (newSettings: Partial<KeyboardSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Predictive text suggestions based on text up to cursorPos
  const suggestions = useMemo(() => {
    return getWordSuggestions(text, cursorPos, 'ar', 6);
  }, [text, cursorPos]);

  // Insert or complete word when suggestion clicked
  const handleSelectSuggestion = useCallback((word: string) => {
    setText((prev) => {
      const textBeforeCursor = prev.slice(0, cursorPos);
      const textAfterCursor = prev.slice(cursorPos);

      const lastChar = textBeforeCursor.slice(-1);
      const isAfterSpace = /\s/.test(lastChar) || textBeforeCursor.length === 0;

      if (!isAfterSpace) {
        const lastSpaceIndex = Math.max(
          textBeforeCursor.lastIndexOf(' '),
          textBeforeCursor.lastIndexOf('\n'),
          textBeforeCursor.lastIndexOf('\t')
        );
        const prefix = lastSpaceIndex === -1 ? '' : textBeforeCursor.slice(0, lastSpaceIndex + 1);
        const newText = prefix + word + ' ' + textAfterCursor;
        setCursorPos(prefix.length + word.length + 1);
        return newText;
      } else {
        const newText = textBeforeCursor + word + ' ' + textAfterCursor;
        setCursorPos(cursorPos + word.length + 1);
        return newText;
      }
    });
  }, [cursorPos]);

  // Keyboard text insertion at cursor
  const handleKeyPress = useCallback((char: string) => {
    setText((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + char + after;
    });
    setCursorPos((prev) => prev + char.length);
  }, [cursorPos]);

  const handleBackspace = useCallback(() => {
    if (cursorPos === 0) return;
    setText((prev) => {
      const before = prev.slice(0, cursorPos - 1);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - 1));
  }, [cursorPos]);

  const handleEnter = useCallback(() => {
    handleKeyPress('\n');
  }, [handleKeyPress]);

  const handleSpace = useCallback(() => {
    handleKeyPress(' ');
  }, [handleKeyPress]);

  const handleTab = useCallback(() => {
    handleKeyPress('    ');
  }, [handleKeyPress]);

  const handleArrowMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'left') {
      setCursorPos((prev) => Math.min(text.length, prev + 1));
    } else if (direction === 'right') {
      setCursorPos((prev) => Math.max(0, prev - 1));
    } else if (direction === 'up') {
      const lastNewline = text.lastIndexOf('\n', cursorPos - 1);
      if (lastNewline !== -1) {
        setCursorPos(lastNewline);
      } else {
        setCursorPos(0);
      }
    } else if (direction === 'down') {
      const nextNewline = text.indexOf('\n', cursorPos);
      if (nextNewline !== -1) {
        setCursorPos(nextNewline + 1);
      } else {
        setCursorPos(text.length);
      }
    }
  }, [cursorPos, text]);

  const handleSelectFont = (font: FontItem) => {
    updateSettings({
      fontFamily: font.fontFamily,
      fontFamilyName: font.nameArabic,
    });
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
    }
  };

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  // Open Insert Modal
  const handleOpenInsertModal = (tab: InsertModalTab = 'image') => {
    setInsertModalTab(tab);
    setIsInsertModalOpen(true);
  };

  // Add Image handler: adds image and switches paper on so user sees it right away
  const handleInsertImage = (newImage: DocImage) => {
    setImages((prev) => [...prev, newImage]);
    updateSettings({ showEditorPaper: true });
  };

  // Add Table handler: adds table and switches paper on
  const handleInsertTable = (newTable: DocTable) => {
    setTables((prev) => [...prev, newTable]);
    updateSettings({ showEditorPaper: true });
  };

  const toggleActiveKeyboard = useCallback(() => {
    setActiveKeyboard((prev) => (prev === 'attached' ? 'native' : 'attached'));
  }, []);

  // Quick Export JPG
  const handleExportJpgGlobal = async () => {
    const el = document.getElementById('exportable-document-canvas') ||
      document.getElementById('target-app-doc-area') ||
      document.getElementById('phone-device-body');
    if (el) {
      await exportElementAsJpg(el, `مستند_كيبورد_${activeFont.nameArabic}.jpg`);
    }
  };

  // Quick Export PDF
  const handleExportPdfGlobal = async () => {
    const el = document.getElementById('exportable-document-canvas') ||
      document.getElementById('target-app-doc-area') ||
      document.getElementById('phone-device-body');
    if (el) {
      await exportElementAsPdf(el, `مستند_كيبورد_${activeFont.nameArabic}.pdf`);
    }
  };

  return (
    <PhoneFrame
      isPhoneFrame={isPhoneFrame}
      onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
      fontFamilyName={settings.fontFamilyName}
      orientation={orientation}
      onToggleOrientation={toggleOrientation}
      onOpenFeaturesDropdown={() => setIsFeaturesDropdownOpen(true)}
      activeKeyboard={activeKeyboard}
      onToggleKeyboard={toggleActiveKeyboard}
      onOpenApkModal={() => setIsApkModalOpen(true)}
      isPaperFolded={isPaperFolded}
      onTogglePaperFold={() => setIsPaperFolded((prev) => !prev)}
    >
      {/* 
        Upper Area (Above the Keyboard):
        "وبقية النافذة العلوية للكيبورد ورقة محرر النصوص بحيث تكون الورقه قابلة للطي إلى أسفل بحيث يكون المتبقي من النافذة يعرض شاشة الهاتف الافتراضي بما يشبه وضع لوحة المفاتيح الافتراضية الخاصة بالهاتف."
      */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {!isPaperFolded ? (
          <EditorArea
            text={text}
            onChangeText={setText}
            cursorPos={cursorPos}
            onCursorChange={setCursorPos}
            settings={settings}
            activeFont={activeFont}
            images={images}
            onUpdateImages={setImages}
            tables={tables}
            onUpdateTables={setTables}
            onOpenFontsModal={() => setIsFontsModalOpen(true)}
            onOpenColorModal={() => setIsColorModalOpen(true)}
            onOpenInsertModal={handleOpenInsertModal}
            onHidePaper={() => setIsPaperFolded(true)}
            onTogglePaperFold={() => setIsPaperFolded(true)}
          />
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
            {/* Folding pull-up tab to restore the editor paper */}
            <div
              id="unfold-paper-top-pill"
              onClick={() => setIsPaperFolded(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 flex items-center justify-between shadow-xs cursor-pointer select-none transition-colors shrink-0"
              title="انقر لسحب ورقة محرر النصوص للأعلى"
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>ورقة محرر النصوص (مطوية لأسفل) — انقر هنا لسحب الورقة للأعلى</span>
              </div>
              <span className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full font-bold transition-all">
                فتح الورقة 🔼
              </span>
            </div>

            {/* Virtual Phone Interface (WhatsApp, Notes, Messages, Word, Telegram) */}
            <TargetAppViewer
              text={text}
              onChangeText={setText}
              cursorPos={cursorPos}
              onCursorChange={setCursorPos}
              settings={settings}
              activeFont={activeFont}
              images={images}
              onUpdateImages={setImages}
              tables={tables}
              onUpdateTables={setTables}
              activeTargetApp={activeTargetApp}
              onChangeTargetApp={setActiveTargetApp}
              activeKeyboard={activeKeyboard}
              onToggleKeyboard={toggleActiveKeyboard}
              onOpenInsertModal={handleOpenInsertModal}
              onOpenFontsModal={() => setIsFontsModalOpen(true)}
              onOpenColorModal={() => setIsColorModalOpen(true)}
              onExportJpg={handleExportJpgGlobal}
              onExportPdf={handleExportPdfGlobal}
            />
          </div>
        )}
      </div>

      {/* 
        Lower Area: Automatic switching between Attached Keyboard (height 6.3cm) and Native Keyboard
      */}
      {activeKeyboard === 'attached' ? (
        <Keyboard
          settings={settings}
          onUpdateSettings={updateSettings}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onSpace={handleSpace}
          onTab={handleTab}
          onArrowMove={handleArrowMove}
          onOpenFonts={() => setIsFontsModalOpen(true)}
          onOpenColors={() => setIsColorModalOpen(true)}
          onOpenTools={() => setIsToolsModalOpen(true)}
          onTogglePhoneMode={() => setIsPhoneFrame(!isPhoneFrame)}
          isPhoneFrame={isPhoneFrame}
          orientation={orientation}
          onToggleOrientation={toggleOrientation}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          onOpenInsertModal={handleOpenInsertModal}
          onOpenFeaturesDropdown={() => setIsFeaturesDropdownOpen(true)}
          onToggleNativeKeyboard={toggleActiveKeyboard}
          isPaperFolded={isPaperFolded}
          onTogglePaperFold={() => setIsPaperFolded((prev) => !prev)}
        />
      ) : (
        <NativeKeyboard
          onSwitchToAttachedKeyboard={() => setActiveKeyboard('attached')}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onSpace={handleSpace}
        />
      )}

      {/* Features Dropdown Menu (قائمة منسدلة للمزايا) */}
      <FeaturesDropdown
        isOpen={isFeaturesDropdownOpen}
        onClose={() => setIsFeaturesDropdownOpen(false)}
        onOpenFontsModal={() => {
          setIsFeaturesDropdownOpen(false);
          setIsFontsModalOpen(true);
        }}
        onOpenColorModal={() => {
          setIsFeaturesDropdownOpen(false);
          setIsColorModalOpen(true);
        }}
        onOpenInsertModal={(tab) => {
          setIsFeaturesDropdownOpen(false);
          handleOpenInsertModal(tab);
        }}
        onExportJpg={() => {
          setIsFeaturesDropdownOpen(false);
          handleExportJpgGlobal();
        }}
        onExportPdf={() => {
          setIsFeaturesDropdownOpen(false);
          handleExportPdfGlobal();
        }}
        onChangeTargetApp={(app) => {
          setActiveTargetApp(app);
          setViewMode('targetApp');
          setIsFeaturesDropdownOpen(false);
        }}
        onToggleKeyboard={() => {
          toggleActiveKeyboard();
          setIsFeaturesDropdownOpen(false);
        }}
        activeKeyboard={activeKeyboard}
        currentFontName={settings.fontFamilyName}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Insert Media Modal (صورة، جدول، شكل، رموز، إيموجي) */}
      <InsertMediaModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        activeTab={insertModalTab}
        onInsertImage={handleInsertImage}
        onInsertTable={handleInsertTable}
        onInsertText={(snippet) => handleKeyPress(snippet)}
      />

      {/* 18 Approved Fonts Modal */}
      <FontsModal
        isOpen={isFontsModalOpen}
        onClose={() => setIsFontsModalOpen(false)}
        selectedFontId={activeFont.id}
        onSelectFont={handleSelectFont}
        currentFontSize={settings.fontSize}
        onFontSizeChange={(size) => updateSettings({ fontSize: size })}
      />

      {/* Color and Typography Modal */}
      <ColorPickerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* Keyboard Tools and Quick Actions Menu */}
      <ToolsMenu
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onInsertText={(t) => handleKeyPress(t)}
        onClearText={() => {
          setText('');
          setCursorPos(0);
        }}
        onCopyAll={handleCopyAll}
        onOpenFonts={() => setIsFontsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenInsertModal={handleOpenInsertModal}
        onExportJpg={handleExportJpgGlobal}
        onExportPdf={handleExportPdfGlobal}
      />

      {/* Full Capabilities & Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* APK Build and Download / PWA Install Modal */}
      <ApkBuildModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </PhoneFrame>
  );
}
