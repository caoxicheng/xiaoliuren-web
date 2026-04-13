// 历史记录管理（localStorage）

const STORAGE_KEY = 'xiaoliuren_history';
const MAX_HISTORY = 50; // 最多保存50条记录

/**
 * 保存占卜记录到历史
 * @param {Object} record - 占卜记录
 */
function saveDivinationRecord(record) {
    try {
        const history = getHistory();

        // 添加时间戳和ID（lunarDate 转为纯对象，避免 JSON.stringify 丢失方法）
        record.id = Date.now();
        record.timestamp = new Date().toISOString();
        // lunar-javascript 对象不可序列化，需手动提取
        if (record.lunarDate && record.lunarDate.getYear) {
            record.lunarDate = {
                year: record.lunarDate.getYear(),
                month: record.lunarDate.getMonth(),
                day: record.lunarDate.getDay(),
                isLeap: record.lunarDate.isLeap
            };
        }

        // 添加到历史记录开头
        history.unshift(record);

        // 限制数量
        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('保存历史记录失败:', e);
        // 如果存储空间已满，清理旧数据
        if (e.name === 'QuotaExceededError') {
            clearOldRecords();
            // 重试保存
            try {
                const history = getHistory();
                history.unshift(record);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            } catch (retryError) {
                console.error('重试保存失败:', retryError);
            }
        }
    }
}

/**
 * 获取历史记录
 * @returns {Array} 历史记录数组
 */
function getHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
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
        const filtered = history.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error('清理旧记录失败:', e);
    }
}
