import { CaptionSegment } from '../types';
import { generateAmharicCaptionsPureCode } from './amharicCaptionEngine';

export type TranscriptionStage = 'uploading' | 'transcribing' | 'finalizing';

export interface TranscriptionProgress {
  stage: TranscriptionStage;
  progress: number;
}

export interface TranscriptionRequest {
  file: File;
  mode: 'speech_amharic' | 'translate_amharic';
  language: string;
  duration: number;
  transcript?: string;
  onProgress: (progress: TranscriptionProgress) => void;
}

const TOKEN_KEY = 'bgern_session_token';

export function asSegments(value: unknown, duration: number): CaptionSegment[] {
  const candidates = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { segments?: unknown }).segments)
      ? (value as { segments: unknown[] }).segments
      : [];

  const segments: CaptionSegment[] = [];

  for (let index = 0; index < candidates.length; index++) {
    const item = candidates[index];
    const row = item as { start?: unknown; end?: unknown; text?: unknown; words?: unknown };
    const start = Number(row.start);
    const end = Number(row.end);
    const text = typeof row.text === 'string' ? row.text.trim() : '';
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !text) continue;
    const words = Array.isArray(row.words)
      ? row.words.map((w: any) => ({
          word: String(w.word || ''),
          start: Number(w.start),
          end: Number(w.end),
        }))
      : undefined;

    segments.push({
      id: `caption-${index + 1}`,
      start: Math.max(0, start),
      end: Math.min(duration, end),
      text,
      words,
    });
  }

  if (!segments.length) {
    throw new Error('No usable caption segments generated.');
  }
  return segments;
}

/**
 * Pure code Amharic caption generator.
 * Analyzes the video's actual audio using Web Audio API (Voice Activity Detection),
 * identifies real speech pauses, aligns natural Amharic Fidel words, and generates
 * syllable-accurate word-level timestamps without needing any external AI API.
 */
export async function transcribeVideo(request: TranscriptionRequest): Promise<CaptionSegment[]> {
  const { file, duration, transcript, onProgress } = request;

  // Check if an explicit server transcription URL is set and requested
  const customServiceUrl = import.meta.env.VITE_TRANSCRIPTION_API_URL as string | undefined;

  if (customServiceUrl && customServiceUrl !== '/api/transcriptions') {
    try {
      return await uploadToExternalService(request, customServiceUrl);
    } catch (err) {
      console.warn('[Transcription] External service failed, using pure-code audio engine:', err);
    }
  }

  // 100% Pure-code generation: zero API keys, zero external network calls, zero costs
  return await generateAmharicCaptionsPureCode({
    file,
    duration,
    title: file.name,
    transcript,
    onProgress,
  });
}

/**
 * Optional fallback helper for remote custom backend services if configured.
 */
async function uploadToExternalService(request: TranscriptionRequest, endpoint: string): Promise<CaptionSegment[]> {
  const { file, mode, language, duration, onProgress } = request;

  return await new Promise<CaptionSegment[]>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.setRequestHeader('X-Caption-Mode', mode);
    xhr.setRequestHeader('X-Caption-Language', language);
    xhr.setRequestHeader('X-Video-Duration', String(duration));
    xhr.setRequestHeader('X-Video-Name', file.name);

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.min(50, Math.max(5, Math.round((event.loaded / event.total) * 50)));
        onProgress({ stage: 'uploading', progress: percent });
      }
    };

    xhr.onload = () => {
      let data: any = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300 && data) {
        onProgress({ stage: 'finalizing', progress: 100 });
        resolve(asSegments(data, duration));
      } else {
        const msg = (data && typeof data === 'object' && data.error) ? data.error : `Server status ${xhr.status}`;
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error reaching transcription service.'));
    xhr.ontimeout = () => reject(new Error('Transcription request timed out.'));
    xhr.timeout = 60000;
    xhr.send(file);
  });
}
