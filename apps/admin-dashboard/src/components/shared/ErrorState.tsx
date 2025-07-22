import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: Error | unknown;
  retry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({ error, retry, fullScreen = false }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  const containerClass = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm" 
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        </div>
        {retry && (
          <Button onClick={retry} variant="outline">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}