'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Alert,
  AlertTitle,
  AlertDescription,
  toast,
} from '@ds/ui';
import {
  Sparkles,
  UploadCloud,
  FileText,
  File as FileIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@ds/ui';
import { PageHeader } from '../../../components/page-header';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  previewUrl?: string;
}

const MAX_SIZE_MB = 2;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.type || 'unknown type'}" is not supported. Allowed: PNG, JPG, WEBP, PDF.`;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`;
  }
  return null;
}

export default function FileUploadPatternPage() {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const idRef = React.useRef(0);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: UploadFile[] = Array.from(fileList).map((file) => {
      const error = validateFile(file);
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      return {
        id: `upload_${idRef.current++}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: error ? 'error' : 'uploading',
        progress: error ? 0 : 0,
error: error ?? undefined,
        previewUrl,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate async upload with progress
    newFiles.forEach((uf) => {
      if (uf.status === 'error') {
        toast({
          variant: 'destructive',
          title: 'File rejected',
          description: uf.error,
        });
        return;
      }

      const interval = window.setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== uf.id) return f;
            const next = Math.min(100, f.progress + 15 + Math.random() * 25);
            if (next >= 100) {
              window.clearInterval(interval);
              return { ...f, progress: 100, status: 'done' };
            }
            return { ...f, progress: next, status: 'uploading' };
          })
        );
      }, 400);
    });
  };

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadsDone =
    files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="File Upload / Drag & Drop"
        description="Drag & drop zone with keyboard-accessible fallback, client-side validation (type + size), per-file upload progress, inline error feedback, and image previews."
      />

      <div className="mx-auto max-w-2xl">
        <Card className="border-border">
          <CardContent className="p-6 space-y-5">
            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload files by dragging them here or pressing Enter"
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card/40 hover:border-primary/50'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP, PDF · max {MAX_SIZE_MB} MB per file
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              aria-hidden="true"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {/* File list */}
            {files.length > 0 && (
              <ul className="space-y-3">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3"
                  >
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                          file.type.includes('pdf')
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {file.type.includes('pdf') ? (
                          <FileText className="h-5 w-5" />
                        ) : file.type.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5" />
                        ) : (
                          <FileIcon className="h-5 w-5" />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          {file.status === 'done' && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          {file.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => removeFile(file.id)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatBytes(file.size)}</span>
                        <span>·</span>
                        <Badge
                          variant={
                            file.status === 'done'
                              ? 'success'
                              : file.status === 'error'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-[10px] h-4 px-1.5"
                        >
                          {file.status === 'uploading'
                            ? `Uploading ${Math.round(file.progress)}%`
                            : file.status === 'done'
                            ? 'Uploaded'
                            : 'Rejected'}
                        </Badge>
                      </div>

                      {file.status !== 'error' && (
                        <Progress value={file.status === 'done' ? 100 : file.progress} className="h-1.5" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {uploadsDone && (
              <Alert variant="success" className="animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>All files uploaded</AlertTitle>
                <AlertDescription>
                  {files.length} file{files.length > 1 ? 's' : ''} processed successfully.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
                  setFiles([]);
                }}
              >
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Validation runs client-side: unsupported types and files over {MAX_SIZE_MB} MB are
          rejected inline with a specific error message.
        </p>
      </div>
    </div>
  );
}