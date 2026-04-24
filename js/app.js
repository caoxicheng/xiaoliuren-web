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
    const historyRecord = saveDivinationRecord(result);
    if (historyRecord) {
        result.historyId = historyRecord.id;
    }

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
    const summary = buildResultSummary(result);

    // 渲染时间信息
    document.getElementById('solar-date').textContent = formatSolarDate(solarDate);
    document.getElementById('lunar-date').textContent = formatLunarDate(lunarDate, shichen);

    // 渲染结果摘要
    renderResultSummary(summary);

    // 渲染卦象结果
    renderGuaResult(gua);

    // 生成综合解读
    const analysis = generateAnalysis(gua, summary);
    document.getElementById('analysis').textContent = analysis;

    // 显示结果区域
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');
}

/**
 * 构建结果摘要数据
 */
function buildResultSummary(result) {
    const { matter, gua } = result;
    const jiXiong = calculateJiXiong(gua);
    const shiDetail = LIUSHEN_DETAILS[gua.shiGong];
    const actionGuide = getActionGuide(jiXiong, shiDetail.level);

    return {
        matter,
        jiXiong,
        mainGua: gua.shiGong,
        mainMeaning: shiDetail.meanings[0],
        guaOverview: [
            { label: '月宫', value: gua.yueGong },
            { label: '日宫', value: gua.riGong },
            { label: '时宫', value: gua.shiGong, main: true }
        ],
        summaryText: `${matter || '此事'}以${gua.shiGong}为主卦，整体呈${jiXiong}之象，当前更适合${actionGuide.summaryAction}。`,
        shouldDo: actionGuide.shouldDo,
        avoid: actionGuide.avoid
    };
}

/**
 * 渲染结果摘要
 */
function renderResultSummary(summary) {
    const container = document.getElementById('result-summary');
    const guaOverview = summary.guaOverview.map(item => `
        <div class="summary-gua-chip${item.main ? ' main' : ''}">
            <span class="summary-gua-label">${item.label}</span>
            <span class="summary-gua-value">${item.value}${item.main ? '（主卦）' : ''}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="summary-meta">
            <span class="summary-matter">${summary.matter}</span>
            <span class="jixiong-badge ${summary.jiXiong}">${summary.jiXiong}</span>
        </div>
        <div class="summary-verdict">
            <div class="summary-main-gua">
                <div class="summary-main-label">时宫（主卦）</div>
                <div class="summary-main-name">${summary.mainGua}</div>
            </div>
            <div class="summary-verdict-copy">
                <div class="summary-verdict-label">判词</div>
                <p class="summary-main-meaning">${summary.mainMeaning}</p>
                <p class="summary-headline">${summary.summaryText}</p>
            </div>
        </div>
        <div class="summary-gua-overview">
            ${guaOverview}
        </div>
        <div class="summary-actions">
            <div class="summary-action summary-action-positive">
                <div class="summary-action-label">宜做</div>
                <p>${summary.shouldDo}</p>
            </div>
            <div class="summary-action summary-action-caution">
                <div class="summary-action-label">忌做</div>
                <p>${summary.avoid}</p>
            </div>
        </div>
    `;
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
function generateAnalysis(gua, summary) {
    const { yueGong, riGong, shiGong } = gua;

    const yueDetail = LIUSHEN_DETAILS[yueGong];
    const riDetail = LIUSHEN_DETAILS[riGong];
    const shiDetail = LIUSHEN_DETAILS[shiGong];

    return `月宫${yueGong}主整体气象，显示${yueDetail.meanings[0]}；日宫${riGong}主近期变化，显示${riDetail.meanings[0]}；时宫${shiGong}为主卦，直接落在${shiDetail.meanings[0]}。

因此这次判断以${summary.mainGua}的${shiDetail.level}性质为核心，再结合月宫和日宫的走势，形成“${summary.jiXiong}”的整体倾向。

进一步看，当前更适合${summary.shouldDo}；若操之过急，则容易落入“${summary.avoid}”的反面情形。

口诀提示：${shiDetail.poem.replace(/\n/g, ' ')}`;
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
 * 生成摘要层行动建议
 */
function getActionGuide(jiXiong, mainLevel) {
    if (jiXiong === '大吉' || jiXiong === '吉') {
        return {
            summaryAction: '顺势推进',
            shouldDo: '顺着当前节奏推进最关键的一步，把握已经出现的机会',
            avoid: '贪快贪多、轻视细节，或因为顺利而贸然加码'
        };
    }

    if (jiXiong === '平' || mainLevel === '平') {
        return {
            summaryAction: '稳住节奏',
            shouldDo: '先把手头事项理顺，按部就班推进，给结果一些发酵时间',
            avoid: '仓促做决定、频繁变更方向，或在信息不足时强行求结果'
        };
    }

    return {
        summaryAction: '以守为主',
        shouldDo: '先观察局势、收缩动作，把风险控制和情绪稳定放在前面',
        avoid: '争强好胜、带情绪行动，或在压力下继续冒进'
    };
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

    const viewModel = buildHistoryViewModel(record);

    item.innerHTML = `
        <div class="history-item-toolbar">
            <button class="history-item-delete" data-id="${record.id}">删除</button>
        </div>
        <details class="history-record">
            <summary class="history-item-summary">
                <div class="history-item-info">
                    <div class="history-item-time">${viewModel.timeText}</div>
                    <div class="history-item-meta">
                        <span class="history-item-matter">${viewModel.matter}</span>
                        <span class="history-item-result">时宫：${viewModel.mainGua}</span>
                        <span class="jixiong-badge ${viewModel.jiXiong}">${viewModel.jiXiong}</span>
                    </div>
                </div>
                <span class="history-item-expand">展开详情</span>
            </summary>
            <div class="history-item-detail">
                ${renderHistoryDetail(viewModel)}
            </div>
        </details>
    `;

    // 绑定删除按钮事件
    item.querySelector('.history-item-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteRecord(record.id);
    });

    return item;
}

function buildHistoryViewModel(record) {
    const safeMatter = record.matter || '未记录事项';
    const hasGua = Boolean(record.gua);
    const summary = hasGua ? buildResultSummary(record) : null;
    const analysis = hasGua ? generateAnalysis(record.gua, summary) : '该条历史记录缺少完整卦象，无法展示综合解读。';
    const timeSource = record.solarDate || record.timestamp;
    const timeText = timeSource ? formatSolarDate(new Date(timeSource)) : '未记录时间';
    const lunarText = record.lunarDate
        ? formatHistoryLunarDate(record.lunarDate, record.shichen)
        : '未记录农历信息';
    const aiAnalysis = record.aiAnalysis || {
        status: 'unavailable',
        content: '',
        errorMessage: ''
    };

    return {
        matter: safeMatter,
        timeText,
        lunarText,
        shichen: record.shichen || '未记录',
        gua: record.gua,
        mainGua: hasGua ? record.gua.shiGong : '未记录',
        jiXiong: summary ? summary.jiXiong : '平',
        summary,
        analysis,
        aiAnalysis
    };
}

function formatHistoryLunarDate(lunarDate, shichen) {
    const leap = lunarDate.isLeap ? '闰' : '';
    const shichenText = shichen ? ` ${shichen}时` : '';
    return `${lunarDate.year}年${leap}${lunarDate.month}月${lunarDate.day}日${shichenText}`;
}

function renderHistoryDetail(viewModel) {
    const baseInfo = `
        <div class="history-detail-section">
            <div class="history-detail-title">基本信息</div>
            <div class="history-detail-grid">
                <div class="history-detail-field">
                    <span class="history-detail-label">事项</span>
                    <span class="history-detail-value">${viewModel.matter}</span>
                </div>
                <div class="history-detail-field">
                    <span class="history-detail-label">公历</span>
                    <span class="history-detail-value">${viewModel.timeText}</span>
                </div>
                <div class="history-detail-field">
                    <span class="history-detail-label">农历</span>
                    <span class="history-detail-value">${viewModel.lunarText}</span>
                </div>
                <div class="history-detail-field">
                    <span class="history-detail-label">时辰</span>
                    <span class="history-detail-value">${viewModel.shichen === '未记录' ? '未记录' : `${viewModel.shichen}时`}</span>
                </div>
            </div>
        </div>
    `;

    if (!viewModel.gua || !viewModel.summary) {
        return `${baseInfo}
            <div class="history-detail-section">
                <div class="history-detail-title">结果说明</div>
                <div class="history-detail-box">这条历史记录来自旧版本，缺少完整卦象字段，目前只能保留基础时间与事项信息。</div>
            </div>
            ${renderHistoryAiSection(viewModel.aiAnalysis)}
        `;
    }

    const guaInfo = [
        { label: '月宫', value: viewModel.gua.yueGong },
        { label: '日宫', value: viewModel.gua.riGong },
        { label: '时宫', value: `${viewModel.gua.shiGong}（主卦）` }
    ].map(item => `
        <div class="history-detail-field">
            <span class="history-detail-label">${item.label}</span>
            <span class="history-detail-value">${item.value}</span>
        </div>
    `).join('');

    return `
        ${baseInfo}
        <div class="history-detail-section">
            <div class="history-detail-title">卦象信息</div>
            <div class="history-detail-grid">${guaInfo}</div>
        </div>
        <div class="history-detail-section">
            <div class="history-detail-title">结果摘要</div>
            <div class="history-detail-box">
                <div class="history-detail-summary-head">
                    <span class="jixiong-badge ${viewModel.summary.jiXiong}">${viewModel.summary.jiXiong}</span>
                    <span class="history-detail-main-gua">主卦：${viewModel.summary.mainGua}</span>
                </div>
                <p>${viewModel.summary.summaryText}</p>
            </div>
        </div>
        <div class="history-detail-section">
            <div class="history-detail-title">行动建议</div>
            <div class="history-detail-grid history-detail-grid-single">
                <div class="history-detail-box">
                    <span class="history-detail-label">宜做</span>
                    <p>${viewModel.summary.shouldDo}</p>
                </div>
                <div class="history-detail-box">
                    <span class="history-detail-label">忌做</span>
                    <p>${viewModel.summary.avoid}</p>
                </div>
            </div>
        </div>
        <div class="history-detail-section">
            <div class="history-detail-title">综合解读</div>
            <div class="history-detail-box history-detail-analysis">${viewModel.analysis}</div>
        </div>
        ${renderHistoryAiSection(viewModel.aiAnalysis)}
    `;
}

function renderHistoryAiSection(aiAnalysis) {
    const statusText = {
        pending: 'AI 分析尚未完成保存',
        success: '已保存当次 AI 分析记录',
        error: aiAnalysis.errorMessage || 'AI 分析保存失败',
        unavailable: aiAnalysis.errorMessage || '该条历史记录未保存 AI 分析'
    };

    let content = `<div class="history-detail-box">${statusText[aiAnalysis.status] || statusText.unavailable}</div>`;

    if (aiAnalysis.status === 'success' && aiAnalysis.content) {
        content = `
            <div class="history-detail-box history-detail-ai">
                <div class="ai-content">${marked.parse(aiAnalysis.content)}</div>
            </div>
        `;
    }

    return `
        <div class="history-detail-section">
            <div class="history-detail-title">AI 分析记录</div>
            ${content}
        </div>
    `;
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
                if (buffer.length > 50) {
                    aiResult.innerHTML = '<div class="ai-content">' + marked.parse(buffer) + '</div>';
                }
            }

            aiResult.innerHTML = '<div class="ai-content">' + marked.parse(buffer) + '</div>';
            syncHistoryAIResult(result.historyId, {
                status: 'success',
                content: buffer,
                errorMessage: ''
            });
        } else {
            // 非流式 JSON 响应（兼容旧版）
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            aiLoading.style.display = 'none';
            aiResult.style.display = 'block';
            aiResult.innerHTML = `<div class="ai-content">${marked.parse(data.reply)}</div>`;
            syncHistoryAIResult(result.historyId, {
                status: 'success',
                content: data.reply,
                errorMessage: ''
            });
        }

    } catch (err) {
        aiLoading.style.display = 'none';
        aiError.style.display = 'block';
        aiError.textContent = `AI 解读暂时不可用（${err.message}），可稍后重试或使用基础解读。`;
        syncHistoryAIResult(result.historyId, {
            status: err.message.includes('503') ? 'unavailable' : 'error',
            content: '',
            errorMessage: err.message
        });
    }
}

function syncHistoryAIResult(historyId, aiAnalysis) {
    if (!historyId) {
        return;
    }

    const updated = updateHistoryRecordAI(historyId, {
        ...aiAnalysis,
        updatedAt: new Date().toISOString()
    });

    if (updated) {
        refreshHistoryIfVisible();
    }
}

function refreshHistoryIfVisible() {
    const historyList = document.getElementById('history-list');
    if (!historyList.classList.contains('hidden')) {
        loadHistory();
    }
}
