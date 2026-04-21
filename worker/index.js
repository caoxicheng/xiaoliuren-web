/**
 * 小六壬 AI 解读 Worker（流式版）
 * POST /api/divination - AI 解读
 * GET  /api/count      - 获取访问人次
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

const CORS_STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Transfer-Encoding': 'chunked'
};

export default {
  async fetch(request, env) {
    const method = request.method;

    // CORS 预检
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // GET /api/count - 返回访问人次
    if (method === 'GET') {
      const url = new URL(request.url);
      if (url.pathname === '/api/count') {
        const count = await env.COUNTER_KV.get('visit_count');
        return new Response(JSON.stringify({ count: parseInt(count || '0') }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }
    }

    // POST 接口
    if (method === 'POST') {
      const url = new URL(request.url);

      // 访问计数接口
      if (url.pathname === '/api/count') {
        const count = await env.COUNTER_KV.get('visit_count');
        const newCount = (parseInt(count || '0') + 1).toString();
        await env.COUNTER_KV.put('visit_count', newCount);
        return new Response(JSON.stringify({ count: parseInt(newCount) }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }

      // 解读接口
      if (url.pathname === '/api/divination') {
        return handleDivination(request, env);
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: CORS_HEADERS
    });
  }
};

async function handleDivination(request, env) {
  try {
    const body = await request.json();
    const { gua, question, liushenDetails } = body;

    if (!gua || !question) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // 六神口诀
    const poems = {
      '大安': '大安事事昌，求财在坤方，失物去不远，宅舍保安康。行人身未动，病者主无妨，将军回田野，仔细更推详。',
      '留连': '留连事难成，求谋日未明，官事只宜缓，去者未回程。失物南方见，急讨方心称，更须防口舌，人口且平平。',
      '速喜': '速喜喜来临，求财向南行，失物申未午，逢人路上寻。官事有福德，病者无祸侵，田宅六畜吉，行人有信音。',
      '赤口': '赤口主口舌，官非切要防，失物速速讨，行人有惊慌。六畜多作怪，病者出西方，更须防咒诅，诚恐染瘟疫。',
      '小吉': '小吉最吉昌，路上好商量，阴人来报喜，失物在坤方。行人即便至，交关甚是强，凡事皆和合，病者叩穹苍。',
      '空亡': '空亡事不祥，阴人多乖张，求财无利益，行人有灾殃。失物寻不见，官事有刑伤，病人逢暗鬼，解禳保安康。'
    };

    const systemPrompt = `你是小六壬占卜师，用通俗易懂的语言解读卦象。

六神基础信息：
- 大安：吉。平稳安宁，会有贵人帮忙，事情顺利
- 留连：平。拖延阻碍，事情反复，要有耐心
- 速喜：吉。好事将近，消息来得快，意外惊喜
- 赤口：凶。口舌是非，小心人际冲突
- 小吉：小吉。有小收获，女性贵人帮忙，利于合作
- 空亡：凶。落空不利，凡事谨慎

六神古诀：
大安：${poems['大安']}
留连：${poems['留连']}
速喜：${poems['速喜']}
赤口：${poems['赤口']}
小吉：${poems['小吉']}
空亡：${poems['空亡']}

输出要求：
1. 语言通俗、口语化，像朋友聊天，不要术语堆砌
2. 分段清晰，使用 Markdown 格式（标题、加粗、列表等）
3. 结合具体事项（求财/婚姻/出行等）给实用的建议
4. 适当引用古诀增加趣味，但要用大白话解释
5. 控制字数，简洁有力，不要啰嗦`;

    const matterGuidance = liushenDetails && liushenDetails[gua.shiGong]
      ? `问题类型：${question}，主卦是${gua.shiGong}。`
      : '';

    const userPrompt = `问题：${question}

卦象：
- 月宫：${gua.yueGong}
- 日宫：${gua.riGong}
- 时宫（主卦）：${gua.shiGong}

${matterGuidance}

请用通俗易懂的话解读这个卦象，重点说清楚：
1. 整体运势怎么样
2. 针对"${question}"有什么建议
3. 需要注意什么
4. 古人说的话是什么意思（用大白话）

要口语化，像朋友聊天那样说，不要写成学术论文。`;

    const hasApiKey = env.DEEPSEEK_API_KEY && env.DEEPSEEK_API_KEY.trim() !== '';

    if (!hasApiKey) {
      return new Response(JSON.stringify({
        error: '未配置 DEEPSEEK_API_KEY，请先在 Cloudflare Worker 环境变量中配置。'
      }), {
        status: 503,
        headers: CORS_HEADERS
      });
    }

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
        max_tokens: 900,
        stream: true
      })
    });

    if (!apiResponse.ok) {
      const err = await apiResponse.text();
      return new Response(JSON.stringify({ error: 'DeepSeek API error', detail: err }), {
        status: 502,
        headers: CORS_HEADERS
      });
    }

    // 将 DeepSeek 的 SSE 流转换为普通流式输出
    const stream = new ReadableStream({
      async start(controller) {
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;

              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // 忽略解析失败的行
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: CORS_STREAM_HEADERS
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
