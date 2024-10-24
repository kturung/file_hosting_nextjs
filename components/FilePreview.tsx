// components/FilePreview.tsx
import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';

interface FilePreviewProps {
  file: {
    filename: string;
    mimeType: string;
    title: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const fileUrl = `/uploaded_files/${file.filename}`;

  // Reset loading state when file changes
  useEffect(() => {
    setIsLoading(true);
  }, [file]);

  const renderPreview = () => {
    // Handle different file types
    switch (true) {
      case file.mimeType.startsWith('video/'):
        return (
          <video 
            controls 
            className="max-w-full max-h-[70vh]"
            onLoadedData={() => setIsLoading(false)}
          >
            <source src={fileUrl} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        );

      case file.mimeType.startsWith('image/'):
        return (
          <img
            src={fileUrl}
            alt={file.title}
            className="max-w-full max-h-[70vh] object-contain"
            onLoad={() => setIsLoading(false)}
          />
        );

      case file.mimeType === 'application/pdf':
        return (
          <div className="w-full h-[70vh]">
            <iframe
              src={fileUrl}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              title="PDF Preview"
            />
          </div>
        );

      default:
        // For unsupported file types (PPTX, DOC, DOCX)
        useEffect(() => {
          setIsLoading(false);
        }, []);

        return (
          <div className="text-center p-8">
            <div className="mb-4 text-gray-600">
              <svg 
                className="mx-auto h-12 w-12 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              <p>This file type cannot be previewed directly.</p>
            </div>
            <a
              href={fileUrl}
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg 
                className="h-5 w-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
              Download File
            </a>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {file.title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className={`${isLoading ? 'hidden' : 'block'}`}>
            {renderPreview()}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>File type: {file.mimeType}</p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}