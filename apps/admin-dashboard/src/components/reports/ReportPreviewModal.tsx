import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Maximize2 } from 'lucide-react';
import { reportsApi } from '@/lib/api/reports/reports-api';
import { LoadingState } from '@/components/shared/LoadingState';

interface ReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number;
  reportDate?: string;
}

export function ReportPreviewModal({ 
  open, 
  onOpenChange, 
  customerId,
  reportDate 
}: ReportPreviewModalProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadPreview();
    }
  }, [open, customerId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.preview(customerId);
      setHtml(response.data.html);
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <LoadingState message="Generating preview..." />
        ) : (
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}