import React, { useState } from 'react';
import { generateVideoScript } from '../services/geminiService';
import { Loader } from './Loader';
import type { VideoScriptData } from '../types';
import { useBrand } from '../contexts/BrandContext';
import { useContent } from '../contexts/ContentContext';

export const VideoScriptGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [scriptData, setScriptData] = useState<VideoScriptData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    
    const { brandProfile } = useBrand();
    const { latestContent, setLatestContent } = useContent();

    const handleSubmit = async (e: React.FormEvent, customTopic?: string) => {
        e.preventDefault();
        const currentTopic = customTopic || topic;
        if (!currentTopic.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setScriptData(null);

        try {
            const data = await generateVideoScript(currentTopic, brandProfile);
            setScriptData(data);
        } catch (e: any) {
            setError(e.message || 'Đã có lỗi xảy ra khi tạo kịch bản.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateFromAnalysis = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!latestContent) return;
        
        const newTopic = latestContent.analysis.suggestedTitle;
        setTopic(newTopic); // Pre-fill the textarea for user visibility
        handleSubmit(e as any, newTopic);
        setLatestContent(null);
    };
    
    const handleCopy = () => {
        if (!scriptData) return;
        const scriptText = `**Câu Mở đầu (Hook):**\n${scriptData.hook}\n\n**Các Cảnh:**\n${scriptData.scenes.map(s => `Cảnh ${s.scene}:\n- Lời thoại: ${s.dialogue}\n- Gợi ý hình ảnh: ${s.visualSuggestion}`).join('\n\n')}\n\n**Kêu gọi Hành động (CTA):**\n${scriptData.cta}`;
        navigator.clipboard.writeText(scriptText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Column */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200">
                {latestContent && !isLoading && (
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg shadow-md transition-all animate-fade-in">
                        <h4 className="font-bold">Nội dung có sẵn!</h4>
                        <p className="text-sm mt-1">Tạo kịch bản video từ bài phân tích về "{latestContent.sourceText.substring(0, 50)}..."?</p>
                        <button 
                            onClick={handleGenerateFromAnalysis}
                            className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Tạo kịch bản ngay
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800">Chủ đề Video</h3>
                    <p className="text-slate-600 mb-4 text-sm">Nhập một chủ đề hoặc một câu hỏi pháp lý, AI sẽ tạo ra kịch bản video ngắn 30-60 giây cho bạn.</p>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ví dụ: 3 điều cần biết khi mua đất, thủ tục ly hôn thuận tình, cách đòi nợ hợp pháp..."
                        className="w-full h-32 p-3 bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="w-full mt-4 px-4 py-3 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {isLoading ? 'Đang sáng tạo...' : 'Tạo Kịch bản'}
                    </button>
                </form>
            </div>

            {/* Output Column */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200 flex flex-col justify-center min-h-[400px]">
                {isLoading ? <Loader /> : error ? (
                     <div className="text-center">
                        <h3 className="text-xl font-semibold text-red-600">Đã xảy ra lỗi</h3>
                        <p className="text-slate-500 mt-2">{error}</p>
                    </div>
                ) : scriptData ? (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                             <h3 className="text-2xl font-bold text-blue-600 mb-4">Kịch bản Video của bạn</h3>
                             <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Câu Mở đầu (Hook):</h4>
                                <p className="p-3 bg-slate-100 rounded mt-1 text-slate-800">{scriptData.hook}</p>
                             </div>
                             <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Các Cảnh:</h4>
                                <div className="space-y-3 mt-1">
                                    {scriptData.scenes.map(scene => (
                                        <div key={scene.scene} className="p-3 bg-slate-100 rounded">
                                            <p className="font-bold text-slate-800">Cảnh {scene.scene}:</p>
                                            <p><span className="text-slate-500">Lời thoại:</span> {scene.dialogue}</p>
                                            <p><span className="text-slate-500">Gợi ý hình ảnh:</span> {scene.visualSuggestion}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                              <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Kêu gọi Hành động (CTA):</h4>
                                <p className="p-3 bg-slate-100 rounded mt-1 text-slate-800">{scriptData.cta}</p>
                             </div>
                        </div>
                        <button onClick={handleCopy} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex-shrink-0">
                            {isCopied ? 'Đã sao chép!' : 'Sao chép Kịch bản'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-slate-500">
                        <p className="text-xl">Kịch bản video của bạn sẽ xuất hiện ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
};