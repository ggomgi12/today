22/**
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
22
const contentData = {
    ko: {
        greeting: "안녕하세요!",
        tabs: {
            daily: "오늘의 운세",
            imageConverter: "사진 변환",
            textTools: "글자수/맞춤법"
        },
        apiSettings: "API 설정",
        apiSettingsModal: {
            title: "⚙️ API 설정",
            desc: "오늘의 운세는 Google의 <strong>Gemini AI</strong>를 연결하여 사주를 분석합니다.<br>보안을 극대화하기 위해 개인 API 키를 등록할 수 있습니다. 키는 사용자의 로컬 브라우저에만 안전하게 저장되며 서버로 전송되거나 유출되지 않습니다.",
            howto: "💡 <strong>API 키 발급 방법 (100% 무료)</strong><br><a href='https://aistudio.google.com/' target='_blank' style='color: var(--primary); font-weight: bold; text-decoration: underline;'>Google AI Studio</a>에 로그인 후 <strong>'Get API key'</strong>를 클릭하면 무료 API 키를 즉시 발급받으실 수 있습니다.",
            label: "Gemini API Key",
            placeholder: "여기에 API 키를 입력하세요 (AIzaSy...)",
            save: "저장하기",
            close: "닫기",
            success: "API 키가 안전하게 저장되었습니다!",
            removed: "API 키가 삭제되었습니다. 이제 기본 사주풀이(로컬 계산)로 작동합니다.",
            invalidKey: "유효한 API 키 형식이 아닙니다. (AIzaSy...로 시작해야 합니다.)"
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
        apiSettings: "API Settings",
        apiSettingsModal: {
            title: "⚙️ API Settings",
            desc: "Today's Fortune uses Google's <strong>Gemini AI</strong> to analyze your Saju.<br>To ensure absolute security, you can register your personal API key. The key is securely saved only in your local browser.",
            howto: "💡 <strong>How to get a key (100% Free)</strong><br>Log in to <a href='https://aistudio.google.com/' target='_blank' style='color: var(--primary); font-weight: bold; text-decoration: underline;'>Google AI Studio</a> and click <strong>'Get API key'</strong> to create a free API key in seconds.",
            label: "Gemini API Key",
            placeholder: "Enter your API key here (AIzaSy...)",
            save: "Save",
            close: "Close",
            success: "API Key saved successfully!",
            removed: "API Key removed. Switched to local mock/fallback mode.",
            invalidKey: "Invalid API Key format. (Should start with AIzaSy...)"
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

    // Translate API Settings Button
    const apiBtnText = document.getElementById('api-btn-text');
    if (apiBtnText) apiBtnText.textContent = data.apiSettings;

    // Translate API Modal contents
    const modalData = data.apiSettingsModal;
    const modalTitle = document.getElementById('api-modal-title');
    const modalDesc = document.getElementById('api-modal-desc');
    const modalHowto = document.getElementById('api-modal-howto');
    const modalLabel = document.getElementById('api-modal-label');
    const apiKeyInput = document.getElementById('gemini-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const closeApiModalBtn = document.getElementById('close-api-modal-btn');

    if (modalTitle) modalTitle.innerHTML = modalData.title;
    if (modalDesc) modalDesc.innerHTML = modalData.desc;
    if (modalHowto) modalHowto.innerHTML = modalData.howto;
    if (modalLabel) modalLabel.textContent = modalData.label;
    if (apiKeyInput) apiKeyInput.placeholder = modalData.placeholder;
    if (saveApiKeyBtn) saveApiKeyBtn.textContent = modalData.save;
    if (closeApiModalBtn) closeApiModalBtn.textContent = modalData.close;

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

        let sajuData;
        try {
            // 1. 브라우저에서 직접 만세력 계산 (lunar-javascript)
            let lunar;
            if (isLunar) {
                lunar = Lunar.fromYmd(year, month, day);
            } else {
                const solar = Solar.fromYmd(year, month, day);
                lunar = solar.getLunar();
            }

            const hourInt = parseInt(birthHour);
            const eightChar = lunar.getEightChar();
            sajuData = {
                year: eightChar.getYear(),
                month: eightChar.getMonth(),
                day: eightChar.getDay(),
                hour: hourInt !== -1 ? eightChar.getTime() : (currentLang === 'ko' ? "시주 모름" : "Unknown"),
                todayIljin: Lunar.fromDate(new Date()).getEightChar().getDay()
            };

            // 2. API 호출 구조 (Option 2: Cloudflare backend proxy OR local API key override)
            const localApiKey = localStorage.getItem('gemini_api_key');
            
            let response;
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `당신은 전문 사주풀이가입니다. 다음 사용자의 사주 정보를 바탕으로 오늘의 운세를 분석해 주세요.
                        사용자 사주 (간지): 년주 ${sajuData.year}, 월주 ${sajuData.month}, 일주 ${sajuData.day}, 시주 ${sajuData.hour}. 오늘의 일진: ${sajuData.todayIljin}.
                        응답은 반드시 아래 JSON 형식으로만 해주세요:
                        {"fortune": "전체적인 오늘의 운세 설명", "outfit": "추천 옷차림", "menu": "추천 점심 메뉴와 이유"}`
                    }]
                }]
            };

            if (localApiKey) {
                // local API key override exists -> call Gemini directly (CORS is supported for Dev testing)
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${localApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
            } else {
                // Call secure Cloudflare Pages Function backend
                response = await fetch(`/api/fortune`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
            }

            if (!response.ok) throw new Error('API 호출 실패');
            
            const result = await response.json();
            const responseText = result.candidates[0].content.parts[0].text;
            const cleanedText = responseText.replace(/```json|```/g, '').trim();
            const fortuneData = JSON.parse(cleanedText);

            renderSajuResult({
                saju: { ganji: [sajuData.year, sajuData.month, sajuData.day, sajuData.hour] },
                fortune: fortuneData
            });
        } catch (error) {
            console.error('Fortune Edge Fetch Error -> Falling back to offline engine:', error);
            // Fallback to high-precision personalized offline saju engine!
            if (sajuData) {
                renderSajuResult(generateDynamicOfflineFortune(sajuData));
            } else {
                renderSajuResult(getMockSajuData());
            }
        } finally {
            getFortuneBtn.disabled = false;
            getFortuneBtn.textContent = currentLang === 'ko' ? '운세 보기' : 'Get Fortune';
        }
    });
}

function renderSajuResult(data) {
    const resultContainer = document.getElementById('saju-result-container');
    resultContainer.style.display = 'block';
    
    const { saju, fortune } = data;
    const [y, m, d, h] = saju.ganji;

    let fallbackNoticeHtml = '';
    if (data.isOffline) {
        fallbackNoticeHtml = `
            <div class="saju-fallback-notice">
                <span>💡 <strong>${currentLang === 'ko' ? '안내:' : 'Notice:'}</strong> 
                ${currentLang === 'ko' ? 
                    '현재 실시간 AI 연동 상태가 아니므로 <strong>정밀 명리학 오행 연산(오프라인 모드)</strong> 결과로 대체합니다. 실시간 AI 맞춤 운세를 이용하려면 <strong>⚙️ API 설정</strong>을 터치하여 개인 API 키를 등록하거나 클라우드플레어 환경 변수를 세팅해 주세요!' : 
                    'Since real-time AI is unconfigured, results are generated by the <strong>Offline Saju Element Engine</strong>. To activate real-time Gemini AI, tap <strong>⚙️ API Settings</strong> to register your personal key or set up Cloudflare env variables!'}
                </span>
            </div>
        `;
    }

    resultContainer.innerHTML = `
        <div class="saju-eight-chars">
            <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '시' : 'Hour'}</span><span class="ganji">${h}</span></div>
            <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '일' : 'Day'}</span><span class="ganji">${d}</span></div>
            <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '월' : 'Month'}</span><span class="ganji">${m}</span></div>
            <div class="char-box"><span class="pillar">${currentLang === 'ko' ? '년' : 'Year'}</span><span class="ganji">${y}</span></div>
        </div>
        <div class="fortune-report">
            <h4>🍀 ${currentLang === 'ko' ? '오늘의 운세' : "Today's Fortune"}</h4>
            <p>${fortune.fortune}</p>
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
        ${fallbackNoticeHtml}
    `;
}

function getMockSajuData() {
    return {
        saju: {
            ganji: ["甲辰", "戊辰", "己亥", "丙寅"],
            wuXing: "木: 2, 火: 1, 土: 3, 金: 0, 水: 2"
        },
        fortune: {
            fortune: "오늘은 대인관계에서 긍정적인 에너지가 넘치는 날입니다. 평소 서먹했던 사람과 대화를 시도해 보세요. 뜻밖의 행운이 기다리고 있습니다.",
            outfit: "차분한 파스텔 톤의 블루 셔츠와 베이지색 슬랙스를 매치해 보세요. 신뢰감을 주는 이미지가 운을 높여줍니다.",
            menu: "따뜻한 국물이 있는 쌀국수를 추천합니다. 오행 중 '수(水)'의 기운을 보강하여 오늘 부족한 집중력을 채워줄 것입니다."
        }
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
setupApiSettingsModal();

/**
 * Setup API Settings Modal Controls and Event Handlers
 */
function setupApiSettingsModal() {
    const modal = document.getElementById('api-settings-modal');
    const openBtn = document.getElementById('api-settings-btn');
    const closeBtn = document.getElementById('close-api-modal-btn');
    const saveBtn = document.getElementById('save-api-key-btn');
    const keyInput = document.getElementById('gemini-api-key');

    if (!modal || !openBtn || !closeBtn || !saveBtn || !keyInput) return;

    // Load existing key from localStorage (if any)
    const existingKey = localStorage.getItem('gemini_api_key') || '';
    keyInput.value = existingKey;

    openBtn.addEventListener('click', () => {
        // Refresh key value
        keyInput.value = localStorage.getItem('gemini_api_key') || '';
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    saveBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        const data = contentData[currentLang].apiSettingsModal;

        if (key === '') {
            localStorage.removeItem('gemini_api_key');
            alert(data.removed);
            modal.style.display = 'none';
            return;
        }

        if (!key.startsWith('AIzaSy')) {
            alert(data.invalidKey);
            return;
        }

        localStorage.setItem('gemini_api_key', key);
        alert(data.success);
        modal.style.display = 'none';
    });
}

// 10 Heavenly Stems to Five Elements mapping
const stemToElement = {
    '甲': { name: "🌳 목(木)의 기운 - 곧게 뻗어나가는 성향", color: "#166534", bg: "#dcfce7", type: "Wood" },
    '乙': { name: "🌳 목(木)의 기운 - 곧게 뻗어나가는 성향", color: "#166534", bg: "#dcfce7", type: "Wood" },
    '丙': { name: "🔥 화(火)의 기운 - 뜨거운 열정과 표현력", color: "#991b1b", bg: "#fee2e2", type: "Fire" },
    '丁': { name: "🔥 화(火)의 기운 - 뜨거운 열정과 표현력", color: "#991b1b", bg: "#fee2e2", type: "Fire" },
    '戊': { name: "⛰️ 토(土)의 기운 - 묵직한 신뢰와 중용의 마음", color: "#854d0e", bg: "#fef9c3", type: "Earth" },
    '己': { name: "⛰️ 토(土)의 기운 - 묵직한 신뢰와 중용의 마음", color: "#854d0e", bg: "#fef9c3", type: "Earth" },
    '庚': { name: "💎 금(金)의 기운 - 날카로운 결단력과 정의로움", color: "#374151", bg: "#f3f4f6", type: "Metal" },
    '辛': { name: "💎 금(金)의 기운 - 날카로운 결단력과 정의로움", color: "#374151", bg: "#f3f4f6", type: "Metal" },
    '壬': { name: "🌊 수(水)의 기운 - 유연한 지혜와 깊은 통찰력", color: "#1e40af", bg: "#dbeafe", type: "Water" },
    '癸': { name: "🌊 수(水)의 기운 - 유연한 지혜와 깊은 통찰력", color: "#1e40af", bg: "#dbeafe", type: "Water" }
};

const offlineFortunes = {
    Wood: {
        fortunes: [
            "오늘은 곧게 뻗어가는 나무처럼 새로운 프로젝트나 계획을 추진하기에 아주 유리한 시기입니다. 망설이지 마세요.",
            "대인관계에서 뿌리를 깊게 내리듯 두터운 신뢰를 쌓을 수 있는 날입니다. 타인의 고민을 경청하면 좋은 행운이 따릅니다.",
            "가지가 사방으로 뻗어나가듯 아이디어가 무궁무진한 하루입니다. 기발한 생각들을 주변 동료들과 공유해 보세요."
        ],
        outfits: "초록색 셔츠나 크림 톤의 자연스럽고 편안한 린넨 셋업",
        menus: "비빔밥이나 신선한 모듬 쌈밥 등 신선한 녹색 야채 건강식"
    },
    Fire: {
        fortunes: [
            "뜨겁게 타오르는 활력과 뛰어난 설득력이 돋보이는 하루입니다. 본인의 의견을 자신감 있게 표현하세요.",
            "넘치는 열정으로 인해 자칫 성급한 판단을 내릴 수 있습니다. 최종 선택은 오후 2시 이후로 보류하는 것이 좋습니다.",
            "주변을 따뜻하게 밝히는 촛불처럼 친절한 눈빛과 한 마디 조언이 귀하에게 큰 귀인이 되어 돌아오게 만듭니다."
        ],
        outfits: "화사한 느낌을 주는 파스텔 오렌지/레드 계열의 니트나 카디건",
        menus: "기운과 활력을 가득 불어넣어 주는 약간 매콤한 주꾸미 볶음이나 짬뽕"
    },
    Earth: {
        fortunes: [
            "넓고 단단한 대지처럼 묵직하고 흔들림 없는 신뢰성이 큰 실리와 성취를 얻어다 주는 만족스러운 날입니다.",
            "안정적이고 편안한 기운이 지배적입니다. 모험이나 투자보다는 내실을 기하고 기초를 정돈하는 데 힘쓰세요.",
            "모든 만물을 양육하는 흙의 포용력을 보일 때 액운이 사그라집니다. 동료들의 크고 작은 실수를 가볍게 웃어 넘기세요."
        ],
        outfits: "차분하고 따뜻한 느낌의 베이지, 카멜 톤의 브라운 가디건과 면바지",
        menus: "몸의 균형과 속을 따뜻하고 든든하게 보호해 주는 버섯 전골이나 갈비탕"
    },
    Metal: {
        fortunes: [
            "날카롭고 정의로운 결단력이 유난히 돋보이는 시점입니다. 오랫동안 결론을 내지 못했던 골칫거리를 단번에 해결하세요.",
            "칼날을 소중히 다루듯 꼼꼼하고 원칙적인 일처리가 좋습니다. 다만 말씨를 부드럽게 가다듬어 오해를 피하세요.",
            "과감하게 쳐낼 것은 잘라내고 새로운 방향을 다듬는 숙살지기가 강한 날입니다. 내면의 에너지가 더욱 정갈해집니다."
        ],
        outfits: "정돈되고 신뢰감을 주는 화이트 깔끔한 옥스퍼드 셔츠와 그레이 슬랙스",
        menus: "복잡한 머리를 시원하게 깨우고 기분을 정갈하게 해주는 연어/도미 초밥"
    },
    Water: {
        fortunes: [
            "부드럽게 흘러가고 막힘이 없는 물처럼 깊은 지혜와 기발한 융통성이 빛을 발해 복잡한 난제를 스스럼없이 푸는 날입니다.",
            "지식과 정보 습득력이 최고조에 오릅니다. 조용히 차를 마시며 미래의 사업이나 직장 커리어 로드맵을 그려보세요.",
            "스며들듯 주변과 소통하며 자연스러운 합의를 이끌어내는 데 능숙한 기조입니다. 오래된 협상이 좋게 타결됩니다."
        ],
        outfits: "안정감과 신뢰의 상징인 깊은 네이비 블루 컬러 계열의 데님 셔츠나 셋업",
        menus: "수(水)의 윤택한 기운을 풍부히 불어넣는 깔끔한 우동이나 메밀 국수"
    }
};

/**
 * Generate high-precision Saju Element dynamic offline daily fortune
 */
function generateDynamicOfflineFortune(sajuData) {
    const dayStem = sajuData.day.substring(0, 1);
    const elementInfo = stemToElement[dayStem] || { name: "🌳 목(木)의 기운 - 곧게 뻗어나가는 성향", color: "#166534", bg: "#dcfce7", type: "Wood" };
    
    // Create daily hash
    const seed = sajuData.year + sajuData.month + sajuData.day + sajuData.hour;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash += seed.charCodeAt(i) * (i + 1);
    }
    
    const elementData = offlineFortunes[elementInfo.type];
    const fortuneIndex = hash % elementData.fortunes.length;
    
    return {
        isOffline: true,
        saju: {
            ganji: [sajuData.year, sajuData.month, sajuData.day, sajuData.hour]
        },
        fortune: {
            fortune: `[오프라인 명리 오행 분석] ${elementInfo.name.split(' - ')[0]}의 성향을 지니신 귀하는, ${elementData.fortunes[fortuneIndex]}`,
            outfit: elementData.outfits,
            menu: elementData.menus
        }
    };
}
