import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeTranscriptResult {
  videoId: string;
  transcript: string;
  itemCount: number;
  durationApproxSeconds: number;
}

/**
 * Extracts a 11-character YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /^([\w-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Format seconds to [MM:SS] or [HH:MM:SS]
 */
function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `[${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
  }
  return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
}

/**
 * Extracts official or auto-generated transcripts from a YouTube video
 */
export async function extractYouTubeTranscript(url: string): Promise<YouTubeTranscriptResult> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format. Please provide a valid YouTube watch or share link.');
  }

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('No transcript tracks found for this video.');
    }

    let maxOffset = 0;
    const formattedLines: string[] = [];

    // Group items into logical chunks
    for (const item of transcriptItems) {
      const timestamp = formatTimestamp(item.offset / 1000);
      const cleanText = item.text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim();

      if (item.offset > maxOffset) {
        maxOffset = item.offset;
      }

      if (cleanText) {
        formattedLines.push(`${timestamp} ${cleanText}`);
      }
    }

    const fullTranscript = formattedLines.join('\n');
    const durationApproxSeconds = Math.round(maxOffset / 1000);

    return {
      videoId,
      transcript: fullTranscript,
      itemCount: transcriptItems.length,
      durationApproxSeconds,
    };
  } catch (error: any) {
    console.warn(`[YouTubeParser] Subtitle extraction failed for ${videoId}: ${error.message}`);
    throw new Error(
      `Could not retrieve YouTube subtitles (${error.message || 'Subtitles are disabled on this video'}). Consider uploading the audio/video file directly for multimodal analysis.`
    );
  }
}
