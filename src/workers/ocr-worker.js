// OCR Web Worker for tesseract.js menu scanning
// This worker handles image processing in the background to keep UI at 60 FPS

importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');

let worker = null;

// Initialize Tesseract worker
async function initWorker() {
  if (!worker) {
    worker = await Tesseract.createWorker('eng+ind', 1, {
      logger: m => {
        // Send progress updates to main thread
        self.postMessage({
          type: 'progress',
          progress: m.progress,
          status: m.status
        });
      }
    });
  }
  return worker;
}

// Process image for OCR
async function processImage(imageData) {
  try {
    const tesseractWorker = await initWorker();
    
    // Perform OCR
    const { data: { text, confidence } } = await tesseractWorker.recognize(imageData);
    
    // Send result back to main thread
    self.postMessage({
      type: 'result',
      text: text,
      confidence: confidence,
      timestamp: Date.now()
    });
    
  } catch (error) {
    // Send error to main thread
    self.postMessage({
      type: 'error',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

// Handle messages from main thread
self.onmessage = async function(e) {
  const { type, imageData, action } = e.data;
  
  switch (action) {
    case 'process':
      await processImage(imageData);
      break;
      
    case 'terminate':
      if (worker) {
        await worker.terminate();
        worker = null;
      }
      self.close();
      break;
      
    default:
      self.postMessage({
        type: 'error',
        error: `Unknown action: ${action}`,
        timestamp: Date.now()
      });
  }
};

// Send ready signal to main thread
self.postMessage({
  type: 'ready',
  timestamp: Date.now()
});