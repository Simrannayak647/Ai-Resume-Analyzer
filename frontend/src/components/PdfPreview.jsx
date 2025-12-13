import React from "react";
import { Document, Page } from "react-pdf";
import { 
  Loader, AlertCircle, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Maximize2, Minimize2 
} from "lucide-react";

function PdfPreview({
  pdfUrl,
  pageNumber,
  numPages,
  scale,
  isFullscreen,
  pdfError,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  changePage,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleFullscreen,
  setPageNumber
}) {
  return (
    <div 
      id="pdf-preview-container"
      className="relative bg-gray-900 rounded-xl border-2 border-gray-800 overflow-hidden max-h-[600px]"
    >
      {/* PDF Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className={`p-2 rounded-lg ${pageNumber <= 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-white text-sm font-medium px-2">
          Page {pageNumber} of {numPages || '--'}
        </span>
        
        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= (numPages || 1)}
          className={`p-2 rounded-lg ${pageNumber >= (numPages || 1) ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        <button
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className={`p-2 rounded-lg ${scale <= 0.5 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={zoomIn}
          disabled={scale >= 3}
          className={`p-2 rounded-lg ${scale >= 3 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetZoom}
          className="p-2 text-white hover:bg-gray-700 rounded-lg text-sm font-medium"
        >
          Reset
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 text-white hover:bg-gray-700 rounded-lg"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* PDF Document */}
      <div className="overflow-auto h-[600px] p-8 flex justify-center">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading PDF preview...</p>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-[600px] bg-red-50">
                <div className="text-center p-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-700 font-semibold">Failed to load PDF</p>
                  <p className="text-red-600 text-sm mt-2">Please try uploading the file again</p>
                </div>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>

      {/* Page Navigation Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
          {Array.from({ length: Math.min(numPages || 0, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPageNumber(pageNum)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  pageNumber === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {numPages && numPages > 5 && (
            <span className="text-gray-400 text-sm px-2">
              ... of {numPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfPreview;