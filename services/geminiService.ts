import { GoogleGenAI, Type, Modality } from "@google/genai";
import { readFileAsB64 } from "../utils/fileProcessor";
import type { InfographicData, NewsAnalysisData, VideoScriptData, BrandProfileData, ImageStyleId } from "../types";

// Use a function to lazily initialize the AI client.
// This prevents the entire module from failing to load if the API key is missing,
// and instead makes API calls fail gracefully where they can be caught.
let aiInstance: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ API_KEY: import.meta.env.API_KEY });
    }
    return aiInstance;
}

const buildBrandPreamble = (brandProfile: BrandProfileData): string => {
    if (!brandProfile.brandVoice && !brandProfile.targetAudience && !brandProfile.customInstructions) {
        return '';
    }
    
    let preamble = "Trước khi bắt đầu, hãy tuân thủ nghiêm ngặt HỒ SƠ THƯƠNG HIỆU CÁ NHÂN của người dùng để đảm bảo nội dung phù hợp:\n";
    if (brandProfile.brandVoice) {
        preamble += `- **Giọng văn & Phong cách:** ${brandProfile.brandVoice}\n`;
    }
    if (brandProfile.targetAudience) {
        preamble += `- **Đối tượng mục tiêu:** ${brandProfile.targetAudience}\n`;
    }
    if (brandProfile.customInstructions) {
        preamble += `- **Hướng dẫn thêm:** ${brandProfile.customInstructions}\n`;
    }
    preamble += "\n---\n\n";
    return preamble;
}

const callGeminiWithSchema = async (prompt: string, schema: object) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  try {
    const jsonText = response.text.trim();
    // Gemini sometimes returns the JSON wrapped in ```json ... ```, so we need to clean it.
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    const parsedData = JSON.parse(cleanedJsonText);
    return parsedData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Phản hồi của AI không phải là JSON hợp lệ.");
  }
}

export async function generateInfographicContent(text: string, numberOfSlides: number, brandProfile: BrandProfileData): Promise<InfographicData> {
  const infographicSchema = {
    type: Type.OBJECT,
    properties: {
      mainTitle: { type: Type.STRING, description: 'Một tiêu đề chính, bao quát cho toàn bộ chuỗi infographic (tối đa 10 từ).' },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Tiêu đề cho slide này (tối đa 7 từ).' },
            points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Một mảng gồm 2-4 điểm chính, ngắn gọn cho slide này.'
            },
            imagePrompt: {
              type: Type.STRING,
              description: 'Một câu lệnh (prompt) chi tiết, giàu hình ảnh để tạo ra một hình ảnh minh họa có ý nghĩa, phù hợp với nội dung pháp lý của slide này. Prompt phải mô tả một cảnh hoặc một khái niệm trực quan, tránh các yêu cầu trừu tượng chung chung và không được chứa văn bản. Ví dụ: thay vì "biểu tượng công lý", hãy mô tả "cán cân công lý bằng đồng cổ điển đặt trên một cuốn sách luật dày, ánh sáng chiếu vào một bên cân nặng hơn".'
            },
            iconSuggestion: {
              type: Type.STRING,
              'enum': ['Gavel', 'ScalesOfJustice', 'Book', 'Document', 'Handshake'],
              description: 'Đề xuất một biểu tượng từ danh sách enum phù hợp nhất với nội dung của slide này.'
            }
          },
          required: ['title', 'points', 'imagePrompt', 'iconSuggestion']
        },
        description: `Một mảng chứa chính xác ${numberOfSlides} đối tượng slide. Các slide phải theo một trình tự logic, kể một câu chuyện từ đầu đến cuối vụ việc.`
      },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Một mảng gồm 3-5 từ khóa hoặc cụm từ pháp lý quan trọng.'
      },
      facebookPost: {
        type: Type.STRING,
        description: 'Viết một bài đăng Facebook hoàn chỉnh để giới thiệu chuỗi infographic này. Bài đăng cần có hook hấp dẫn, tóm tắt vấn đề và kết thúc bằng một câu kêu gọi hành động như "Hãy lướt qua các ảnh để tìm hiểu chi tiết nhé!". Kèm 3-5 hashtags liên quan.'
      }
    },
    required: ['mainTitle', 'slides', 'keywords', 'facebookPost']
  };

  const brandPreamble = buildBrandPreamble(brandProfile);

  const prompt = `${brandPreamble}Bạn là một trợ lý ảo pháp lý chuyên nghiệp, có nhiệm vụ chuyển đổi các văn bản phức tạp thành chuỗi infographic (carousel) cho mạng xã hội, nhắm đến đối tượng là các chuyên gia pháp lý và những người quan tâm. Phân tích kỹ lưỡng văn bản sau đây, được chia thành "TÓM TẮT VỤ VIỆC" và "PHÂN TÍCH PHÁP LÝ".
  
**Yêu cầu quan trọng:** Khi tạo nội dung cho tiêu đề và các điểm chính, hãy **ưu tiên sử dụng thuật ngữ pháp lý chính xác và chuyên ngành**. Tránh diễn đạt quá đơn giản hoặc phổ thông hóa vấn đề. Mục tiêu là thể hiện sự chuyên môn và chiều sâu kiến thức.

Nhiệm vụ của bạn là:
1.  Chia nhỏ toàn bộ nội dung thành **chính xác ${numberOfSlides} phần (slide)** một cách logic và tuần tự, kể một câu chuyện từ đầu đến cuối (ví dụ: bối cảnh -> diễn biến -> phân tích -> kết quả).
2.  Với mỗi slide, hãy tạo một tiêu đề ngắn gọn, 2-4 điểm nội dung chính, một câu lệnh (prompt) để tạo hình ảnh minh họa trừu tượng, và một gợi ý icon phù hợp.
3.  Tạo một tiêu đề chính cho toàn bộ chuỗi infographic.
4.  Viết một bài đăng Facebook hoàn chỉnh để giới thiệu chuỗi ảnh này.
5.  Cung cấp toàn bộ kết quả dưới dạng JSON theo schema đã cho.

Nội dung văn bản như sau: \n\n---\n\n${text}`;
  
  return callGeminiWithSchema(prompt, infographicSchema);
}

export async function generateVideoScript(topic: string, brandProfile: BrandProfileData): Promise<VideoScriptData> {
  const videoScriptSchema = {
    type: Type.OBJECT,
    properties: {
      hook: { type: Type.STRING, description: "Một câu mở đầu 3-5 giây thật hấp dẫn, gây tò mò hoặc gây sốc để giữ chân người xem." },
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scene: { type: Type.NUMBER, description: "Số thứ tự của cảnh." },
            dialogue: { type: Type.STRING, description: "Lời thoại ngắn gọn, trực tiếp cho cảnh này (dưới 15 giây)." },
            visualSuggestion: { type: Type.STRING, description: "Gợi ý hành động hoặc hình ảnh minh họa cho cảnh quay này." }
          },
          required: ["scene", "dialogue", "visualSuggestion"]
        },
        description: "Một mảng gồm 3-4 cảnh để tạo thành một video hoàn chỉnh dài khoảng 30-60 giây."
      },
      cta: { type: Type.STRING, description: "Một câu kêu gọi hành động ngắn gọn ở cuối video (ví dụ: 'Follow mình để biết thêm mẹo pháp lý nhé!')." }
    },
    required: ['hook', 'scenes', 'cta']
  };

  const brandPreamble = buildBrandPreamble(brandProfile);
  const prompt = `${brandPreamble}Bạn là một chuyên gia sáng tạo nội dung cho TikTok và Reels, chuyên về lĩnh vực pháp luật. Hãy tạo một kịch bản video ngắn (30-60 giây) dựa trên chủ đề sau: "${topic}". Kịch bản phải có cấu trúc rõ ràng, dễ hiểu cho người không có chuyên môn về luật. Hãy tập trung vào việc cung cấp giá trị thực tế, nhanh gọn. Cung cấp phản hồi dưới dạng JSON theo schema đã cho.`;

  return callGeminiWithSchema(prompt, videoScriptSchema);
}

export async function analyzeNewsArticle(articleText: string, brandProfile: BrandProfileData): Promise<NewsAnalysisData> {
  const newsAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      suggestedTitle: { type: Type.STRING, description: "Một tiêu đề hấp dẫn, chuyên nghiệp cho một bài phân tích trên mạng xã hội dựa trên nội dung bài báo." },
      summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn (3-4 câu) nội dung cốt lõi của bài báo/văn bản." },
      talkingPoints: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            point: { type: Type.STRING, description: "Một góc nhìn, luận điểm hoặc câu hỏi phân tích sâu sắc." },
            elaboration: { type: Type.STRING, description: "Giải thích ngắn gọn (2-3 câu) cho luận điểm/góc nhìn đó, nêu bật ý nghĩa hoặc tác động pháp lý." }
          },
          required: ["point", "elaboration"]
        },
        description: "Một mảng gồm 2-3 góc nhìn/luận điểm phân tích chính để một chuyên gia pháp lý có thể dựa vào đó để viết bài."
      }
    },
    required: ["suggestedTitle", "summary", "talkingPoints"]
  };
  
  const brandPreamble = buildBrandPreamble(brandProfile);
  const prompt = `${brandPreamble}Bạn là một chuyên gia phân tích pháp lý dày dạn kinh nghiệm. Đọc và phân tích kỹ văn bản dưới đây. Sau đó, cung cấp một bản tóm tắt và 2-3 góc nhìn/luận điểm phân tích chuyên sâu mà một luật sư có thể sử dụng để viết một bài đăng thể hiện quan điểm chuyên gia trên mạng xã hội. Mục tiêu là biến tin tức/văn bản này thành nội dung có giá trị, thể hiện được chiều sâu kiến thức. Cung cấp phản hồi dưới dạng JSON theo schema đã cho. Văn bản cần phân tích:\n\n---\n\n${articleText}`;

  return callGeminiWithSchema(prompt, newsAnalysisSchema);
}


export async function extractTextFromImage(file: File): Promise<string> {
  const { data, mimeType } = await readFileAsB64(file);
  const ai = getAiClient();

  const imagePart = {
    inlineData: {
      mimeType,
      data,
    },
  };

  const textPart = {
    text: 'Trích xuất tất cả văn bản từ hình ảnh này. Chỉ xuất ra văn bản thô, không có bình luận gì thêm.'
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
}

export async function generateIllustrativeImage(prompt: string, style: ImageStyleId): Promise<string> {
    const stylePromptMap = {
        default: 'minimalist abstract art, digital painting',
        vector: 'minimalist vector illustration, clean lines, flat colors, corporate style',
        clay: '3d claymation style, soft textures, vibrant colors, playful',
        watercolor: 'watercolor painting style, soft edges, blended colors, elegant',
    };

    const fullPrompt = `${prompt}, ${stylePromptMap[style] || stylePromptMap.default}. No text in the image.`;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: fullPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstCandidate = response.candidates?.[0];
    const inlineDataPart = firstCandidate?.content?.parts?.find(part => part.inlineData);

    if (inlineDataPart?.inlineData) {
        return inlineDataPart.inlineData.data;
    }

    console.error("Gemini image generation response was invalid:", response);
    throw new Error("Không thể tạo hình ảnh minh họa từ AI. Vui lòng thử lại.");
}
