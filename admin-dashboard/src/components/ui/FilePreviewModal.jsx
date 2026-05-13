import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const FilePreviewModal = ({ isOpen, onClose, files = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  if (!isOpen || !files.length) return null;

  const currentFile = files[currentIndex];
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(currentFile.url || currentFile);
  const isPdf = /\.(pdf)$/i.test(currentFile.url || currentFile);
  const fileUrl = currentFile.url || currentFile;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      {/* Header */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/50 to-transparent text-white">
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
            {currentFile.name || `File ${currentIndex + 1}`}
          </span>
          <span className="text-xs opacity-60">
            {currentIndex + 1} / {files.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href={fileUrl} 
            download 
            target="_blank" 
            rel="noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Download"
          >
            <Download size={20} />
          </a>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 md:left-8 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 md:right-8 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* File Rendering */}
        <div className="max-w-full max-h-full flex flex-col items-center justify-center overflow-auto scrollbar-hide">
          {isImage ? (
            <img 
              src={fileUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
          ) : isPdf ? (
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="max-h-[80vh] overflow-auto bg-slate-100 flex justify-center p-4">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-12 text-slate-500 font-medium italic">Loading PDF...</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </Document>
              </div>
              
              {/* PDF Controls */}
              {numPages && (
                <div className="bg-white border-t p-3 flex items-center justify-between text-slate-900">
                  <div className="flex items-center gap-4">
                    <button 
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber(prev => prev - 1)}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button 
                      disabled={pageNumber >= numPages}
                      onClick={() => setPageNumber(prev => prev + 1)}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold">-</button>
                    <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold">+</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl flex flex-col items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                <Maximize2 size={48} />
              </div>
              <p className="text-slate-600 font-medium">Preview not available for this file type</p>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Download File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
