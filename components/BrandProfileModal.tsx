import React, { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';

interface BrandProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BrandProfileModal: React.FC<BrandProfileModalProps> = ({ isOpen, onClose }) => {
    const { brandProfile, setBrandProfile } = useBrand();
    const [localProfile, setLocalProfile] = useState(brandProfile);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalProfile(brandProfile);
    }, [brandProfile, isOpen]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        setBrandProfile(localProfile);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1500);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-profile-title"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Đóng">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 id="brand-profile-title" className="text-2xl font-bold text-slate-800 mb-2">Chiến lược gia Nội dung Ảo</h2>
                <p className="text-slate-600 mb-6">"Dạy" cho AI về phong cách của bạn. Nội dung được tạo ra sẽ mang đậm dấu ấn cá nhân và phù hợp với đối tượng mục tiêu.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="brandVoice" className="block text-sm font-medium text-slate-700 mb-1">Giọng văn & Phong cách</label>
                        <textarea
                            id="brandVoice"
                            name="brandVoice"
                            value={localProfile.brandVoice}
                            onChange={handleChange}
                            placeholder="Ví dụ: Chuyên nghiệp, sắc sảo nhưng gần gũi. Sử dụng thuật ngữ pháp lý nhưng giải thích đơn giản..."
                            className="w-full h-24 p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 mb-1">Đối tượng mục tiêu</label>
                        <textarea
                            id="targetAudience"
                            name="targetAudience"
                            value={localProfile.targetAudience}
                            onChange={handleChange}
                            placeholder="Ví dụ: Chủ doanh nghiệp nhỏ và vừa, người khởi nghiệp, người dân cần tư vấn về đất đai..."
                            className="w-full h-24 p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="customInstructions" className="block text-sm font-medium text-slate-700 mb-1">Hướng dẫn thêm (Tùy chọn)</label>
                        <textarea
                            id="customInstructions"
                            name="customInstructions"
                            value={localProfile.customInstructions}
                            onChange={handleChange}
                            placeholder="Ví dụ: Luôn kết thúc bài viết bằng một câu hỏi. Không sử dụng teencode. Nhấn mạnh vào giải pháp..."
                            className="w-full h-24 p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className={`px-6 py-2 font-bold rounded-md hover:bg-blue-700 transition-all w-28 text-center ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                        disabled={isSaved}
                    >
                        {isSaved ? 'Đã lưu!' : 'Lưu hồ sơ'}
                    </button>
                </div>
            </div>
        </div>
    );
};
