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
    x: 16,
    y: -16,
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
        className="p-8 sm:p-10 group/file block rounded-2xl cursor-pointer w-full relative overflow-hidden bg-studio-surface border-2 border-dashed border-studio-border hover:border-[#8B5CF6] transition-colors shadow-pop"
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

        {/* Ambient Grid Pattern Overlay */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none opacity-30">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center relative z-20">
          <p className="font-display font-extrabold text-studio-text text-base sm:text-lg tracking-tight text-center">
            Upload Screenplay PDF
          </p>
          <p className="font-sans font-medium text-studio-muted text-xs sm:text-sm mt-1 text-center">
            Drag or drop your screenplay script here, or click to browse
          </p>

          <div className="relative w-full mt-6 max-w-xl mx-auto">
            {file ? (
              <motion.div
                layoutId="file-upload"
                className={cn(
                  'relative overflow-hidden z-40 bg-studio-surface border-2 border-studio-border flex flex-col items-start justify-start p-4 w-full mx-auto rounded-2xl shadow-pop-violet'
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border flex items-center justify-center text-[#8B5CF6] dark:text-[#A78BFA] shadow-pop-xs shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs sm:text-sm font-display font-bold text-studio-text truncate max-w-xs sm:max-w-sm"
                      >
                        {file.name}
                      </motion.p>
                      <p className="text-[11px] text-[#059669] dark:text-[#34D399] font-display font-bold mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Screenplay PDF Ready
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-full border border-studio-border text-studio-text hover:bg-[#FFE4E6] hover:text-[#E11D48] transition-all shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-3 pt-2.5 border-t border-studio-border/30 justify-between text-studio-muted font-display font-bold text-[10px]">
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
                    'relative z-40 bg-studio-surface border-2 border-studio-border flex items-center justify-center h-28 mt-2 w-full max-w-[8.5rem] mx-auto rounded-2xl shadow-pop hover:shadow-pop-lg transition-all',
                    isDragActive && 'border-[#8B5CF6] bg-[#DDD6FE]/40 dark:bg-[#8B5CF6]/20 shadow-pop-violet'
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#8B5CF6] dark:text-[#A78BFA] flex flex-col items-center text-xs font-display font-black"
                    >
                      Drop PDF here
                      <Upload className="h-5 w-5 text-[#8B5CF6] dark:text-[#A78BFA] mt-1 animate-bounce" />
                    </motion.p>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border flex items-center justify-center shadow-pop-xs">
                      <Upload className="h-6 w-6 text-[#8B5CF6] dark:text-[#A78BFA] group-hover/file:scale-110 transition-transform duration-200" />
                    </div>
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border-2 border-dashed border-[#8B5CF6] inset-0 z-30 bg-transparent flex items-center justify-center h-28 mt-2 w-full max-w-[8.5rem] mx-auto rounded-2xl"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 40;
  const rows = 11;
  return (
    <div className="flex bg-studio-muted/50 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={cn(
                'w-10 h-10 flex flex-shrink-0 rounded-[2px]',
                index % 2 === 0
                  ? 'bg-studio-border/10'
                  : 'bg-studio-border/5'
              )}
            />
          );
        })
      )}
    </div>
  );
}
