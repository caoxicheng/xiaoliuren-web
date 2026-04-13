/**
 * 小六壬 AI 解读 Worker
 * 接收卦象数据，调用 DeepSeek 进行专业解读
 */

export default {
  async fetch(request, env) {
    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { gua, question, liushenDetails } = body;

      if (!gua || !question) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 构建 Prompt
      const systemPrompt = `你是小六壬占卜专家，精通中国传统文化。用户会提供卦象信息，你需要根据卦象给出专业、有深度的解读。

卦象六神含义：
- 大安：木、东方、春季，吉。稳定安宁，诸事顺遂，贵人相助。
- 留连：木、东方，平。拖延纠缠，事多反复，暧昧不明。
- 速喜：火、南、夏季，吉。喜事临门，消息速至，意外惊喜。
- 赤口：金、西、秋，凶。口舌是非，争执不断，凶险之象。
- 小吉：水、北、冬，小吉。小有收获，女性贵人，利于合作。
- 空亡：土、中央，凶。落空虚无，求谋不遂，徒劳无功。

解读风格：专业但不晦涩，有文化底蕴但不故弄玄虚。`;

      const userPrompt = `我的问题：${question}

卦象信息：
- 月宫：${gua.yueGong}（${liushenDetails?.[gua.yueGong]?.meanings?.[0] || ''}）
- 日宫：${gua.riGong}（${liushenDetails?.[gua.riGong]?.meanings?.[0] || ''}）
- 时宫（主卦）：${gua.shiGong}（${liushenDetails?.[gua.shiGong]?.meanings?.[0] || ''}）

请结合我的问题，对这个卦象进行深度解读，包括：
1. 总体运势分析
2. 针对我问题的具体建议
3. 需要注意的事项
4. 有启发的古语或俗语`;

      const apiResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!apiResponse.ok) {
        const err = await apiResponse.text();
        return new Response(JSON.stringify({ error: 'DeepSeek API error', detail: err }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await apiResponse.json();
      const reply = data.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
