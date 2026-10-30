import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PIXELLE_PORT || 4173);
const model = process.env.OPENAI_MODEL || 'gpt-6-luna';
const maxBodyBytes = 110_000;

const personas = {
  'Sophie 💜': 'Sophie is a warm, upbeat travel-loving AI creator. She enjoys thoughtful conversations, travel, creative projects, and sharing encouragement. Keep her voice friendly and natural.',
  Emma: 'Emma is a relaxed, observant AI creator who loves photography, coastlines, and finding beauty in small details. She is kind, curious, and speaks naturally.',
  Lily: 'Lily is a playful, cheerful AI creator who loves making plans with friends, fashion, and everyday adventures. She is supportive and conversational.',
  Brooke: 'Brooke is a thoughtful, funny AI creator who enjoys food, music, and bringing people together. She listens closely and answers the actual message.',
  Alex: 'Alex is an easygoing, outdoorsy AI creator who likes hiking, music, and practical plans. He is warm, direct, and conversational.',
  'ella.xo': 'Ella is a fictional, upbeat style and city-life creator. She enjoys outfits, art, and exploring new neighborhoods.',
  adventurejess: 'Jess is a fictional travel creator who loves road trips, coastlines, and practical adventure ideas.',
  'lily.s': 'Lily is a fictional, cheerful fashion and everyday-adventure creator. Keep her voice playful and kind.',
  'maya.lane': 'Maya is a fictional, thoughtful creative creator who enjoys photography, music, and sharing ideas.',
  'noah.jpg': 'Noah is a fictional, relaxed photography creator who likes city scenes, nature, and simple conversation.',
  'ava.inbloom': 'Ava is a fictional flower and garden creator who loves color, small joys, and gentle encouragement.',
  'kai.outdoors': 'Kai is a fictional outdoor adventure creator who enjoys hiking, mountains, and practical trail advice.',
  'sofia.studio': 'Sofia is a fictional art creator who enjoys painting, creative routines, and sharing works in progress.',
  'milo.moments': 'Milo is a fictional city-life photographer who enjoys architecture, walks, and finding good light.',
  'nina.cooks': 'Nina is a fictional food creator who enjoys cooking, brunch, and easy recipe ideas.',
  'theo.travels': 'Theo is a fictional travel creator who enjoys discovering places and helping plan trips.',
};

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error('Request is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function getOutputText(data) {
  return (data.output || [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n')
    .trim();
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);

  if (request.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(response, 200, { ready: Boolean(process.env.OPENAI_API_KEY), model });
  }

  if (request.method === 'POST' && url.pathname === '/api/chat') {
    if (!process.env.OPENAI_API_KEY) {
      return sendJson(response, 503, { error: 'Add your OpenAI API key to start real AI chats.' });
    }

    const origin = request.headers.origin;
    if (origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(origin)) {
      return sendJson(response, 403, { error: 'This local chat endpoint only accepts Pixelle.' });
    }

    try {
      const body = await readJson(request);
      const persona = personas[body.persona];
      const history = Array.isArray(body.history) ? body.history.slice(-24) : [];
      if (!persona) return sendJson(response, 400, { error: 'Choose a valid Pixelle creator.' });
      if (!history.length || history.length > 24 || history.some((item) =>
        !item || !['user', 'assistant'].includes(item.role) ||
        typeof item.content !== 'string' || item.content.length > 4_000
      )) {
        return sendJson(response, 400, { error: 'The conversation could not be read. Please try again.' });
      }

      const upstream = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          store: false,
          max_output_tokens: 220,
          instructions: `You are ${Object.keys(personas).find((name) => personas[name] === persona)}, a fictional AI creator chatting on Pixelle. ${persona} Respond directly to what the user actually said, remember the conversation context included below, and ask a relevant follow-up only when it feels natural. Be concise, warm, and honest. Never claim to be a human or to have real-world experiences, actions, or access that you do not have. If you do not know something, say so plainly.`,
          input: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const message = upstream.status === 401
          ? 'The API key was not accepted. Update it in the launcher and restart Pixelle.'
          : upstream.status === 429
            ? 'The AI service is busy or its usage limit was reached. Try again in a moment.'
            : 'The AI service could not reply right now. Please try again.';
        return sendJson(response, upstream.status === 429 ? 429 : 502, { error: message });
      }

      const reply = getOutputText(data);
      if (!reply) return sendJson(response, 502, { error: 'The AI service returned an empty reply. Please try again.' });
      return sendJson(response, 200, { reply });
    } catch (error) {
      const message = error instanceof SyntaxError
        ? 'The message could not be read. Please try again.'
        : 'Pixelle could not reach the AI service. Check your connection and try again.';
      return sendJson(response, 500, { error: message });
    }
  }

  if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    try {
      const html = await readFile(join(root, 'index.html'));
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return response.end(html);
    } catch {
      return sendJson(response, 500, { error: 'Pixelle could not load its app page.' });
    }
  }

  sendJson(response, 404, { error: 'Not found.' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Pixelle is ready at http://127.0.0.1:${port}`);
  if (!process.env.OPENAI_API_KEY) console.log('No API key is set yet. Close Pixelle and restart it with your API key to enable AI replies.');
});
