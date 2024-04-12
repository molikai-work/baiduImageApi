/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// ?q=神里绫华&maxUrl=30
 
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const urlParams = new URL(request.url).searchParams;
  const keyword = urlParams.get('q');
  let maxUrl = parseInt(urlParams.get('maxUrl')) || 50;
  maxUrl = Math.min(Math.max(maxUrl, 1), 60);

  if (!keyword) {
    return new Response(JSON.stringify({ error: '請提供 q 參數' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  const apiUrl = `https://image.baidu.com/search/flip?tn=baiduimage&ie=utf-8&word=${keyword}&ct=201326592&v=flip`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 5.01; gd-GB; rv:1.9.1.20) Gecko/2019-08-28 00:43:46 Firefox/3.8',
        'Accept-Language': 'zh,zh-CN;q=0.9,en;q=0.7,en-GB;q=0.6,en-US;q=0.5',
        'Referer': 'https://www.example.com/'
      }
    });

    const html = await response.text();

    const picUrls = html.match(/"objURL":"(.*?)"/g).map(match => match.replace('"objURL":"', '').replace('"', ''));

    const formattedUrls = picUrls.slice(0, maxUrl).map((url, index) => ({ index: index + 1, url }));

    const totalResults = formattedUrls.length;

    const jsonResponse = {
      code: 200,
      msg: "成功獲取圖片 URL",
      time: Date.now(),
      total_results: totalResults,
      results: formattedUrls
    };

    return new Response(JSON.stringify(jsonResponse), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '獲取圖像時出錯', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}
