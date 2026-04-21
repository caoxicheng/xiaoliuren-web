// 历史记录管理（localStorage）

const STORAGE_KEY = 'xiaoliuren_history';
const MAX_HISTORY = 50; // 最多保存50条记录
const HISTORY_SCHEMA_VERSION = 2;

/**
 * 将起卦结果转换为标准历史记录
 * @param {Object} result - 当前起卦结果
 * @returns {Object} 标准历史记录
 */
function createHistoryRecord(result) {
    return normalizeHistoryRecord({
        id: Date.now(),
        schemaVersion: HISTORY_SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
        matter: (result.matter || '').trim(),
        solarDate: serializeSolarDate(result.solarDate),
        lunarDate: serializeLunarDate(result.lunarDate),
        shichen: result.shichen || '',
        gua: normalizeGua(result.gua),
        aiAnalysis: {
            status: 'pending',
            content: '',
            errorMessage: '',
            updatedAt: null
        }
    }).record;
}

/**
 * 保存占卜记录到历史
 * @param {Object} result - 占卜结果
 * @returns {Object|null} 已保存的历史记录
 */
function saveDivinationRecord(result) {
    try {
        const history = getHistory();
        const record = createHistoryRecord(result);

        history.unshift(record);

        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }

        persistHistory(history);
        return record;
    } catch (e) {
        console.error('保存历史记录失败:', e);
        if (e.name === 'QuotaExceededError') {
            clearOldRecords();
            try {
                const history = getHistory();
                const record = createHistoryRecord(result);
                history.unshift(record);
                persistHistory(history);
                return record;
            } catch (retryError) {
                console.error('重试保存失败:', retryError);
            }
        }
        return null;
    }
}

/**
 * 更新历史记录中的 AI 分析结果
 * @param {number} id - 记录ID
 * @param {Object} aiAnalysis - AI 分析结果
 * @returns {boolean} 是否更新成功
 */
function updateHistoryRecordAI(id, aiAnalysis) {
    try {
        const history = getHistory();
        const index = history.findIndex(record => record.id === id);

        if (index === -1) {
            return false;
        }

        history[index].aiAnalysis = normalizeAiAnalysis({
            ...history[index].aiAnalysis,
            ...aiAnalysis,
            updatedAt: aiAnalysis.updatedAt || new Date().toISOString()
        });

        persistHistory(history);
        return true;
    } catch (e) {
        console.error('更新 AI 历史记录失败:', e);
        return false;
    }
}

/**
 * 获取历史记录
 * @returns {Array} 历史记录数组
 */
function getHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const source = Array.isArray(parsed) ? parsed : [];
        let hasChanges = !Array.isArray(parsed);

        const history = source.map(record => {
            const normalized = normalizeHistoryRecord(record);
            if (normalized.changed) {
                hasChanges = true;
            }
            return normalized.record;
        });

        if (hasChanges) {
            persistHistory(history);
        }

        return history;
    } catch (e) {
        console.error('读取历史记录失败:', e);
        return [];
    }
}

/**
 * 删除单条记录
 * @param {number} id - 记录ID
 */
function deleteRecord(id) {
    try {
        const history = getHistory();
        const filtered = history.filter(record => record.id !== id);
        persistHistory(filtered);
    } catch (e) {
        console.error('删除记录失败:', e);
    }
}

/**
 * 清空所有历史记录
 */
function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('清空历史记录失败:', e);
    }
}

/**
 * 清理旧记录（保留最近20条）
 */
function clearOldRecords() {
    try {
        const history = getHistory();
        if (history.length > 20) {
            history.length = 20;
            persistHistory(history);
        }
    } catch (e) {
        console.error('清理旧记录失败:', e);
    }
}

function persistHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function serializeSolarDate(solarDate) {
    if (!solarDate) return null;

    const date = solarDate instanceof Date ? solarDate : new Date(solarDate);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeLunarDate(lunarDate) {
    if (!lunarDate) {
        return null;
    }

    if (lunarDate.getYear) {
        return {
            year: lunarDate.getYear(),
            month: lunarDate.getMonth(),
            day: lunarDate.getDay(),
            isLeap: lunarDate.getIsLeap ? lunarDate.getIsLeap() : lunarDate.isLeap
        };
    }

    return normalizeLunarDate(lunarDate);
}

function normalizeHistoryRecord(record) {
    const source = record && typeof record === 'object' ? record : {};
    const timestamp = normalizeTimestamp(source.timestamp, source.solarDate);
    const normalized = {
        id: normalizeRecordId(source.id, timestamp),
        schemaVersion: HISTORY_SCHEMA_VERSION,
        timestamp,
        matter: typeof source.matter === 'string' && source.matter.trim() ? source.matter.trim() : '未记录事项',
        solarDate: normalizeSolarDate(source.solarDate, timestamp),
        lunarDate: normalizeLunarDate(source.lunarDate),
        shichen: typeof source.shichen === 'string' ? source.shichen : '',
        gua: normalizeGua(source.gua),
        aiAnalysis: normalizeAiAnalysis(source.aiAnalysis)
    };

    const changed = JSON.stringify(source) !== JSON.stringify(normalized);

    return {
        record: normalized,
        changed
    };
}

function normalizeRecordId(id, timestamp) {
    if (typeof id === 'number' && Number.isFinite(id)) {
        return id;
    }

    if (typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id))) {
        return Number(id);
    }

    const timestampMs = new Date(timestamp).getTime();
    return Number.isFinite(timestampMs) ? timestampMs : Date.now();
}

function normalizeTimestamp(timestamp, solarDate) {
    const candidates = [timestamp, solarDate];

    for (const candidate of candidates) {
        if (!candidate) continue;
        const date = new Date(candidate);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }

    return new Date().toISOString();
}

function normalizeSolarDate(solarDate, fallbackTimestamp) {
    const candidate = solarDate || fallbackTimestamp;
    const date = new Date(candidate);
    return Number.isNaN(date.getTime()) ? new Date(fallbackTimestamp).toISOString() : date.toISOString();
}

function normalizeLunarDate(lunarDate) {
    if (!lunarDate || typeof lunarDate !== 'object') {
        return null;
    }

    const year = normalizeNumber(lunarDate.year);
    const month = normalizeNumber(lunarDate.month);
    const day = normalizeNumber(lunarDate.day);

    if (!year || !month || !day) {
        return null;
    }

    return {
        year,
        month,
        day,
        isLeap: Boolean(lunarDate.isLeap)
    };
}

function normalizeGua(gua) {
    if (!gua || typeof gua !== 'object') {
        return null;
    }

    const yueGong = typeof gua.yueGong === 'string' ? gua.yueGong : '';
    const riGong = typeof gua.riGong === 'string' ? gua.riGong : '';
    const shiGong = typeof gua.shiGong === 'string' ? gua.shiGong : '';

    if (!yueGong || !riGong || !shiGong) {
        return null;
    }

    return { yueGong, riGong, shiGong };
}

function normalizeAiAnalysis(aiAnalysis) {
    const source = aiAnalysis && typeof aiAnalysis === 'object' ? aiAnalysis : {};
    const validStatuses = ['pending', 'success', 'error', 'unavailable'];
    const status = validStatuses.includes(source.status) ? source.status : 'unavailable';

    return {
        status,
        content: typeof source.content === 'string' ? source.content : '',
        errorMessage: typeof source.errorMessage === 'string' ? source.errorMessage : '',
        updatedAt: source.updatedAt ? normalizeTimestamp(source.updatedAt, source.updatedAt) : null
    };
}

function normalizeNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}
