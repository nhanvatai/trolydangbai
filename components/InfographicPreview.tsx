import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { InfographicData, TemplateId, ColorPalette, InfographicSlide, ImageStyleId } from '../types';
import { Icon, ICON_NAMES } from './icons';
import { generateIllustrativeImage } from '../services/geminiService';
import { Loader } from './Loader';

interface InfographicPreviewProps {
  data: InfographicData;
  templateId: TemplateId;
  colorPalette: ColorPalette;
  imageStyle: ImageStyleId;
  showWatermark: boolean;
}

// Helper component for auto-resizing textareas
const AutosizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { value } = props;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return <textarea ref={textareaRef} {...props} onChange={handleChange} rows={1} />;
};

const InteractiveIcon: React.FC<{
    iconName: string;
    onChange: (iconName: string) => void;
    className: string;
    colorClassName: string;
    bgClassName: string;
}> = ({ iconName, onChange, className, colorClassName, bgClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && iconRef.current && !iconRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleIconSelect = (name: string) => {
        onChange(name);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div ref={iconRef} onClick={() => setIsOpen(prev => !prev)} className={`p-2 rounded-md cursor-pointer transition-colors hover:opacity-80 ${colorClassName} ${bgClassName === 'bg-gray-800' ? 'bg-gray-700' : 'bg-black/10'}`}>
                <Icon name={iconName} className={className} />
            </div>
            {isOpen && (
                <div ref={popoverRef} className="absolute z-20 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-slate-200 p-2 grid grid-cols-4 gap-2">
                    {ICON_NAMES.map(name => (
                        <button key={name} onClick={() => handleIconSelect(name)} className={`p-2 rounded-md hover:bg-slate-100 transition-colors ${iconName === name ? 'bg-blue-100' : ''}`}>
                            <Icon name={name} className="w-6 h-6 text-slate-700 mx-auto" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface TemplateRendererProps {
    slide: InfographicSlide;
    mainTitle: string;
    templateId: TemplateId;
    colorPalette: ColorPalette;
    slideIndex: number;
    totalSlides: number;
    onSlideTitleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSlidePointChange: (pointIndex: number, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSlideIconChange: (iconName: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerateImage: () => void;
    isGeneratingImage: boolean;
}

const SlideFooter: React.FC<{slideIndex: number, totalSlides: number, color: string}> = ({slideIndex, totalSlides, color}) => (
    <div className={`absolute bottom-4 right-4 text-xs font-semibold px-2 py-1 rounded ${color === 'text-white' ? 'bg-black/20' : 'bg-black/10'} `}>
        {slideIndex + 1} / {totalSlides}
    </div>
);


const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
    slide,
    mainTitle,
    templateId, 
    colorPalette, 
    slideIndex,
    totalSlides,
    onSlideTitleChange,
    onSlidePointChange,
    onSlideIconChange,
    onImageUpload,
    onGenerateImage,
    isGeneratingImage
}) => {
    const { title, points, image, iconSuggestion } = slide;
    const { bg, primary, secondary, text } = colorPalette;
    const uploadInputId = React.useId();
    
    const baseInputStyle = "bg-transparent border-none w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 -m-1 transition-shadow resize-none";
    
    const UploadIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    );

    const ImageUploader: React.FC<{
        className: string;
        imgClassName?: string;
    }> = ({ className, imgClassName }) => (
        <div className={`relative group bg-slate-100 overflow-hidden ${className}`}>
             {isGeneratingImage ? (
                <div className="w-full h-full bg-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="mt-2 text-sm font-medium">AI đang vẽ...</span>
                </div>
            ) : image ? (
                <>
                    <img src={`data:image/png;base64,${image}`} alt={`Minh họa cho: ${title}`} className={`w-full h-full object-cover ${imgClassName}`} />
                    <label htmlFor={uploadInputId} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-center">
                            <UploadIcon />
                            <span className="mt-2 block text-sm font-medium">Thay đổi ảnh</span>
                        </div>
                    </label>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 gap-3">
                     <button 
                        onClick={onGenerateImage} 
                        disabled={isGeneratingImage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors w-full disabled:bg-slate-400"
                     >
                        Tạo ảnh bằng AI
                     </button>
                     <label htmlFor={uploadInputId} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-300 transition-colors w-full text-center cursor-pointer">
                        Tải ảnh lên
                     </label>
                </div>
            )}
            <input id={uploadInputId} type="file" className="hidden" onChange={onImageUpload} accept="image/jpeg,image/png" />
        </div>
    );

    switch (templateId) {
        case 'modern':
            return (
                <div className={`relative w-full h-full p-8 ${bg} ${text} flex flex-col gap-4`}>
                    <div className="flex items-start justify-between gap-4">
                        <AutosizeTextarea value={title} onChange={onSlideTitleChange} className={`text-3xl font-bold ${primary} ${baseInputStyle}`} />
                        <InteractiveIcon 
                            iconName={iconSuggestion} 
                            onChange={onSlideIconChange} 
                            className="w-10 h-10" 
                            colorClassName={primary}
                            bgClassName={bg}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                        <div>
                           <ImageUploader className="w-full aspect-video rounded-lg mb-3 shadow-md" />
                        </div>
                         <div>
                            <h2 className={`text-lg font-semibold ${secondary} mb-3`}>{title}</h2>
                            <ul className="space-y-2">
                                {points.map((point, i) => (
                                    <li key={`point-${i}`} className="flex items-start gap-3">
                                        <span className={`mt-1.5 flex-shrink-0 w-3 h-3 rounded-full ${primary.replace('text-', 'bg-')}`}></span>
                                        <AutosizeTextarea value={point} onChange={(e) => onSlidePointChange(i, e)} className={`w-full text-sm ${baseInputStyle}`} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <SlideFooter slideIndex={slideIndex} totalSlides={totalSlides} color={text} />
                </div>
            );
        case 'bold':
             return (
                <div className={`relative w-full h-full p-8 ${bg} ${text} flex flex-col text-center`}>
                    <div className="flex-shrink-0">
                         <InteractiveIcon 
                            iconName={iconSuggestion} 
                            onChange={onSlideIconChange} 
                            className="w-12 h-12 mx-auto" 
                            colorClassName={primary}
                            bgClassName="bg-transparent"
                        />
                        <AutosizeTextarea value={title} onChange={onSlideTitleChange} className={`text-3xl font-extrabold tracking-tight uppercase text-center ${baseInputStyle} mt-4`} />
                        <div className={`w-20 h-1.5 ${primary.replace('text-','bg-')} mx-auto my-4`}></div>
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center min-h-0">
                        <div>
                            <ImageUploader 
                                className={`w-1/2 mx-auto aspect-square rounded-full mb-4 border-4 ${primary.replace('text-','border-')}`}
                                imgClassName="rounded-full"
                            />
                            <ul className="space-y-1 text-md mt-2">
                                {points.map((point, i) => <li key={`point-${i}`}><AutosizeTextarea value={point} onChange={(e) => onSlidePointChange(i, e)} className={`w-full text-center ${baseInputStyle}`} /></li>)}
                            </ul>
                        </div>
                    </div>
                    <SlideFooter slideIndex={slideIndex} totalSlides={totalSlides} color={text} />
                </div>
            );
        case 'minimalist':
            return (
                <div className={`relative w-full h-full p-8 ${bg} ${text} flex flex-col font-sans`}>
                    <div className={`border-b-2 ${primary.replace('text-', 'border-')} pb-4 mb-6 flex justify-between items-start`}>
                        <AutosizeTextarea 
                            value={title} 
                            onChange={onSlideTitleChange} 
                            className={`text-3xl font-bold ${primary} ${baseInputStyle} tracking-tight`} 
                        />
                        <div className="flex-shrink-0">
                             <InteractiveIcon 
                                iconName={iconSuggestion} 
                                onChange={onSlideIconChange} 
                                className="w-8 h-8" 
                                colorClassName={secondary}
                                bgClassName="bg-transparent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                        <div>
                            <ImageUploader className="w-full aspect-video rounded mb-4"/>
                        </div>
                        <div>
                            <ul className="space-y-3 pt-2">
                                {points.map((point, i) => (
                                    <li key={`point-${i}`} className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${primary.replace('text-', 'bg-')} flex-shrink-0`}></div>
                                        <AutosizeTextarea value={point} onChange={(e) => onSlidePointChange(i, e)} className={`w-full text-sm leading-relaxed ${baseInputStyle}`} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <SlideFooter slideIndex={slideIndex} totalSlides={totalSlides} color={text} />
                </div>
            );
        case 'classic':
        default:
            return (
                <div className={`relative w-full h-full p-8 ${bg} ${text} border-t-8 ${primary.replace('text-', 'border-')} flex flex-col gap-6`}>
                    <div className="flex items-center gap-4">
                        <InteractiveIcon 
                            iconName={iconSuggestion} 
                            onChange={onSlideIconChange} 
                            className="w-12 h-12" 
                            colorClassName={primary}
                            bgClassName="bg-transparent"
                        />
                        <AutosizeTextarea value={title} onChange={onSlideTitleChange} className={`text-3xl font-bold w-full ${baseInputStyle}`} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 flex-grow">
                         <ImageUploader 
                            className={`w-full md:w-1/2 aspect-square rounded-lg border ${bg === 'bg-white' ? 'border-slate-200' : 'border-gray-600'} flex-shrink-0`} 
                        />
                        <div className="flex-1 w-full">
                            <h2 className={`text-xl font-semibold ${primary} border-b ${bg === 'bg-white' ? 'border-slate-200' : 'border-gray-600'} pb-2 mb-3`}>{title}</h2>
                            <ul className="list-disc list-inside space-y-2">
                                {points.map((point, i) => <li key={`point-${i}`}><AutosizeTextarea value={point} onChange={(e) => onSlidePointChange(i, e)} className={`w-[95%] inline-block align-top ${baseInputStyle}`} /></li>)}
                            </ul>
                        </div>
                    </div>
                     <SlideFooter slideIndex={slideIndex} totalSlides={totalSlides} color={text} />
                </div>
            );
    }
};

const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}


export const InfographicPreview: React.FC<InfographicPreviewProps> = ({ data, templateId, colorPalette, imageStyle, showWatermark }) => {
  const infographicRef = useRef<HTMLDivElement>(null);
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isCopiedPost, setIsCopiedPost] = useState(false);
  const [editableData, setEditableData] = useState<InfographicData>(data);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  useEffect(() => {
    setEditableData(data);
    setCurrentSlideIndex(0);
  }, [data]);

  const handleSlideTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSlides = [...editableData.slides];
    newSlides[currentSlideIndex].title = e.target.value;
    setEditableData(prev => ({ ...prev, slides: newSlides }));
  };
  
  const handleSlidePointChange = (pointIndex: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSlides = [...editableData.slides];
    newSlides[currentSlideIndex].points[pointIndex] = e.target.value;
    setEditableData(prev => ({ ...prev, slides: newSlides }));
  };

  const handleSlideIconChange = (iconName: string) => {
    const newSlides = [...editableData.slides];
    newSlides[currentSlideIndex].iconSuggestion = iconName;
    setEditableData(prev => ({ ...prev, slides: newSlides}));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = (reader.result as string)?.split(',')[1];
        if (base64String) {
            const newSlides = [...editableData.slides];
            newSlides[currentSlideIndex].image = base64String;
            setEditableData(prev => ({ ...prev, slides: newSlides }));
        }
    };
    reader.onerror = (error) => {
        console.error("Lỗi đọc tệp:", error);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  
  const handleGenerateImageForSlide = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
        const currentSlide = editableData.slides[currentSlideIndex];
        if (!currentSlide) return;

        const prompt = currentSlide.imagePrompt || `Ảnh minh họa trừu tượng cho: ${currentSlide.title}`;
        const base64String = await generateIllustrativeImage(prompt, imageStyle);

        if (base64String) {
            const newSlides = [...editableData.slides];
            newSlides[currentSlideIndex].image = base64String;
            setEditableData(prev => ({ ...prev, slides: newSlides }));
        } else {
            throw new Error("API không trả về ảnh.");
        }
    } catch (error: any) {
        console.error("Lỗi tạo ảnh:", error);
        alert(`Không thể tạo ảnh: ${error.message || 'Lỗi không xác định.'}`);
    } finally {
        setIsGeneratingImage(false);
    }
  };


  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableData(prev => ({...prev, facebookPost: e.target.value}));
  }
  
  const handleSlideChange = (direction: 'next' | 'prev') => {
      if (direction === 'next') {
          setCurrentSlideIndex(prev => (prev + 1) % editableData.slides.length);
      } else {
          setCurrentSlideIndex(prev => (prev - 1 + editableData.slides.length) % editableData.slides.length);
      }
  }

  const handleDownload = useCallback(() => {
    if (infographicRef.current === null) {
      return;
    }
    (window as any).htmlToImage.toPng(infographicRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `infographic-phap-ly-${currentSlideIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err: Error) => {
        console.error('oops, something went wrong!', err);
      });
  }, [infographicRef, currentSlideIndex]);

  const handleDownloadAll = useCallback(async () => {
    const JSZip = (window as any).JSZip;
    if (!infographicRef.current || !JSZip) {
      alert("Không thể tải xuống. Thư viện nén tệp bị thiếu.");
      return;
    }

    setIsDownloadingAll(true);
    const zip = new JSZip();
    const originalIndex = currentSlideIndex;

    try {
      for (let i = 0; i < editableData.slides.length; i++) {
        setDownloadProgress(`Đang tạo ảnh ${i + 1}/${editableData.slides.length}...`);
        setCurrentSlideIndex(i);
        
        await new Promise(resolve => setTimeout(resolve, 100));

        if(infographicRef.current) {
            const dataUrl = await (window as any).htmlToImage.toPng(infographicRef.current, { cacheBust: true, pixelRatio: 2 });
            const blob = dataURLtoBlob(dataUrl);
            if (blob) {
                zip.file(`infographic-phap-ly-${i + 1}.png`, blob);
            }
        }
      }

      setDownloadProgress('Đang nén tệp...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'infographic-phap-ly.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Lỗi khi tải tất cả ảnh:', err);
      alert('Đã xảy ra lỗi trong quá trình tạo tệp zip.');
    } finally {
      setCurrentSlideIndex(originalIndex);
      setIsDownloadingAll(false);
      setDownloadProgress('');
    }
  }, [currentSlideIndex, editableData.slides]);
  
  const handleCopyAllContent = () => {
    const allContent = editableData.slides.map((slide, index) => 
        `Ảnh ${index + 1}: ${slide.title}\n${slide.points.map(p => `- ${p}`).join('\n')}`
    ).join('\n\n');
    const fullText = `Tiêu đề chính: ${editableData.mainTitle}\n\n${allContent}`;
    navigator.clipboard.writeText(fullText);
    setIsCopiedContent(true);
    setTimeout(() => setIsCopiedContent(false), 2000);
  };
  
  const handleCopyPost = () => {
      navigator.clipboard.writeText(editableData.facebookPost);
      setIsCopiedPost(true);
      setTimeout(() => setIsCopiedPost(false), 2000);
  }

  const resizePostTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
      handlePostChange(e);
  }

  const currentSlide = editableData.slides[currentSlideIndex];
  if (!currentSlide) return null;

  return (
    <div className="w-full flex flex-col gap-4">
        <div className="relative">
             {isDownloadingAll && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                   <Loader message={downloadProgress} />
                </div>
            )}
            <div ref={infographicRef} className="relative rounded-lg overflow-hidden w-full aspect-[1/1] sm:aspect-[4/3] max-w-full shadow-lg border border-slate-200">
                <TemplateRenderer 
                    slide={currentSlide}
                    mainTitle={editableData.mainTitle}
                    templateId={templateId} 
                    colorPalette={colorPalette}
                    slideIndex={currentSlideIndex}
                    totalSlides={editableData.slides.length}
                    onSlideTitleChange={handleSlideTitleChange}
                    onSlidePointChange={handleSlidePointChange}
                    onSlideIconChange={handleSlideIconChange}
                    onImageUpload={handleImageUpload}
                    onGenerateImage={handleGenerateImageForSlide}
                    isGeneratingImage={isGeneratingImage}
                />
                {showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-5xl md:text-7xl font-extrabold text-black/10 transform -rotate-12 select-none">
                            TrolyLexa
                        </span>
                    </div>
                )}
            </div>
             {/* Carousel Controls */}
            <button onClick={() => handleSlideChange('prev')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 rounded-full p-2 transition-all shadow-md z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => handleSlideChange('next')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 rounded-full p-2 transition-all shadow-md z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {editableData.slides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlideIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlideIndex === index ? 'bg-white ring-1 ring-slate-500' : 'bg-slate-400/80 hover:bg-slate-500/80'}`}></button>
                ))}
            </div>
        </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-400" disabled={isDownloadingAll}>
          Tải ảnh này
        </button>
        <button onClick={handleDownloadAll} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-400 min-w-[150px]" disabled={isDownloadingAll}>
            {isDownloadingAll ? 'Đang tải...' : 'Tải tất cả'}
        </button>
        <button onClick={handleCopyAllContent} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-400" disabled={isDownloadingAll}>
          {isCopiedContent ? 'Đã sao chép!' : 'Sao chép Nội dung'}
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 mt-2 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-2 text-slate-800">Bài đăng Facebook gợi ý</h3>
        <textarea
            value={editableData.facebookPost}
            onChange={resizePostTextarea}
            rows={5}
            className="w-full p-2 bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none overflow-hidden"
        />
        <button onClick={handleCopyPost} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            {isCopiedPost ? 'Đã sao chép!' : 'Sao chép Bài đăng'}
        </button>
      </div>
    </div>
  );
};