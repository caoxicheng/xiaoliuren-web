// 小六壬核心算法

// 六神数组
const LIUSHEN = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];

// 时辰名称数组
const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 根据小时获取时辰名称和序号
 * @param {number} hour - 小时（0-23）
 * @returns {Object} { name: 时辰名称, number: 时辰序号（1-12）}
 */
function getShichen(hour) {
    // 子时特殊处理（23:00-00:59）
    if (hour >= 23 || hour < 1) {
        return { name: '子', number: 1 };
    }

    // 其他时辰：每2小时一个时辰
    const index = Math.floor((hour + 1) / 2);
    return {
        name: SHICHEN_NAMES[index],
        number: index + 1
    };
}

/**
 * 计算小六壬卦象
 * @param {number} lunarMonth - 农历月份
 * @param {number} lunarDay - 农历日期
 * @param {number} shichenNum - 时辰序号（1-12）
 * @returns {Object} { yueGong: 月宫, riGong: 日宫, shiGong: 时宫（主卦）}
 */
function calculateGua(lunarMonth, lunarDay, shichenNum) {
    // 起卦方法：
    // 1. 从大安起正月，顺数到所求月份，得月宫
    // 2. 从月宫起初一，顺数到所求日期，得日宫
    // 3. 从日宫起子时，顺数到所求时辰，得时宫

    const yueGong = (lunarMonth - 1) % 6;
    const riGong = (yueGong + lunarDay - 1) % 6;
    const shiGong = (riGong + shichenNum - 1) % 6;

    return {
        yueGong: LIUSHEN[yueGong],
        riGong: LIUSHEN[riGong],
        shiGong: LIUSHEN[shiGong]
    };
}

/**
 * 执行占卜（主函数）
 * @returns {Object} 占卜结果
 */
function performDivination() {
    // 获取当前时间
    const now = new Date();

    // 转换为农历
    const lunar = Lunar.fromDate(now);

    // 获取时辰
    const shichen = getShichen(now.getHours());

    // 计算卦象
    const gua = calculateGua(
        lunar.getMonth(),
        lunar.getDay(),
        shichen.number
    );

    // 返回完整结果
    return {
        solarDate: now,
        lunarDate: {
            year: lunar.getYear(),
            month: lunar.getMonth(),
            day: lunar.getDay(),
            isLeap: lunar.isLeap
        },
        shichen: shichen.name,
        gua: gua
    };
}
