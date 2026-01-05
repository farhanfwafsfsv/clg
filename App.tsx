
import React, { useState, useEffect, useRef } from 'react';
import Camera from './components/Camera';
import ResultDisplay from './components/ResultDisplay';
import { analyzeFood } from './services/geminiService';
import { FoodAnalysisResult, FoodMetadata } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<FoodMetadata>({
    prepTime: '',
    currentTime: new Date().toLocaleString(),
    isRefrigerated: false,
    refrigerationDuration: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update current time periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setMetadata(prev => ({ ...prev, currentTime: new Date().toLocaleString() }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeFood(image, metadata);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setMetadata({
      prepTime: '',
      currentTime: new Date().toLocaleString(),
      isRefrigerated: false,
      refrigerationDuration: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-12">
      {/* Header */}
      <header className="w-full max-w-xl pt-8 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-3 shadow-lg shadow-green-200">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">FoodFresh AI</h1>
        <p className="text-gray-500 mt-2 font-medium">Professional grade spoilage detection</p>
      </header>

      {result ? (
        <ResultDisplay result={result} onReset={reset} />
      ) : (
        <div className="w-full max-w-xl space-y-6">
          {/* Image Selection */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Step 1: Provide Food Photo
            </h3>
            
            {image ? (
              <div className="relative group rounded-2xl overflow-hidden border-4 border-gray-100">
                <img src={image} alt="Food to analyze" className="w-full h-64 object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-700">Use Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-700">Upload File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </section>

          {/* Contextual Info */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Step 2: Analysis Context
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Time Prepared</label>
                  <input
                    type="datetime-local"
                    value={metadata.prepTime}
                    onChange={(e) => setMetadata(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current System Time</label>
                  <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                    {metadata.currentTime}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${metadata.isRefrigerated ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="font-bold text-gray-700">Refrigerated?</span>
                  </div>
                  <button
                    onClick={() => setMetadata(prev => ({ ...prev, isRefrigerated: !prev.isRefrigerated }))}
                    className={`w-14 h-8 rounded-full relative transition-colors ${metadata.isRefrigerated ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${metadata.isRefrigerated ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {metadata.isRefrigerated && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Refrigeration Duration (e.g., 2 days)</label>
                    <input
                      type="text"
                      placeholder="Enter duration"
                      value={metadata.refrigerationDuration}
                      onChange={(e) => setMetadata(prev => ({ ...prev, refrigerationDuration: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <button
            onClick={runAnalysis}
            disabled={!image || loading}
            className={`w-full py-5 rounded-3xl font-extrabold text-xl shadow-xl transition-all active:scale-[0.98] ${
              !image || loading 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-green-500 text-white hover:bg-green-600 shadow-green-100'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Freshness...
              </div>
            ) : "Detect Food Status"}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <Camera 
          onCapture={setImage} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {/* Footer Branding */}
      <footer className="mt-12 text-gray-400 text-xs font-semibold tracking-widest uppercase">
        Powered by Gemini 3.0 Vision AI
      </footer>
    </div>
  );
};

export default App;
