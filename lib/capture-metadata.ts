export type CaptureMetadata = {
    url: string;
    capturedAt?: string;
    hash?: string;
    notes?: string;
};

const URL_REGEX = /Captured URL:\s*(.+)/i;
const CAPTURED_AT_REGEX = /Captured At:\s*(.+)/i;
const HASH_REGEX = /Content Hash:\s*(.+)/i;
const NOTES_SPLIT_REGEX = /Notes:\s*/i;

export function parseCaptureMetadata(body: string): CaptureMetadata | null {
    const urlMatch = body.match(URL_REGEX);
    if (!urlMatch) {
        return null;
    }
    const capturedAtMatch = body.match(CAPTURED_AT_REGEX);
    const hashMatch = body.match(HASH_REGEX);
    const notesSections = body.split(NOTES_SPLIT_REGEX);
    const notes = notesSections.length > 1 ? notesSections.slice(1).join("Notes: ").trim() : undefined;
    return {
        url: urlMatch[1].trim(),
        capturedAt: capturedAtMatch?.[1].trim(),
        hash: hashMatch?.[1].trim(),
        notes,
    };
}
