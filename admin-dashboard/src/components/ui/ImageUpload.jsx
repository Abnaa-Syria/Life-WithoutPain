import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveUploadUrl } from '../../utils/uploads';

const ImageUpload = ({ value, onChange, multiple = false, accept = 'image/*' }) => {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? { url: v, isUrl: true } : { ...v, preview: URL.createObjectURL(v), isUrl: false });
    }
    return typeof value === 'string' ? [{ url: value, isUrl: true }] : [{ ...value, preview: URL.createObjectURL(value), isUrl: false }];
  });

  useEffect(() => {
    return () => {
      previews.forEach(p => !p.isUrl && p.preview && URL.revokeObjectURL(p.preview));
    };
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isUrl: false
    }));
    
    if (multiple) {
      setPreviews(prev => [...prev, ...newFiles]);
      onChange([...previews.map(p => p.file || p.url), ...acceptedFiles]);
    } else {
      setPreviews(newFiles);
      onChange(acceptedFiles[0]);
    }
  }, [multiple, onChange, previews]);

  const removeFile = (index) => {
    const newPreviews = [...previews];
    const removed = newPreviews.splice(index, 1)[0];
    if (removed && !removed.isUrl && removed.preview) {
      URL.revokeObjectURL(removed.preview);
    }
    setPreviews(newPreviews);
    
    if (multiple) {
      onChange(newPreviews.map(p => p.file || p.url));
    } else {
      onChange(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: { [accept]: [] }
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer
          ${isDragActive ? 'border-[var(--primary)] bg-primary-50/80' : 'border-[var(--border-color)] hover:border-[var(--primary)]'}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
          <Upload size={24} />
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {isDragActive ? t('common.drop_here') : t('common.upload_desc')}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {t('common.upload_subdesc')}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((item, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border-color)]">
              <img 
                src={item.preview || resolveUploadUrl(item.url)} 
                alt="preview" 
                className="w-full h-full object-cover"
              />
              <button 
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
