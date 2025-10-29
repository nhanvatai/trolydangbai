import React, { useState, useCallback } from 'react';
import { InputHandler } from './InputHandler';
import { InfographicPreview } from './InfographicPreview';
import { Controls } from './Controls';
import { Loader } from './Loader';
import { generateIllustrativeImage, generateInfographicContent } from '../services/geminiService';
import type { InfographicData, TemplateId, ColorPalette, TextInputObject, ImageStyleId } from '../types';
import { COLOR_PALETTES } from '../constants';
import { useBrand } from '../contexts/BrandContext';
import { useContent } from '../contexts/ContentContext';

export function InfographicGenerator() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [selectedColor, setSelectedColor] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [imageStyle, setImageStyle] = useState<ImageStyleId>('default');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  
  const { brandProfile } = useBrand();
  const { latestContent, setLatestContent } = useContent();

  const handleGenerate = useCallback(async (source: TextInputObject, numberOfImages: number, imageStyle: ImageStyleId) => {
    setIsLoading(true);
    setError(null);
    setInfographicData(null);
    setImageStyle(imageStyle);

    try {
      setLoadingMessage('Đang xử lý đầu vào...');
      const textContent = `TÓM TẮT VỤ VIỆC:\n${source.summary}\n\nPHÂN TÍCH PHÁP LÝ:\n${source.analysis}`;

      if (!textContent.trim() || source.summary.trim() === '') {
        throw new Error('Nội dung không được để trống. Vui lòng nhập hoặc tải tệp lên.');
      }
      
      setLoadingMessage(`Đang phân tích và chia nội dung theo hồ sơ thương hiệu...`);
      const baseData = await generateInfographicContent(textContent, numberOfImages, brandProfile);
      
      if (!baseData.slides || baseData.slides.length === 0) {
        throw new Error("AI không thể chia nhỏ nội dung. Vui lòng thử lại với văn bản chi tiết hơn.");
      }
      
      setLoadingMessage(`Đang tạo ${baseData.slides.length} hình ảnh minh họa...`);
      const imagePromises = baseData.slides.map(slide => generateIllustrativeImage(slide.imagePrompt, imageStyle));
      const generatedImages = await Promise.all(imagePromises);

      const finalData = {
          ...baseData,
          slides: baseData.slides.map((slide, index) => ({
              ...slide,
              image: generatedImages[index],
          })),
      };

      setInfographicData(finalData);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Đã xảy ra một lỗi không xác định.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [brandProfile]);

  const handleGenerateFromAnalysis = () => {
    if (!latestContent) return;

    const source: TextInputObject = {
      summary: latestContent.analysis.summary,
      analysis: latestContent.analysis.talkingPoints.map(tp => `* ${tp.point}:\n${tp.elaboration}`).join('\n\n')
    };
    
    // Use a default of 5 images and 'default' style for atomization
    handleGenerate(source, 5, 'default');
    
    // Consume the content so it doesn't show up again
    setLatestContent(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
        {latestContent && !isLoading && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg shadow-md transition-all animate-fade-in">
                <h4 className="font-bold">Nội dung có sẵn!</h4>
                <p className="text-sm mt-1">Bạn có muốn tạo infographic từ bài phân tích về "{latestContent.sourceText.substring(0, 50)}..." không?</p>
                <button 
                    onClick={handleGenerateFromAnalysis}
                    className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                    Tạo ngay
                </button>
            </div>
        )}
        <InputHandler onGenerate={handleGenerate} isLoading={isLoading} />
        {infographicData && !isLoading && (
          <Controls
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            showWatermark={showWatermark}
            onWatermarkToggle={setShowWatermark}
          />
        )}
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200 flex items-center justify-center min-h-[400px] lg:min-h-0">
        {isLoading ? (
          <Loader message={loadingMessage} />
        ) : error ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-600">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mt-2">{error}</p>
          </div>
        ) : infographicData ? (
          <InfographicPreview
            data={infographicData}
            templateId={selectedTemplate}
            colorPalette={selectedColor}
            imageStyle={imageStyle}
            showWatermark={showWatermark}
          />
        ) : (
          <div className="text-center text-slate-500">
            <p className="text-xl">Kết quả của bạn sẽ xuất hiện ở đây.</p>
            <p>Nhập văn bản và chọn số lượng ảnh để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}