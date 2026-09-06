import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/utils';

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 10,
    y: -10,
    opacity: 0.95,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 20 * 1024 * 1024,
  value = null,
  onClear,
}: {
  onChange?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  value?: File | null;
  onClear?: () => void;
}) => {
  const [file, setFile] = useState<File | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFile(value || null);
  }, [value]);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      onChange && onChange(newFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept,
    maxSize,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.warn('File drop rejected:', error);
    },
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear && onClear();
  };

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-8 sm:p-10 group/file block rounded-wobbly-md cursor-pointer w-full relative overflow-hidden bg-studio-surface border-[2.5px] border-dashed border-studio-border hover:border-studio-red transition-colors shadow-sketch"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileChange(files);
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center relative z-20">
          <p className="font-display font-bold text-studio-text text-lg sm:text-xl tracking-tight text-center">
            Upload Screenplay PDF
          </p>
          <p className="font-hand font-normal text-studio-secondary text-sm sm:text-base mt-1 text-center">
            Drag or drop your screenplay script here, or click to browse
          </p>

          <div className="relative w-full mt-6 max-w-xl mx-auto">
            {file ? (
              <motion.div
                layoutId="file-upload"
                className={cn(
                  'relative overflow-hidden z-40 bg-studio-surface border-2 border-studio-border flex flex-col items-start justify-start p-4 w-full mx-auto rounded-wobbly-md shadow-sketch'
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-hand font-bold text-studio-text truncate max-w-xs sm:max-w-sm"
                      >
                        {file.name}
                      </motion.p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-hand font-bold mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Screenplay PDF Ready
                      </p>
                    </div>
                  </div>

                  {/* FIX 4: min-w-[44px] min-h-[44px] touch target */}
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly border-2 border-studio-border text-studio-text hover:bg-studio-red hover:text-white transition-all shrink-0 cursor-pointer shadow-sketch-xs"
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-3 pt-2.5 border-t border-dashed border-studio-border/30 justify-between text-studio-muted font-mono text-[11px]">
                  <span>Type: application/pdf</span>
                  <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    'relative z-40 bg-studio-surface border-2 border-studio-border flex items-center justify-center h-28 mt-2 w-full max-w-[8.5rem] mx-auto rounded-wobbly-md shadow-sketch hover:shadow-sketch-lg transition-all',
                    isDragActive && 'border-studio-red bg-red-50 dark:bg-rose-950/30'
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-studio-redText flex flex-col items-center text-xs font-hand font-bold"
                    >
                      Drop PDF here
                      <Upload className="h-5 w-5 text-studio-red mt-1 animate-bounce" />
                    </motion.p>
                  ) : (
                    <div className="w-12 h-12 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs">
                      <Upload className="h-6 w-6 text-slate-950 group-hover/file:scale-110 transition-transform duration-200" />
                    </div>
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border-2 border-dashed border-studio-red inset-0 z-30 bg-transparent flex items-center justify-center h-28 mt-2 w-full max-w-[8.5rem] mx-auto rounded-wobbly-md"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
