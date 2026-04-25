const LEGACY_WORKER_ORIGIN = 'https://xiaoliuren-ai.dove-justdoit.workers.dev';

export function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = new URL(url.pathname + url.search, LEGACY_WORKER_ORIGIN);

    return fetch(new Request(targetUrl, context.request));
}
