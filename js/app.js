// 主应用逻辑

/**
 * 应用初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 绑定起卦按钮
    document.getElementById('divination-btn').addEventListener('click', handleDivination);

    // 绑定历史记录按钮
    document.getElementById('history-toggle-btn').addEventListener('click', toggleHistory);

    // 绑定事项选择快捷键
    document.getElementById('matter-select').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleDivination();
    });

    // 加载历史记录
    loadHistory();

    // 获取访问人次
    fetchVisitCount();
}

/**
 * 工具函数：格式化公历日期
 */
function formatSolarDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

/**
 * 工具函数：格式化农历日期
 */
function formatLunarDate(lunarDate, shichen) {
    const leap = lunarDate.isLeap ? '闰' : '';
    return `${lunarDate.year}年${leap}${lunarDate.month}月${lunarDate.day}日 ${shichen}时`;
}

/**
 * 工具函数：延迟函数
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 处理起卦按钮点击
 */
async function handleDivination() {
    // 验证事项选择
    const matter = document.getElementById('matter-select').value;
    if (!matter) {
        alert('请先选择您想问的事项类型');
        document.getElementById('matter-select').focus();
        return;
    }

    const btn = document.getElementById('divination-btn');
    btn.disabled = true;
    btn.textContent = '起卦中...';

    // 显示加载动画
    showLoading();

    // 模拟延迟，增加仪式感
    await sleep(500);

    // 执行起卦
    const result = performDivination();
    result.matter = matter;

    // 渲染结果
    renderResult(result);

    // 保存到历史
    saveDivinationRecord(result);

    // 隐藏加载动画
    hideLoading();

    // 恢复按钮
    btn.disabled = false;
    btn.textContent = '再次起卦';

    // 滚动到结果区域
    document.getElementById('result-section').scrollIntoView({
        behavior: 'smooth'
    });

    // 调用 AI 深度解读
    fetchAIAnalysis(result);

    // 增加访问计数
    incrementVisitCount();
}

/**
 * 显示加载动画
 */
function showLoading() {
    const btn = document.getElementById('divination-btn');
    btn.classList.add('pulse');
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
    const btn = document.getElementById('divination-btn');
    btn.classList.remove('pulse');
}

/**
 * 渲染卦象结果
 */
function renderResult(result) {
    const { solarDate, lunarDate, shichen, gua } = result;

    // 渲染时间信息
    document.getElementById('solar-date').textContent = formatSolarDate(solarDate);
    document.getElementById('lunar-date').textContent = formatLunarDate(lunarDate, shichen);

    // 渲染卦象结果
    renderGuaResult(gua);

    // 生成综合解读
    const analysis = generateAnalysis(gua);
    document.getElementById('analysis').textContent = analysis;

    // 计算并渲染吉凶判断
    const jiXiong = calculateJiXiong(gua);
    renderJiXiong(jiXiong);

    // 生成建议
    const advice = generateAdvice(gua);
    document.getElementById('advice').textContent = advice;

    // 显示结果区域
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');
}

/**
 * 渲染卦象结果（三宫）
 */
function renderGuaResult(gua) {
    const container = document.getElementById('gua-result');
    container.innerHTML = '';

    // 渲染月宫
    container.appendChild(createLiushenItem('月宫', gua.yueGong, false));

    // 渲染日宫
    container.appendChild(createLiushenItem('日宫', gua.riGong, false));

    // 渲染时宫（主卦）
    container.appendChild(createLiushenItem('时宫', gua.shiGong, true));
}

/**
 * 创建六神项元素
 */
function createLiushenItem(label, liushenName, isMain) {
    const item = document.createElement('div');
    item.className = 'liushen-item' + (isMain ? ' main' : '');

    const detail = LIUSHEN_DETAILS[liushenName];

    item.innerHTML = `
        <div class="liushen-label">${label}${isMain ? '（主卦）' : ''}</div>
        <div class="liushen-name">${liushenName}</div>
        <div class="liushen-details">
            <p><strong>五行：</strong>${detail.wuxing} | <strong>方位：</strong>${detail.direction}</p>
            <p><strong>吉凶：</strong>${detail.level}</p>
            <p><strong>含义：</strong>${detail.meanings.join('；')}</p>
        </div>
    `;

    return item;
}

/**
 * 生成综合解读
 */
function generateAnalysis(gua) {
    const { yueGong, riGong, shiGong } = gua;

    const yueDetail = LIUSHEN_DETAILS[yueGong];
    const riDetail = LIUSHEN_DETAILS[riGong];
    const shiDetail = LIUSHEN_DETAILS[shiGong];

    return `月宫${yueGong}，代表整体运势${yueDetail.meanings[0]}；` +
           `日宫${riGong}，表示近期${riDetail.meanings[0]}；` +
           `时宫${shiGong}（主卦），当下${shiDetail.meanings[0]}。`;
}

/**
 * 计算整体吉凶
 */
function calculateJiXiong(gua) {
    const levels = {
        '吉': 2,
        '小吉': 1,
        '平': 0,
        '凶': -1
    };

    const score =
        levels[LIUSHEN_DETAILS[gua.yueGong].level] +
        levels[LIUSHEN_DETAILS[gua.riGong].level] +
        levels[LIUSHEN_DETAILS[gua.shiGong].level] * 2; // 时宫权重更高

    if (score >= 4) return '大吉';
    if (score >= 2) return '吉';
    if (score >= 0) return '平';
    if (score >= -2) return '凶';
    return '大凶';
}

/**
 * 渲染吉凶判断
 */
function renderJiXiong(jiXiong) {
    const container = document.getElementById('jixiong');
    container.innerHTML = `<span class="jixiong-badge ${jiXiong}">${jiXiong}</span>`;
}

/**
 * 生成建议
 */
function generateAdvice(gua) {
    const shiDetail = LIUSHEN_DETAILS[gua.shiGong];
    const level = shiDetail.level;

    let advice = '';

    if (level === '吉') {
        advice = '当前运势良好，可以积极行动，把握机会。但也要保持谨慎，不可过于冒进。';
    } else if (level === '小吉') {
        advice = '运势小有收获，宜稳步前进。注意细节，多听取他人意见，尤其是女性长辈的建议。';
    } else if (level === '平') {
        advice = '运势平稳，不宜急进。保持耐心，做好当前的事情，等待时机成熟再行动。';
    } else if (level === '凶') {
        advice = '当前运势不佳，宜静不宜动。谨言慎行，避免冲突和冒险。可以利用这段时间反思和调整。';
    }

    return advice + `\n\n口诀：${shiDetail.poem}`;
}

/**
 * 切换历史记录显示/隐藏
 */
function toggleHistory() {
    const historyList = document.getElementById('history-list');
    const btn = document.getElementById('history-toggle-btn');

    if (historyList.classList.contains('hidden')) {
        historyList.classList.remove('hidden');
        btn.textContent = '隐藏历史记录';
        loadHistory();
    } else {
        historyList.classList.add('hidden');
        btn.textContent = '查看历史记录';
    }
}

/**
 * 加载历史记录
 */
function loadHistory() {
    const history = getHistory();
    renderHistory(history);
}

/**
 * 渲染历史记录列表
 */
function renderHistory(history) {
    const container = document.getElementById('history-list');

    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7F8C8D; padding: 20px;">暂无历史记录</p>';
        return;
    }

    container.innerHTML = '';

    history.forEach(record => {
        const item = createHistoryItem(record);
        container.appendChild(item);
    });
}

/**
 * 创建历史记录项
 */
function createHistoryItem(record) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const date = new Date(record.timestamp);
    const timeStr = formatSolarDate(date);

    item.innerHTML = `
        <div class="history-item-info">
            <div class="history-item-time">${timeStr}</div>
            <div class="history-item-result">时宫：${record.gua.shiGong}</div>
        </div>
        <button class="history-item-delete" data-id="${record.id}">删除</button>
    `;

    // 绑定删除按钮事件
    item.querySelector('.history-item-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteRecord(record.id);
    });

    return item;
}

/**
 * 处理删除记录
 */
function handleDeleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        deleteRecord(id);
        loadHistory();
    }
}

/**
 * 调用 AI 深度解读
 * @param {Object} result - 占卜结果
 */
const AI_WORKER_URL = 'https://xiaoliuren-ai.dove-justdoit.workers.dev/api/divination';
const COUNT_URL = 'https://xiaoliuren-ai.dove-justdoit.workers.dev/api/count';

/**
 * 获取并显示访问人次
 */
async function fetchVisitCount() {
    try {
        const res = await fetch(COUNT_URL);
        const data = await res.json();
        document.getElementById('count-number').textContent = data.count.toLocaleString();
    } catch (e) {
        document.getElementById('count-number').textContent = '--';
    }
}

/**
 * 增加访问计数（起卦时调用）
 */
async function incrementVisitCount() {
    try {
        await fetch(COUNT_URL, { method: 'POST' });
    } catch (e) {
        // 静默失败，不影响主流程
    }
}

async function fetchAIAnalysis(result) {
    const aiSection = document.getElementById('ai-section');
    const aiLoading = document.getElementById('ai-loading');
    const aiResult = document.getElementById('ai-result');
    const aiError = document.getElementById('ai-error');

    aiSection.style.display = 'block';
    aiLoading.style.display = 'flex';
    aiResult.style.display = 'none';
    aiError.style.display = 'none';

    try {
        const response = await fetch(AI_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gua: result.gua,
                question: result.matter,
                liushenDetails: LIUSHEN_DETAILS
            })
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/plain') || contentType.includes('text/event-stream')) {
            // 流式响应
            aiLoading.style.display = 'none';
            aiResult.style.display = 'block';
            aiResult.innerHTML = '<div class="ai-content" id="ai-content-stream"></div>';
            const streamEl = document.getElementById('ai-content-stream');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                // 用 textContent 追加原始文本，再用 marked 渲染
                streamEl.textContent = buffer;
                // 避免频繁重渲染，缓冲一些内容再更新
                if (buffer.length > 50 || done) {
                    aiResult.innerHTML = '<div class="ai-content">' + marked.parse(buffer) + '</div>';
                }
            }
        } else {
            // 非流式 JSON 响应（兼容旧版）
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            aiLoading.style.display = 'none';
            aiResult.style.display = 'block';
            aiResult.innerHTML = `<div class="ai-content">${marked.parse(data.reply)}</div>`;
        }

    } catch (err) {
        aiLoading.style.display = 'none';
        aiError.style.display = 'block';
        aiError.textContent = `AI 解读暂时不可用（${err.message}），可稍后重试或使用基础解读。`;
    }
}

