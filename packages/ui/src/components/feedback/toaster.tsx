'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
import { useToast } from './use-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {variant === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
              )}
              {variant === 'destructive' && (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              )}
              {variant === 'info' && (
                <Info className="h-5 w-5 text-info mt-0.5 shrink-0" />
              )}
              {variant === 'default' && (
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              )}

              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
