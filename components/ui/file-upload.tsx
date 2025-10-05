import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = '.pdf',
  maxSize = 10,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (accept === '.pdf' && file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect, maxSize, validateFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload your CV/Resume
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <Button variant="outline" disabled={disabled}>
                Choose File
              </Button>
            </label>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFileRemove}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}