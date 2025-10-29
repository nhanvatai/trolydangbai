import React, { useState } from 'react';
import { analyzeNewsArticle } from '../services/geminiService';
import { Loader } from './Loader';
import type { NewsAnalysisData } from '../types';
import { useBrand } from '../contexts/BrandContext';
import { useContent } from '../contexts/ContentContext';

export const NewsAnalyzer: React.FC = () => {
    const [article, setArticle] = useState('');
    const [analysis, setAnalysis] = useState<NewsAnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const { brandProfile } = useBrand();
    const { setLatestContent } = useContent();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!article.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setLatestContent(null); // Clear previous content on new analysis

        try {
            const data = await analyzeNewsArticle(article, brandProfile);
            setAnalysis(data);
            // Publish the result for other tools to use
            setLatestContent({ sourceText: article, analysis: data });
        } catch (e: any) {
            setError(e.message || 'Đã có lỗi xảy ra khi phân tích.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!analysis) return;
        const analysisText = `**Tiêu đề đề xuất:**\n${analysis.suggestedTitle}\n\n**Tóm tắt:**\n${analysis.summary}\n\n**Các góc nhìn phân tích:**\n${analysis.talkingPoints.map(tp => `- ${tp.point}:\n  ${tp.elaboration}`).join('\n\n')}`;
        navigator.clipboard.writeText(analysisText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Column */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800">Nội dung Phân tích</h3>
                    <p className="text-slate-600 mb-4 text-sm">Dán nội dung một bài báo, một điều luật mới, hoặc một bản án. AI sẽ tóm tắt và đề xuất các góc nhìn để bạn viết bài phân tích chuyên sâu.</p>
                    <textarea
                        value={article}
                        onChange={(e) => setArticle(e.target.value)}
                        placeholder="Dán nội dung cần phân tích vào đây..."
                        className="w-full h-64 p-3 bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !article.trim()}
                        className="w-full mt-4 px-4 py-3 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {isLoading ? 'Đang phân tích...' : 'Phân tích & Lưu lại'}
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
                ) : analysis ? (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                             <h3 className="text-2xl font-bold text-blue-600 mb-4">Kết quả Phân tích</h3>
                             <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Tiêu đề Bài viết Đề xuất:</h4>
                                <p className="p-3 bg-slate-100 rounded mt-1 text-slate-800">{analysis.suggestedTitle}</p>
                             </div>
                             <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Tóm tắt Vấn đề:</h4>
                                <p className="p-3 bg-slate-100 rounded mt-1 text-slate-800">{analysis.summary}</p>
                             </div>
                             <div className="mb-4">
                                <h4 className="font-semibold text-slate-700">Các Góc nhìn/Luận điểm:</h4>
                                <div className="space-y-3 mt-1">
                                    {analysis.talkingPoints.map((tp, index) => (
                                        <div key={index} className="p-3 bg-slate-100 rounded">
                                            <p className="font-bold text-slate-800">{tp.point}</p>
                                            <p className="text-slate-600 text-sm mt-1">{tp.elaboration}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                        <button onClick={handleCopy} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex-shrink-0">
                            {isCopied ? 'Đã sao chép!' : 'Sao chép Phân tích'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-slate-500">
                        <p className="text-xl">Kết quả phân tích sẽ xuất hiện ở đây.</p>
                        <p className="text-sm">Sau khi phân tích, bạn có thể dùng kết quả này ở các tab khác.</p>
                    </div>
                )}
            </div>
        </div>
    );
};