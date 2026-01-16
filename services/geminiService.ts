import { GoogleGenAI, Type } from "@google/genai";
import { DailyAdvice } from "../types";

// NOTE: In a production environment, never expose API keys on the client side.
// Since this is a client-side only demo request, we rely on the injected env variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  getAdviceForCycleDay: async (
    cycleDay: number, 
    isPeriod: boolean, 
    userName: string
  ): Promise<DailyAdvice | null> => {
    
    try {
      const prompt = `
        Bạn là chuyên gia sức khỏe phụ nữ tận tâm. Người dùng tên là ${userName}.
        Hôm nay là ngày thứ ${cycleDay} của chu kỳ kinh nguyệt.
        Trạng thái: ${isPeriod ? "ĐANG CÓ KINH NGUYỆT" : "KHÔNG CÓ KINH NGUYỆT (Giai đoạn bình thường/Rụng trứng/Tiền kinh nguyệt)"}.
        
        Hãy đưa ra lời khuyên ngắn gọn, ấm áp bằng tiếng Việt.
        Yêu cầu:
        1. 2-3 hoạt động thể chất/tinh thần phù hợp.
        2. Thực đơn 3 bữa (Sáng, Trưa, Tối) món ăn Việt Nam tốt cho sức khỏe lúc này.
        3. Một câu tâm trạng/động viên (mood).
        
        Trả về JSON thuần túy theo cấu trúc Schema sau.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Ngày hiện tại (YYYY-MM-DD)" }, // Placeholder
              activities: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              menu: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                }
              },
              mood: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        // Ensure date matches request context locally if needed, but we mostly care about content
        return {
          ...data,
          date: new Date().toISOString().split('T')[0]
        } as DailyAdvice;
      }
      return null;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  }
};
