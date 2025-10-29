import React, { useState } from 'react';
import { TextInputObject, ImageStyleId } from '../types';
import { ACCEPTED_FILE_TYPES } from '../constants';
import { extractTextFromImage } from '../services/geminiService';
import { extractTextFromPdf } from '../utils/fileProcessor';


interface InputHandlerProps {
  onGenerate: (source: TextInputObject, numberOfImages: number, imageStyle: ImageStyleId) => void;
  isLoading: boolean;
}

const PaperclipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.452a1.125 1.125 0 001.59 1.591l3.456-3.554a3 3 0 000-4.242z" clipRule="evenodd" />
    </svg>
);

const IMAGE_STYLES: { id: ImageStyleId; name: string }[] = [
    { id: 'default', name: 'Trừu tượng' },
    { id: 'vector', name: 'Vector' },
    { id: 'clay', name: '3D Clay' },
    { id: 'watercolor', name: 'Màu nước' },
];


export const InputHandler: React.FC<InputHandlerProps> = ({ onGenerate, isLoading }) => {
  const [summaryText, setSummaryText] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [numberOfImages, setNumberOfImages] = useState(3);
  const [imageStyle, setImageStyle] = useState<ImageStyleId>('default');

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
        return await extractTextFromImage(file);
    }
    if (file.type === 'application/pdf') {
        return await extractTextFromPdf(file);
    }
    throw new Error('Loại tệp không được hỗ trợ.');
  };

  const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setText: React.Dispatch<React.SetStateAction<string>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setFileError(null);
      processFile(file)
          .then(text => {
              setText(prev => prev ? `${prev}\n\n${text}` : text);
          })
          .catch(err => {
              setFileError(err.message || 'Lỗi xử lý tệp.');
          })
          .finally(() => {
              setLoading(false);
              e.target.value = ''; // Reset file input to allow re-uploading the same file
          });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (summaryText.trim()) {
      onGenerate(
        { summary: summaryText, analysis: analysisText },
        numberOfImages,
        imageStyle
        );
    }
  };

  const isSubmitDisabled = isLoading || !summaryText.trim();

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="summary-text" className="block text-sm font-medium text-slate-700 mb-1">
                Tóm tắt Vụ việc (Bắt buộc)
            </label>
            <textarea
                id="summary-text"
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="Nhập bối cảnh, các sự kiện, diễn biến chính của vụ việc..."
                className="w-full h-36 p-3 bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                disabled={isLoading || isSummaryLoading}
            />
             <label htmlFor="summary-file" className={`mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors ${isLoading || isSummaryLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <PaperclipIcon className="w-4 h-4" />
                <span>{isSummaryLoading ? 'Đang xử lý tệp...' : 'Hoặc tải lên từ tệp'}</span>
            </label>
            <input id="summary-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, setSummaryText, setIsSummaryLoading)} accept={ACCEPTED_FILE_TYPES} disabled={isLoading || isSummaryLoading} />
        </div>
        <div>
             <label htmlFor="analysis-text" className="block text-sm font-medium text-slate-700 mb-1">
                Phân tích & Kết quả (Tùy chọn)
            </label>
            <textarea
                id="analysis-text"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                placeholder="Nhập các lập luận, phân tích pháp lý, các khả năng có thể xảy ra, hoặc bản án của tòa..."
                className="w-full h-28 p-3 bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                disabled={isLoading || isAnalysisLoading}
            />
            <label htmlFor="analysis-file" className={`mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors ${isLoading || isAnalysisLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <PaperclipIcon className="w-4 h-4" />
                <span>{isAnalysisLoading ? 'Đang xử lý tệp...' : 'Hoặc tải lên từ tệp'}</span>
            </label>
            <input id="analysis-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, setAnalysisText, setIsAnalysisLoading)} accept={ACCEPTED_FILE_TYPES} disabled={isLoading || isAnalysisLoading} />
        </div>
        
        <div className="space-y-6 pt-4 border-t border-slate-200">
            <div>
                <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-700 mb-2">
                    Số lượng ảnh Infographic
                </label>
                <div className="flex items-center gap-4">
                    <input
                        id="numberOfImages"
                        type="range"
                        min="3"
                        max="10"
                        value={numberOfImages}
                        onChange={(e) => setNumberOfImages(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        disabled={isLoading}
                    />
                    <span className="font-semibold text-blue-600 w-12 text-center">{numberOfImages} ảnh</span>
                </div>
            </div>
            <div>
                <label htmlFor="imageStyle" className="block text-sm font-medium text-slate-700 mb-2">
                    Phong cách ảnh minh họa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {IMAGE_STYLES.map(style => (
                        <button
                            type="button"
                            key={style.id}
                            onClick={() => setImageStyle(style.id)}
                            disabled={isLoading}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                                imageStyle === style.id
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {fileError && <p className="text-sm text-red-600 text-center">{fileError}</p>}
        
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full px-4 py-3 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isLoading ? 'Đang phân tích...' : 'Tạo Infographic'}
        </button>
      </form>
    </div>
  );
};