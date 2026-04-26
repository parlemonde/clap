export type ByteRange = {
    start: number;
    end: number;
};

export type RangeRequest = { range: ByteRange; status: 'range' } | { status: 'unsatisfiable' } | null;

const RANGE_HEADER_REGEX = /^bytes=(\d*)-(\d*)$/;

export function formatByteRange(range: ByteRange): string {
    return `bytes=${range.start}-${range.end}`;
}

export function getByteRangeLength(range: ByteRange): number {
    return range.end - range.start + 1;
}

export function parseRangeHeader(rangeHeader: string | null, contentLength: number): RangeRequest {
    if (!rangeHeader) {
        return null;
    }

    const match = RANGE_HEADER_REGEX.exec(rangeHeader.trim());
    if (!match) {
        return null;
    }

    const [, startValue, endValue] = match;
    if (!startValue && !endValue) {
        return null;
    }

    if (!startValue) {
        const suffixLength = Number(endValue);
        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
            return null;
        }

        return {
            range: {
                end: contentLength - 1,
                start: Math.max(contentLength - suffixLength, 0),
            },
            status: 'range',
        };
    }

    const start = Number(startValue);
    const requestedEnd = endValue ? Number(endValue) : contentLength - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || requestedEnd < start) {
        return null;
    }

    if (start >= contentLength) {
        return { status: 'unsatisfiable' };
    }

    return {
        range: {
            end: Math.min(requestedEnd, contentLength - 1),
            start,
        },
        status: 'range',
    };
}
