import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize2, FileText, ExternalLink } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FilePreviewer = ({ files = [], height = "500px" }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.8);

  if (!files || !files.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-color)]">
        <FileText size={48} className="text-[var(--text-muted)] mb-4" />
        <p className="text-[var(--text-muted)] font-medium">{t('common.no_data')}</p>
      </div>
    );
  }

  const currentFile = files[currentIndex];
  const fileUrl = typeof currentFile === 'string' ? currentFile : currentFile.url;
  const fileName = currentFile.name || `${t('common.file')} ${currentIndex + 1}`;
  const mimeType = typeof currentFile === 'object' ? currentFile.mimeType : null;

  const isImage = mimeType
    ? mimeType.startsWith('image/')
    : /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
  const isPdf = mimeType
    ? mimeType === 'application/pdf'
    : /\.(pdf)$/i.test(fileUrl);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setNumPages(null);
    setPageNumber(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setNumPages(null);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm group">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-white bg-[var(--surface-secondary)] rounded-lg text-primary-600 shadow-sm shrink-0">
            <FileText size={18} />
          </div>
          <div className="truncate">
            <p className="text-sm font-bold truncate text-[var(--text-primary)]">{fileName}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{currentIndex + 1} / {files.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--text-muted)] hover:text-primary-600 transition-colors"
            title={t('common.open_new_tab') || 'Open in new tab'}
          >
            <ExternalLink size={18} />
          </a>
          <a 
            href={fileUrl} 
            download 
            className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--text-muted)] hover:text-primary-600 transition-colors"
            title={t('common.download') || 'Download'}
          >
            <Download size={18} />
          </a>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="relative flex items-center justify-center bg-[var(--surface-secondary)] bg-[var(--surface-secondary)] overflow-hidden" style={{ height }}>
        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 z-10 p-2 bg-white/80 bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface)] text-[var(--text-primary)] dark:text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 z-10 p-2 bg-white/80 bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface)] text-[var(--text-primary)] dark:text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="w-full h-full flex items-center justify-center p-4">
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-w-full max-h-full object-contain rounded shadow-lg transition-transform hover:scale-[1.02]"
            />
          ) : isPdf ? (
            <div className="w-full h-full overflow-auto flex flex-col items-center">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => console.error('PDF Load Error:', err)}
                loading={<div className="p-12 text-[var(--text-muted)] font-medium italic">{t('common.loading_pdf') || 'Loading PDF...'}</div>}
                error={<div className="p-12 text-red-500 font-medium">{t('common.preview_not_available') || 'Preview not available'}</div>}
                className="shadow-xl"
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-primary-50 text-primary-600 rounded-full">
                <Maximize2 size={40} />
              </div>
              <p className="text-sm text-[var(--text-muted)]">{t('common.preview_not_available') || 'Preview not available'}</p>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">{t('common.open_file') || 'Open File'}</a>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Controls */}
      {isPdf && numPages && (
        <div className="px-4 py-2 bg-white bg-[var(--surface-secondary)] border-t border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="p-1 hover:bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] rounded disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {pageNumber} / {numPages}
            </span>
            <button 
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="p-1 hover:bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] rounded disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="text-xs font-bold w-6 h-6 flex items-center justify-center hover:bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] rounded">-</button>
            <span className="text-[10px] font-mono font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="text-xs font-bold w-6 h-6 flex items-center justify-center hover:bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] rounded">+</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreviewer;
