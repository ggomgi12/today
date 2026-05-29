/**
 * Personal Dashboard (Home Base) Logic
 */

const dashboardContent = document.getElementById('dashboard-content');
const tabButtons = document.querySelectorAll('.tab-btn');
const liveClock = document.getElementById('live-clock');
const liveDate = document.getElementById('live-date');
const greeting = document.getElementById('greeting');
const langToggle = document.getElementById('lang-toggle');

let currentLang = 'ko';
let activeTab = localStorage.getItem('activeTab') || 'daily';
let selectedFiles = [];

const contentData = {
    ko: {
        greeting: "안녕하세요!",
        tabs: {
            daily: "오늘의 운세",
            imageConverter: "사진 변환",
            textTools: "글자수/맞춤법"
        },
        daily: [
            {
                title: "🔮 오늘의 사주와 운세",
                type: "sajuForm"
            }
        ],
        imageConverter: [
            {
                title: "🖼️ 사진 변환",
                type: "imageConverter"
            }
        ],
        textTools: [
            {
                title: "📝 글자수 세기 및 맞춤법",
                type: "textTools"
            }
        ]
    },
    en: {
        greeting: "Welcome Back!",
        tabs: {
            daily: "Fortune & Saju",
            imageConverter: "Image Converter",
            textTools: "Text Tools"
        },
        daily: [
            {
                title: "🔮 Today's Fortune & Saju",
                type: "sajuForm"
            }
        ],
        imageConverter: [
            {
                title: "🖼️ Image Converter",
                type: "imageConverter"
            }
        ],
        textTools: [
            {
                title: "📝 Character Count & Spell Check",
                type: "textTools"
            }
        ]
    }
};

/**
 * Update the real-time clock and date
 */
function updateDateTime() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString(currentLang === 'ko' ? 'ko-KR' : 'en-US');
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    liveDate.textContent = now.toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', dateOptions);
}

/**
 * Render the dashboard based on active tab and language
 */
function renderDashboard() {
    const data = contentData[currentLang];
    greeting.textContent = data.greeting;
    langToggle.textContent = currentLang === 'ko' ? 'English' : '한국어';
    
    tabButtons.forEach(btn => {
        const tabKey = btn.dataset.tab;
        if (data.tabs[tabKey]) {
            btn.querySelector('.label').textContent = data.tabs[tabKey];
        }
    });

    const activeContent = data[activeTab];
    dashboardContent.innerHTML = '';

    if (!activeContent) return;

    activeContent.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'dash-card';
        let innerHTML = `<h3>${card.title}</h3>`;

        switch (card.type) {
            case 'sajuForm':
                innerHTML += `
                    <div class="saju-form-content">
                        <div class="input-group">
                            <label>${currentLang === 'ko' ? '생년월일' : 'Birth Date'}</label>
                            <input type="date" id="saju-birth-date" required>
                        </div>
                        <div class="input-group">
                            <label>${currentLang === 'ko' ? '태어난 시간' : 'Birth Time'}</label>
                            <select id="saju-birth-hour">
                                <option value="-1">${currentLang === 'ko' ? '모름' : 'Unknown'}</option>
                                ${Array.from({length: 24}, (_, i) => `<option value="${i}">${i}${currentLang === 'ko' ? '시' : ':00'}</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group radio-group">
                            <label><input type="radio" name="calendar-type" value="solar" checked> ${currentLang === 'ko' ? '양력' : 'Solar'}</label>
                            <label><input type="radio" name="calendar-type" value="lunar"> ${currentLang === 'ko' ? '음력' : 'Lunar'}</label>
                            <label id="leap-month-container" style="display: none;"><input type="checkbox" id="is-leap-month"> ${currentLang === 'ko' ? '윤달' : 'Leap'}</label>
                        </div>
                        <button id="get-fortune-btn" class="primary-btn">${currentLang === 'ko' ? '운세 보기' : 'Get Fortune'}</button>
                        <div id="saju-result-container" class="saju-result-container" style="display: none;">
                            <!-- Results will be injected here -->
                        </div>
                    </div>
                `;
                break;
            case 'imageConverter':
                innerHTML += `
                    <div class="image-converter-content">
                        <div id="drop-zone" class="drop-zone">
                             <p>${currentLang === 'ko' ? '여기에 파일을 드래그 앤 드롭하거나<br>클릭하여 파일을 선택하세요.' : 'Drag & drop files here or<br>click to select files'}</p>
                             <input type="file" id="file-input" accept="image/jpeg, image/png, image/webp, image/bmp, image/gif" multiple style="display: none;">
                        </div>
                        <div id="file-header" style="display: none; justify-content: space-between; align-items: center; margin-top: 1rem;">
                            <span id="file-count" style="font-weight: 600; font-size: 0.9rem; color: var(--primary);"></span>
                            <button id="clear-all-btn" style="padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid var(--accent); background: none; color: var(--accent); font-size: 0.8rem; cursor: pointer;">${currentLang === 'ko' ? '모두 비우기' : 'Clear All'}</button>
                        </div>
                        <div id="file-list" style="margin-top: 1rem;"></div>
                        <div class="conversion-options">
                            <select id="conversion-format">
                                <optgroup label="PDF">
                                    <option value="to-pdf">이미지 → PDF (합치기)</option>
                                </optgroup>
                                <optgroup label="Image Formats">
                                    <option value="image/jpeg">→ JPEG</option>
                                    <option value="image/png">→ PNG</option>
                                    <option value="image/webp">→ WEBP</option>
                                    <option value="image/bmp">→ BMP</option>
                                </optgroup>
                            </select>
                            <button id="convert-btn">${currentLang === 'ko' ? '변환 및 다운로드' : 'Convert & Download'}</button>
                        </div>
                         <div id="conversion-status"></div>
                    </div>
                `;
                break;
            case 'textTools':
                innerHTML += `
                    <div class="text-tools-content">
                        <textarea id="text-input" placeholder="${currentLang === 'ko' ? '분석할 텍스트를 입력하세요...' : 'Enter text to analyze...'}"></textarea>
                        <div class="text-stats">
                            <div class="stat-item">
                                <span class="stat-label">${currentLang === 'ko' ? '공백 포함:' : 'Incl. spaces:'}</span>
                                <span id="char-count-all">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">${currentLang === 'ko' ? '공백 제외:' : 'Excl. spaces:'}</span>
                                <span id="char-count-no-space">0</span>
                            </div>
                        </div>
                        <div class="text-actions">
                            <button id="spell-check-btn">${currentLang === 'ko' ? '맞춤법 검사기(사람인 링크)' : 'Open Spell Checker (Saramin)'}</button>
                        </div>
                        <div id="text-tool-status"></div>
                    </div>
                `;
                break;
        }
        
        cardEl.innerHTML = innerHTML;
        dashboardContent.appendChild(cardEl);

        // Post-render setup
        if (card.type === 'sajuForm') {
            setupSajuForm();
        } else if (card.type === 'imageConverter') {
            setupImageConverter();
        } else if (card.type === 'textTools') {
            setupTextTools();
        }
    });
}

function setupSajuForm() {
    const calendarRadios = document.querySelectorAll('input[name="calendar-type"]');
    const leapContainer = document.getElementById('leap-month-container');
    const getFortuneBtn = document.getElementById('get-fortune-btn');
    const resultContainer = document.getElementById('saju-result-container');

    calendarRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            leapContainer.style.display = e.target.value === 'lunar' ? 'inline-block' : 'none';
        });
    });

    getFortuneBtn.addEventListener('click', async () => {
        const birthDate = document.getElementById('saju-birth-date').value;
        const birthHour = document.getElementById('saju-birth-hour').value;
        const isLunar = document.querySelector('input[name="calendar-type"]:checked').value === 'lunar';
        const isLeap = document.getElementById('is-leap-month').checked;

        if (!birthDate) {
            alert(currentLang === 'ko' ? '생년월일을 입력해주세요.' : 'Please enter your birth date.');
            return;
        }

        const [year, month, day] = birthDate.split('-').map(Number);

        getFortuneBtn.disabled = true;
        getFortuneBtn.textContent = currentLang === 'ko' ? '운세 분석 중...' : 'Analyzing...';
        resultContainer.style.display = 'none';

        try {
            // 1. 브라우저에서 직접 만세력 계산 (lunar-javascript)
            let lunar;
            try {
                if (isLunar) {
                    lunar = Lunar.fromYmd(year, month, day);
                } else {
                    const solar = Solar.fromYmd(year, month, day);
                    lunar = solar.getLunar();
                }
            } catch (lunarErr) {
                console.error("Lunar Library Error:", lunarErr);
                throw new Error(currentLang === 'ko' ? '만세력 계산 중 오류가 발생했습니다.' : 'Error calculating Saju.');
            }

            const hourInt = parseInt(birthHour);
            const eightChar = lunar.getEightChar();
            const sajuData = {
                year: eightChar.getYear()?.toString() || "-",
                month: eightChar.getMonth()?.toString() || "-",
                day: eightChar.getDay()?.toString() || "-",
                hour: hourInt !== -1 ? (eightChar.getTime()?.toString() || "-") : (currentLang === 'ko' ? "시주 모름" : "Unknown"),
                todayIljin: Lunar.fromDate(new Date()).getEightChar().getDay()?.toString() || "-"
            };

            // 2. Gemini API 직접 호출
            const API_KEY = "AIzaSyB2BatYaYivn0X6a38NVDXqmhAWenlIa50";
            let fortuneData;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `당신은 전문 사주풀이가입니다. 다음 사용자의 사주 정보를 바탕으로 오늘의 상세 운세와 사주 원국 풀이를 작성해 주세요.
                                사용자 사주 (간지): 년주 ${sajuData.year}, 월주 ${sajuData.month}, 일주 ${sajuData.day}, 시주 ${sajuData.hour}. 오늘의 일진: ${sajuData.todayIljin}.
                                
                                요청 사항:
                                1. 사주 원국 풀이: 각 간지(년, 월, 일, 시)가 상징하는 의미와 본인의 타고난 기질을 분석해 주세요.
                                2. 오늘의 상세 운세: 총운, 재물운, 연애운, 직업운, 건강운으로 나누어 상세히 설명해 주세요.
                                3. 행운의 추천: 옷차림과 메뉴를 추천해 주세요.

                                응답은 반드시 아래 JSON 형식으로만 해주세요:
                                {
                                    "sajuAnalysis": "사주 원국에 대한 상세 분석 내용",
                                    "fortunes": {
                                        "total": "총운 내용",
                                        "wealth": "재물운 내용",
                                        "love": "연애/대인운 내용",
                                        "job": "직업/학업운 내용",
                                        "health": "건강운 내용"
                                    },
                                    "outfit": "추천 옷차림",
                                    "menu": "추천 점심 메뉴와 이유"
                                }`
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    const errorJson = await response.json();
                    console.error("Gemini API Error Response:", errorJson);
                    throw new Error('API 호출 실패');
                }
                
                const result = await response.json();
                
                if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
                    console.error("Gemini Unexpected Response Structure:", result);
                    throw new Error('API 응답 형식 오류');
                }

                const responseText = result.candidates[0].content.parts[0].text;
                
                try {
                    const cleanedText = responseText.replace(/```json|```/g, '').trim();
                    fortuneData = JSON.parse(cleanedText);
                } catch (parseErr) {
                    console.warn("Gemini Parsing Error, trying regex:", responseText);
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        fortuneData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('데이터 해석 실패');
                    }
                }
            } catch (apiErr) {
                console.error("API or Parsing Fail:", apiErr);
                // API 실패 시 기본 데이터 사용
                fortuneData = getMockSajuData();
                fortuneData.isDemo = true;
            }

            renderSajuResult({
                saju: { ganji: [sajuData.year, sajuData.month, sajuData.day, sajuData.hour] },
                fortune: fortuneData,
                isDemo: fortuneData.isDemo || false
            });
        } catch (error) {
            console.error('Fortune Error:', error);
            // 에러 시 사용자에게 데모 데이터를 보여주되, 상황을 설명함
            renderSajuResult({
                ...getMockSajuData(),
                isDemo: true
            });
        } finally {
            getFortuneBtn.disabled = false;
            getFortuneBtn.textContent = currentLang === 'ko' ? '운세 보기' : 'Get Fortune';
        }
    });
}

function renderSajuResult(data) {
    const resultContainer = document.getElementById('saju-result-container');
    resultContainer.style.display = 'block';
    
    const { saju, fortune, isDemo } = data;
    const [y, m, d, h] = saju ? saju.ganji : ["-", "-", "-", "-"];

    resultContainer.innerHTML = `
        ${isDemo ? `<div style="padding: 10px; background: #fff5f5; border-radius: 10px; margin-bottom: 20px; font-size: 0.85rem; color: #e53e3e; text-align: center;">⚠️ AI 응답 지연으로 인해 예시 데이터가 표시됩니다. 잠시 후 다시 시도해 주세요.</div>` : ''}
        <div class="saju-main-layout">
            <div class="saju-visual-section">
                <div class="saju-eight-chars">
                    <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '시' : 'Hour'}</span><span class="ganji">${h}</span></div>
                    <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '일' : 'Day'}</span><span class="ganji">${d}</span></div>
                    <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '월' : 'Month'}</span><span class="ganji">${m}</span></div>
                    <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '년' : 'Year'}</span><span class="ganji">${y}</span></div>
                </div>
                <div class="saju-analysis-card">
                    <h4>📜 ${currentLang === 'ko' ? '사주 원국 풀이' : 'Saju Analysis'}</h4>
                    <p>${fortune.sajuAnalysis}</p>
                </div>
            </div>

            <div class="fortune-details-section">
                <h4>🔮 ${currentLang === 'ko' ? '오늘의 상세 운세' : "Today's Detailed Fortune"}</h4>
                <div class="fortune-grid">
                    <div class="fortune-item">
                        <strong>🌟 ${currentLang === 'ko' ? '총운' : 'Total'}</strong>
                        <p>${fortune.fortunes.total}</p>
                    </div>
                    <div class="fortune-item">
                        <strong>💰 ${currentLang === 'ko' ? '재물운' : 'Wealth'}</strong>
                        <p>${fortune.fortunes.wealth}</p>
                    </div>
                    <div class="fortune-item">
                        <strong>❤️ ${currentLang === 'ko' ? '연애운' : 'Love'}</strong>
                        <p>${fortune.fortunes.love}</p>
                    </div>
                    <div class="fortune-item">
                        <strong>💼 ${currentLang === 'ko' ? '직업운' : 'Job'}</strong>
                        <p>${fortune.fortunes.job}</p>
                    </div>
                    <div class="fortune-item">
                        <strong>💪 ${currentLang === 'ko' ? '건강운' : 'Health'}</strong>
                        <p>${fortune.fortunes.health}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="recommendations">
            <div class="rec-item">
                <span class="rec-icon">👕</span>
                <div class="rec-text">
                    <strong>${currentLang === 'ko' ? '행운의 코디' : 'Lucky Outfit'}</strong>
                    <p>${fortune.outfit}</p>
                </div>
            </div>
            <div class="rec-item">
                <span class="rec-icon">🍱</span>
                <div class="rec-text">
                    <strong>${currentLang === 'ko' ? '추천 메뉴' : 'Recommended Menu'}</strong>
                    <p>${fortune.menu}</p>
                </div>
            </div>
        </div>
    `;
}

function getMockSajuData() {
    return {
        sajuAnalysis: "부드럽고 유연한 기운을 타고나 대인관계가 원만하며, 주변을 포용하는 능력이 탁월합니다. 다만 가끔 우유부단해질 수 있으니 중심을 잡는 것이 중요합니다.",
        fortunes: {
            total: "오늘은 대인관계에서 긍정적인 에너지가 넘치는 날입니다. 평소 서먹했던 사람과 대화를 시도해 보세요.",
            wealth: "작은 지출이 발생할 수 있으나, 미래를 위한 투자라면 아까워하지 마세요.",
            love: "연인이나 친구와 깊은 대화를 나누기에 최적의 날입니다. 진심이 통하는 순간이 오겠네요.",
            job: "새로운 아이디어가 샘솟는 날입니다. 메모하는 습관을 들여보세요.",
            health: "가벼운 산책이 컨디션 회복에 큰 도움이 됩니다. 물을 자주 마셔주세요."
        },
        outfit: "차분한 파스텔 톤의 블루 셔츠와 베이지색 슬랙스를 매치해 보세요.",
        menu: "따뜻한 국물이 있는 쌀국수를 추천합니다. 오행 중 '수(水)'의 기운을 보강해 줄 것입니다."
    };
}


function setupNoteWidget() {
    const textarea = document.getElementById('quick-note');
    textarea.value = localStorage.getItem('base_note') || '';
    textarea.addEventListener('input', (e) => {
        localStorage.setItem('base_note', e.target.value);
    });
}

function setupImageConverter() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const convertBtn = document.getElementById('convert-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const fileHeader = document.getElementById('file-header');
    const fileCount = document.getElementById('file-count');

    const handleFiles = async (files) => {
        if (files.length > 0) {
            const newFiles = Array.from(files);
            for (const file of newFiles) {
                // Generate preview URL
                file.preview = URL.createObjectURL(file);
                selectedFiles.push(file);
            }
        }
        
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        
        const dropZoneText = dropZone.querySelector('p');
        
        if (selectedFiles.length > 0) {
            fileHeader.style.display = 'flex';
            fileCount.textContent = currentLang === 'ko' ? `선택된 파일: ${selectedFiles.length}개` : `Selected files: ${selectedFiles.length}`;
            dropZoneText.innerHTML = currentLang === 'ko' ? 
                `클릭하여 파일을 더 추가하세요.` : 
                `Click to add more files.`;
            
            selectedFiles.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'file-item';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';
                item.style.background = 'var(--bg)';
                item.style.padding = '0.75rem';
                item.style.borderRadius = '12px';
                item.style.marginBottom = '0.5rem';

                item.innerHTML = `
                    <div class="file-info" style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                        <img src="${file.preview}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                        <div class="file-details" style="display: flex; flex-direction: column; overflow: hidden;">
                            <span class="file-name" style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${file.name}</span>
                            <span class="file-size" style="font-size: 0.75rem; opacity: 0.6;">(${(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                    </div>
                    <div class="file-actions" style="display: flex; gap: 0.5rem;">
                        <button class="order-btn" onclick="moveFile(${index}, -1)" ${index === 0 ? 'disabled' : ''} style="cursor: ${index === 0 ? 'not-allowed' : 'pointer'}; opacity: ${index === 0 ? '0.3' : '1'};">↑</button>
                        <button class="order-btn" onclick="moveFile(${index}, 1)" ${index === selectedFiles.length - 1 ? 'disabled' : ''} style="cursor: ${index === selectedFiles.length - 1 ? 'not-allowed' : 'pointer'}; opacity: ${index === selectedFiles.length - 1 ? '0.3' : '1'};">↓</button>
                        <button class="remove-btn" onclick="removeFile(${index})" style="color: var(--accent); cursor: pointer; border: none; background: none; font-weight: bold; margin-left: 0.5rem;">✕</button>
                    </div>
                `;
                fileList.appendChild(item);
            });
        } else {
            fileHeader.style.display = 'none';
            dropZoneText.innerHTML = currentLang === 'ko' ? 
                '여기에 파일을 드래그 앤 드롭하거나<br>클릭하여 파일을 선택하세요.' : 
                'Drag & drop files here or<br>click to select files';
        }
    };

    // Global functions for inline handlers
    window.removeFile = (index) => {
        URL.revokeObjectURL(selectedFiles[index].preview);
        selectedFiles.splice(index, 1);
        handleFiles([]);
    };

    window.moveFile = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < selectedFiles.length) {
            const temp = selectedFiles[index];
            selectedFiles[index] = selectedFiles[newIndex];
            selectedFiles[newIndex] = temp;
            handleFiles([]);
        }
    };

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
            selectedFiles = [];
            handleFiles([]);
        });
    }

    convertBtn.addEventListener('click', handleConversion);
}

function setupTextTools() {
    const textInput = document.getElementById('text-input');
    const charCountAll = document.getElementById('char-count-all');
    const charCountNoSpace = document.getElementById('char-count-no-space');
    const spellCheckBtn = document.getElementById('spell-check-btn');

    const updateStats = () => {
        const text = textInput.value;
        charCountAll.textContent = text.length.toLocaleString();
        charCountNoSpace.textContent = text.replace(/\s/g, '').length.toLocaleString();
    };

    textInput.addEventListener('input', updateStats);

    spellCheckBtn.addEventListener('click', () => {
        const text = encodeURIComponent(textInput.value);
        // Open Korean Spell Checker (Pusan Nat'l Univ or Saramin/Incruit/etc.)
        // Using Saramin for good compatibility
        window.open(`https://www.saramin.co.kr/zf_user/tools/character-counter?content=${text}`, '_blank');
    });
}

async function handleConversion() {
    if (selectedFiles.length === 0) {
        alert(currentLang === 'ko' ? '파일을 선택해주세요.' : 'Please select files first.');
        return;
    }

    const format = document.getElementById('conversion-format').value;
    const statusEl = document.getElementById('conversion-status');
    statusEl.textContent = currentLang === 'ko' ? '변환 중...' : 'Converting...';

    try {
        if (format === 'to-pdf') {
            await convertToPdf(selectedFiles);
        } else {
            const extensionMap = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp',
                'image/bmp': 'bmp'
            };
            await convertImageFormat(selectedFiles, format, extensionMap[format]);
        }
        statusEl.textContent = currentLang === 'ko' ? '변환 완료!' : 'Conversion complete!';
    } catch (error) {
        console.error('Conversion Error:', error);
        statusEl.textContent = currentLang === 'ko' ? '오류가 발생했습니다.' : 'An error occurred.';
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function convertToPdf(files) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataURL(file);
        
        if (i > 0) doc.addPage();

        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
        });

        // Determine format for jsPDF
        let format = 'JPEG';
        if (file.type === 'image/png') format = 'PNG';
        else if (file.type === 'image/webp') format = 'WEBP';

        const imgProps = doc.getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const widthRatio = pdfWidth / imgProps.width;
        const heightRatio = pdfHeight / imgProps.height;
        const ratio = Math.min(widthRatio, heightRatio);

        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        doc.addImage(img, format, x, y, imgWidth, imgHeight);
    }
    doc.save('converted.pdf');
}

async function convertImageFormat(files, targetMimeType, targetExtension) {
    for (const file of files) {
        const dataUrl = await readFileAsDataURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Fill background for non-transparent formats
        if (targetMimeType === 'image/jpeg' || targetMimeType === 'image/bmp') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const convertedDataUrl = canvas.toDataURL(targetMimeType, 0.9);
        
        const link = document.createElement('a');
        link.href = convertedDataUrl;
        const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
        link.download = `${originalName}.${targetExtension}`;
        link.click();
    }
}

/**
 * Handle tab switching
 */
function handleTabClick(e) {
    const btn = e.currentTarget;
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    renderDashboard();
}

/**
 * Handle language toggle
 */
function toggleLanguage() {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    renderDashboard();
    updateDateTime();
}

// Event Listeners
tabButtons.forEach(btn => btn.addEventListener('click', handleTabClick));
langToggle.addEventListener('click', toggleLanguage);

// Initialize
localStorage.removeItem('activeTab'); // 이전 상태 강제 초기화
setInterval(updateDateTime, 1000);
updateDateTime();
renderDashboard();
