import { sendError } from './response.mjs';

export async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req
      .on('data', (chunk) => {
        chunks.push(chunk);
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function parseJson(req, res) {
  try {
    const raw = await readBody(req);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    sendError(res, 400, 'Geçersiz JSON gövdesi', error.message);
    throw error;
  }
}
