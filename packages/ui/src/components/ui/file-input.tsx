'use client';

import * as React from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from './button';

export const fileInputVariants = cva(
  'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        dropzone: 'min-h-[160px]',
        compact: 'min-h-[96px] p-4 flex-row justify-between gap-4',
      },
    },
    defaultVariants: {
      variant: 'dropzone',
    },
  }
);

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>,
    VariantProps<typeof fileInputVariants> {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
  helperText?: string;
  errorMessage?: string;
  showFileList?: boolean;
  error?: boolean;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      variant = 'dropzone',
      value = [],
      onChange,
      maxFiles,
      maxSize,
      accept,
      disabled = false,
      error = false,
      helperText,
      errorMessage,
      showFileList = true,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [localError, setLocalError] = React.useState<string | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const validateAndAddFiles = (newFiles: FileList | File[]) => {
      setLocalError(null);
      const incoming = Array.from(newFiles);
      const valid: File[] = [];

      for (const file of incoming) {
        if (maxSize && file.size > maxSize) {
          setLocalError(`File "${file.name}" melebihi ukuran maksimum (${formatBytes(maxSize)}).`);
          return;
        }
        valid.push(file);
      }

      let updated = [...value, ...valid];
      if (maxFiles && updated.length > maxFiles) {
        setLocalError(`Maksimal ${maxFiles} file yang diizinkan.`);
        updated = updated.slice(0, maxFiles);
      }

      onChange?.(updated);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndAddFiles(e.target.files);
      }
      e.target.value = '';
    };

    const removeFile = (index: number) => {
      const updated = value.filter((_, i) => i !== index);
      onChange?.(updated);
      setLocalError(null);
    };

    const activeError = errorMessage || localError;
    const isError = Boolean(error || activeError);

    return (
      <div className="w-full space-y-3">
        <div
          role="region"
          aria-label="File upload dropzone"
          tabIndex={disabled ? -1 : 0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            fileInputVariants({ variant }),
            isDragging && 'border-primary bg-primary/5 scale-[0.99]',
            isError && 'border-destructive bg-destructive/5 hover:border-destructive',
            disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
            'cursor-pointer',
            className
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={maxFiles ? maxFiles > 1 : true}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            {...props}
          />

          {variant === 'dropzone' ? (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-muted p-3 text-muted-foreground shadow-2xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary hover:underline">Klik untuk upload</span> atau drag & drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {helperText || (accept ? `Format: ${accept}` : 'Semua jenis file')}
                  {maxSize && ` · Maks: ${formatBytes(maxSize)}`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Pilih file</p>
                  <p className="text-xs text-muted-foreground">
                    {helperText || (accept ? `Format: ${accept}` : 'Upload file')}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={disabled}>
                Browse
              </Button>
            </>
          )}
        </div>

        {activeError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        {showFileList && value.length > 0 && (
          <ul className="space-y-1.5" aria-label="Uploaded files">
            {value.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-2xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({formatBytes(file.size)})
                  </span>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    aria-label={`Hapus ${file.name}`}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileInput.displayName = 'FileInput';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
