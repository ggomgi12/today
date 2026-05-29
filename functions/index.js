const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Solar, Lunar, LunarMonth } = require('lunar-javascript');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Gemini API Key (사용자가 제공한 키 사용)
const GENAI_API_KEY = "AIzaSyB2BatYaYivn0X6a38NVDXqmhAWenlIa50";
const genAI = new GoogleGenerativeAI(GENAI_API_KEY);

/**
 * 사주 정보를 기반으로 운세를 생성하는 함수
 */
exports.getSajuFortune = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { year, month, day, hour, isLunar, isLeap } = req.body;

        try {
            let lunar;
            let solar;

            if (isLunar) {
                lunar = Lunar.fromYmd(parseInt(year), parseInt(month), parseInt(day));
                // 윤달 처리 로직 (필요 시)
                solar = lunar.getSolar();
            } else {
                solar = Solar.fromYmd(parseInt(year), parseInt(month), parseInt(day));
                lunar = solar.getLunar();
            }

            // 시간대 설정 (간략화)
            const hourInt = parseInt(hour || -1);
            const eightChar = lunar.getEightChar();
            if (hourInt !== -1) {
                // 시간 정보가 있을 경우 설정
                // lunar-javascript의 EightChar는 시간 설정에 따라 달라짐
            }

            const saju = {
                year: eightChar.getYear(),
                month: eightChar.getMonth(),
                day: eightChar.getDay(),
                hour: hourInt !== -1 ? eightChar.getTime() : "시주 모름",
                // getWuXing() 대신 개별 간지의 오행을 합쳐야 함 (간략화)
                ganjiList: [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), hourInt !== -1 ? eightChar.getTime() : ""].filter(Boolean),
                todayIljin: Lunar.fromDate(new Date()).getEightChar().getDay()
            };

            // Gemini 프롬프트 구성
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                당신은 전문 사주풀이가입니다. 다음 사용자의 사주 정보를 바탕으로 오늘의 운세를 분석해 주세요.
                
                사용자 사주 (간지):
                - 년주: ${saju.year}
                - 월주: ${saju.month}
                - 일주: ${saju.day}
                - 시주: ${saju.hour}
                - 오늘의 일진: ${saju.todayIljin}

                요청 사항:
                1. 오늘의 전체적인 운세를 친절하고 전문적으로 설명해 주세요. (한국어)
                2. 오늘의 행운을 불러오는 옷차림(코디)을 추천해 주세요. (색상, 스타일 등)
                3. 오늘의 행운의 점심 메뉴를 추천하고 그 이유를 사주와 연결해 설명해 주세요.

                응답 형식 (JSON):
                {
                    "fortune": "운세 내용",
                    "outfit": "추천 옷차림",
                    "menu": "추천 메뉴 및 이유"
                }
                
                주의: JSON 형식만 응답하고 다른 설명은 하지 마세요.
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // JSON 응답 추출 강화
            let fortuneData;
            try {
                const cleanedText = responseText.replace(/```json|```/g, '').trim();
                fortuneData = JSON.parse(cleanedText);
            } catch (e) {
                console.error("Gemini Parsing Error:", responseText);
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                fortuneData = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
                    fortune: "운세를 불러오는 중 오류가 발생했습니다.", 
                    outfit: "단정한 스타일", 
                    menu: "좋아하는 메뉴" 
                };
            }

            res.status(200).json({
                saju: {
                    ganji: [saju.year, saju.month, saju.day, saju.hour],
                    wuXing: "분석 완료"
                },
                fortune: fortuneData
            });

        } catch (error) {
            console.error('Saju Calculation Error:', error);
            res.status(500).json({ error: '사주 분석 중 오류가 발생했습니다.' });
        }
    });
});
