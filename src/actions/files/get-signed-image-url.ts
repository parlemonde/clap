import { buf2hex, hmac } from 'src/aws/utils';

const SECRET = process.env.APP_SECRET;

export async function getSignedImageUrl(url: string, userId: number): Promise<string> {
    try {
        const imageUrl = url.startsWith('/') ? url : `${new URL(url).pathname}${new URL(url).search}`;
        if (!SECRET || !imageUrl.startsWith(`/api/images/users/${userId}/`)) {
            return imageUrl; // not a user image
        }

        const searchParams = new URLSearchParams(imageUrl.split('?')[1]);
        const now = Date.now();
        searchParams.set('nonce', crypto.randomUUID());
        searchParams.set('userId', userId.toString());
        searchParams.set('timestamp', now.toString());
        searchParams.set('expires', (now + 1000 * 60 * 60 * 2).toString()); // 2h

        const kSecret = await hmac('secret', SECRET);
        const kSignature = await hmac(kSecret, searchParams.toString());
        const signature = buf2hex(kSignature);
        searchParams.set('signature', signature);

        const prefix = imageUrl.split('?')[0];
        return `${prefix}?${searchParams.toString()}`;
    } catch {
        return url;
    }
}

export async function isSignedImageUrlValid(url: string): Promise<boolean> {
    try {
        const imageUrl = url.startsWith('/') ? url : `${new URL(url).pathname}${new URL(url).search}`;
        if (!SECRET || !imageUrl.startsWith(`/api/images/users/`)) {
            return false; // not a user image
        }

        const searchParams = new URLSearchParams(imageUrl.split('?')[1]);
        const timestamp = searchParams.get('timestamp');
        const expires = searchParams.get('expires');
        const signature = searchParams.get('signature');

        if (!timestamp || !expires || !signature) {
            return false;
        }
        if (Date.now() > Number(expires)) {
            return false; // expired, no need to verify
        }

        searchParams.delete('signature'); // remove signature from search params to verify
        const kSecret = await hmac('secret', SECRET);
        const kSignature = await hmac(kSecret, searchParams.toString());
        const computedSignature = buf2hex(kSignature);
        return computedSignature === signature;
    } catch {
        return false;
    }
}
