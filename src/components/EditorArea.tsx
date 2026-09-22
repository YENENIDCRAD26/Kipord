import React, { useRef, useEffect, useState } from 'react';
import {
  FileText, Copy, Check, RotateCcw, Sparkles, Download, Share2, Trash2,
  Image as ImageIcon, Table as TableIcon, Smile, Shapes, Plus, FileDown,
  Loader2, EyeOff, Edit3, MoveRight, MoveLeft, Columns, Rows, AlignRight,
  AlignCenter, AlignLeft, ChevronDown
} from 'lucide-react';
import { KeyboardSettings, FontItem, DocImage, DocTable, InsertModalTab } from '../types';
import { exportElementAsJpg, exportElementAsPdf } from '../utils/exportUtils';

interface EditorAreaProps {
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
  onOpenFontsModal: () => void;
  onOpenColorModal: () => void;
  onOpenInsertModal: (tab: InsertModalTab) => void;
  onHidePaper?: () => void;
  onTogglePaperFold?: () => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
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
  onOpenFontsModal,
  onOpenColorModal,
  onOpenInsertModal,
  onHidePaper,
  onTogglePaperFold,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const documentPaperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string>('');

  // Sync cursor position from parent if changed via keyboard arrow buttons
  useEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [cursorPos]);

  const handleSelectOrChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    onCursorChange(target.selectionStart || 0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setStatusNotice('تم نسخ النص إلى الحافظة بنجاح!');
      setTimeout(() => {
        setCopied(false);
        setStatusNotice('');
      }, 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مستند_كيبورد_${activeFont.nameArabic.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJpg = async () => {
    if (!documentPaperRef.current) return;
    setIsExportingJpg(true);
    setStatusNotice('جاري إنشاء وتحميل صورة JPG عالية الدقة...');
    try {
      await exportElementAsJpg(
        documentPaperRef.current,
        `مستند_${activeFont.nameArabic.replace(/\s+/g, '_')}.jpg`
      );
      setStatusNotice('تم حفظ المستند بصيغة JPG بنجاح!');
    } catch (err) {
      console.error(err);
      setStatusNotice('حدث خطأ أثناء تصدير JPG');
    } finally {
      setIsExportingJpg(false);
      setTimeout(() => setStatusNotice(''), 3000);
    }
  };

  const handleExportPdf = async () => {
    if (!documentPaperRef.current) return;
    setIsExportingPdf(true);
    setStatusNotice('جاري إنشاء وتجهيز ملف PDF للطباعة والحفظ...');
    try {
      await exportElementAsPdf(
        documentPaperRef.current,
        `مستند_${activeFont.nameArabic.replace(/\s+/g, '_')}.pdf`
      );
      setStatusNotice('تم حفظ المستند بصيغة PDF بنجاح!');
    } catch (err) {
      console.error(err);
      setStatusNotice('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setStatusNotice(''), 3000);
    }
  };

  // Table manipulation helpers
  const handleCellChange = (tableId: string, rowIndex: number, colIndex: number, val: string) => {
    onUpdateTables(
      tables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        const newRows = tbl.rows.map((r, rIdx) => {
          if (rIdx !== rowIndex) return r;
          const newCols = [...r];
          newCols[colIndex] = val;
          return newCols;
        });
        return { ...tbl, rows: newRows };
      })
    );
  };

  const handleHeaderChange = (tableId: string, colIndex: number, val: string) => {
    onUpdateTables(
      tables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        const newHeaders = [...tbl.headers];
        newHeaders[colIndex] = val;
        return { ...tbl, headers: newHeaders };
      })
    );
  };

  const handleAddRow = (tableId: string) => {
    onUpdateTables(
      tables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        const colCount = tbl.headers.length || (tbl.rows[0] ? tbl.rows[0].length : 3);
        const newRow = Array(colCount).fill('خلية جديدة');
        return { ...tbl, rows: [...tbl.rows, newRow] };
      })
    );
  };

  const handleRemoveRow = (tableId: string, rowIndex: number) => {
    onUpdateTables(
      tables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        if (tbl.rows.length <= 1) return tbl;
        return { ...tbl, rows: tbl.rows.filter((_, idx) => idx !== rowIndex) };
      })
    );
  };

  const handleDeleteTable = (tableId: string) => {
    onUpdateTables(tables.filter((t) => t.id !== tableId));
  };

  // Image manipulation helpers
  const handleDeleteImage = (imageId: string) => {
    onUpdateImages(images.filter((img) => img.id !== imageId));
  };

  const handleChangeImageWidth = (imageId: string, delta: number) => {
    onUpdateImages(
      images.map((img) => {
        if (img.id !== imageId) return img;
        const newWidth = Math.max(30, Math.min(100, img.widthPercent + delta));
        return { ...img, widthPercent: newWidth };
      })
    );
  };

  const handleChangeImageAlign = (imageId: string, align: 'right' | 'center' | 'left') => {
    onUpdateImages(
      images.map((img) => (img.id === imageId ? { ...img, align } : img))
    );
  };

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative select-text" dir="rtl">
      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 2. MAIN DOCUMENT PAPER CANVAS (Clean Writing Canvas without Top Text or Instruction Bars) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-slate-100 flex flex-col items-center">
        <div
          ref={documentPaperRef}
          id="exportable-document-canvas"
          className="w-full max-w-[760px] min-h-[380px] bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 flex flex-col space-y-4 relative transition-all"
        >
          {/* Fold Handle at Top of Paper */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-xs text-slate-500 select-none">
            <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span>ورقة محرر النصوص</span>
            </span>
            {onTogglePaperFold && (
              <button
                id="fold-paper-down-btn"
                onClick={onTogglePaperFold}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition-all active:scale-95 border border-slate-200"
                title="طي ورقة المحرر إلى أسفل لعرض شاشة الهاتف الافتراضي"
              >
                <span>طي لأسفل (شاشة الهاتف)</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
              </button>
            )}
          </div>

          {/* INSERTED IMAGES SECTION */}
          {images.length > 0 && (
            <div className="space-y-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`flex flex-col group relative ${
                    img.align === 'right'
                      ? 'items-start text-right'
                      : img.align === 'left'
                      ? 'items-end text-left'
                      : 'items-center text-center'
                  }`}
                >
                  <div
                    className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group-hover:border-blue-300 transition-colors"
                    style={{ width: `${img.widthPercent}%` }}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-auto object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />

                    {/* Floating Controls for the Image */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                      <button
                        onClick={() => handleChangeImageWidth(img.id, -10)}
                        className="px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded font-bold"
                        title="تصغير العرض"
                      >
                        -
                      </button>
                      <span className="text-[10px] px-1 font-semibold">{img.widthPercent}%</span>
                      <button
                        onClick={() => handleChangeImageWidth(img.id, 10)}
                        className="px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded font-bold"
                        title="تكبير العرض"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          handleChangeImageAlign(
                            img.id,
                            img.align === 'right' ? 'center' : img.align === 'center' ? 'left' : 'right'
                          )
                        }
                        className="p-1 hover:bg-white/20 rounded"
                        title="تبديل المحاذاة"
                      >
                        {img.align === 'right' ? (
                          <AlignRight className="w-3 h-3" />
                        ) : img.align === 'center' ? (
                          <AlignCenter className="w-3 h-3" />
                        ) : (
                          <AlignLeft className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {img.caption && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* MAIN DOCUMENT TEXT */}
          <div className="flex-1 w-full min-h-[140px] flex flex-col">
            <textarea
              ref={textareaRef}
              id="active-editor-textarea"
              value={text}
              onChange={(e) => {
                onChangeText(e.target.value);
                onCursorChange(e.target.selectionStart || 0);
              }}
              onSelect={handleSelectOrChange}
              onClick={handleSelectOrChange}
              onKeyUp={handleSelectOrChange}
              placeholder="اكتب هنا باستخدام لوحة المفاتيح أو أدرج صورة، جدول، رموز، أو إيموجي..."
              className="w-full flex-1 resize-none focus:outline-none bg-transparent placeholder:text-slate-300 min-h-[120px]"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                color: settings.fontColor,
                fontWeight: settings.isBold ? 700 : 400,
                fontStyle: settings.isItalic ? 'italic' : 'normal',
                textDecoration: settings.isUnderline ? 'underline' : 'none',
                textAlign: settings.textAlign,
                lineHeight: 1.7,
              }}
            />
          </div>

          {/* INSERTED TABLES SECTION */}
          {tables.length > 0 && (
            <div className="space-y-6 pt-2">
              {tables.map((table) => (
                <div key={table.id} className="border border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white">
                  {/* Table Control Header */}
                  <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{table.caption || 'جدول بيانات'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddRow(table.id)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1"
                        title="إضافة صف جديد"
                      >
                        <Plus className="w-3 h-3" />
                        <span>صف</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded transition-colors"
                        title="حذف هذا الجدول"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Table Body with Inline Editable Cells */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      {table.hasHeader && (
                        <thead className="bg-emerald-600 text-white font-bold">
                          <tr>
                            {table.headers.map((hdr, cIdx) => (
                              <th key={cIdx} className="p-2 border border-emerald-700">
                                <input
                                  type="text"
                                  value={hdr}
                                  onChange={(e) => handleHeaderChange(table.id, cIdx, e.target.value)}
                                  className="w-full bg-transparent text-white font-bold text-center focus:outline-none focus:bg-emerald-700/50 rounded px-1"
                                />
                              </th>
                            ))}
                            <th className="w-8 p-1 border border-emerald-700 text-[10px]">حذف</th>
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1.5 border border-slate-200">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleCellChange(table.id, rIdx, cIdx, e.target.value)}
                                  className="w-full bg-transparent text-slate-800 text-center focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 text-xs"
                                />
                              </td>
                            ))}
                            <td className="w-8 p-1 border border-slate-200 text-center">
                              <button
                                onClick={() => handleRemoveRow(table.id, rIdx)}
                                className="text-slate-400 hover:text-rose-600"
                                title="حذف هذا الصف"
                              >
                                <Trash2 className="w-3 h-3 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Printable Document Footer Stamp */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>تم الإنشاء بواسطة لوحة مفاتيح الجوال الذكية (Samsung Note 10+)</span>
            <span>{wordsCount} كلمة • {charsCount} حرف</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span>الخط:</span>
          <span className="font-bold text-blue-700">{activeFont.nameArabic}</span>
          <span className="text-slate-400">•</span>
          <span>{images.length} صورة</span>
          <span className="text-slate-400">•</span>
          <span>{tables.length} جدول</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>جاهز للتصدير كـ JPG و PDF</span>
        </div>
      </div>
    </div>
  );
};
