'use client';

import mime from 'mime-types';

import { uploadImage } from '@frontend/lib/upload-image';
import { uploadSound } from '@frontend/lib/upload-sound';
import type { ProjectData } from '@server/database/schemas/projects';

const DATABASE_NAME = 'clap-local-media';
const DATABASE_VERSION = 1;
const STORE_NAME = 'media';
const LOCAL_MEDIA_URL_PREFIX = '/local-media/';
const LOCAL_MEDIA_SERVICE_WORKER_SCOPE = '/create/';

export const LOCAL_MEDIA_MAX_SIZE = 50 * 1024 * 1024;

export type LocalMediaKind = 'image' | 'audio';

export type LocalMediaRecord = {
    id: string;
    url: string;
    kind: LocalMediaKind;
    blob: Blob;
    mimeType: string;
    size: number;
    originalName?: string;
    createdAt: number;
    updatedAt: number;
};

export type LocalMediaMigrationProgress = {
    completed: number;
    total: number;
};

export class LocalMediaMigrationError extends Error {
    uploadedUrls: string[];

    constructor(message: string, uploadedUrls: string[], options?: ErrorOptions) {
        super(message, options);
        this.name = 'LocalMediaMigrationError';
        this.uploadedUrls = uploadedUrls;
    }
}

export function isLocalMediaUrl(url: string): boolean {
    return url.startsWith(LOCAL_MEDIA_URL_PREFIX);
}

export function collectProjectMediaUrls(projectData: ProjectData): Set<string> {
    const urls = new Set<string>();
    if (projectData.soundUrl) {
        urls.add(projectData.soundUrl);
    }
    for (const question of projectData.questions) {
        if (question.soundUrl) {
            urls.add(question.soundUrl);
        }
        for (const plan of question.plans || []) {
            if (plan.imageUrl) {
                urls.add(plan.imageUrl);
            }
        }
    }
    return urls;
}

export function replaceProjectMediaUrls(projectData: ProjectData, replacements: Map<string, string>): ProjectData {
    return {
        ...projectData,
        soundUrl: projectData.soundUrl ? replacements.get(projectData.soundUrl) || projectData.soundUrl : projectData.soundUrl,
        questions: projectData.questions.map((question) => ({
            ...question,
            soundUrl: question.soundUrl ? replacements.get(question.soundUrl) || question.soundUrl : question.soundUrl,
            plans: (question.plans || []).map((plan) => ({
                ...plan,
                imageUrl: plan.imageUrl ? replacements.get(plan.imageUrl) || plan.imageUrl : plan.imageUrl,
            })),
        })),
    };
}

export async function ensureLocalMediaServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Local media storage is not available in this browser.');
    }

    await navigator.serviceWorker.register('/media/local-media-sw.js', { scope: LOCAL_MEDIA_SERVICE_WORKER_SCOPE });

    if (!window.location.pathname.startsWith(LOCAL_MEDIA_SERVICE_WORKER_SCOPE)) {
        return;
    }

    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
            const timeout = window.setTimeout(resolve, 1500);
            navigator.serviceWorker.addEventListener(
                'controllerchange',
                () => {
                    window.clearTimeout(timeout);
                    resolve();
                },
                { once: true },
            );
        });
    }

    if (!navigator.serviceWorker.controller) {
        throw new Error('Local media service worker is not available.');
    }
}

export async function insertLocalMedia(fileOrBlob: File | Blob, options: { kind: LocalMediaKind; originalName?: string }): Promise<string> {
    await ensureLocalMediaServiceWorker();

    if (fileOrBlob.size > LOCAL_MEDIA_MAX_SIZE) {
        throw new Error('Local media file is too large.');
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    const record: LocalMediaRecord = {
        id,
        url: `${LOCAL_MEDIA_URL_PREFIX}${id}`,
        kind: options.kind,
        blob: fileOrBlob,
        mimeType: fileOrBlob.type || 'application/octet-stream',
        size: fileOrBlob.size,
        originalName: options.originalName || (fileOrBlob instanceof File ? fileOrBlob.name : undefined),
        createdAt: now,
        updatedAt: now,
    };

    await putLocalMediaRecord(record);
    return record.url;
}

export async function getLocalMedia(urlOrId: string): Promise<LocalMediaRecord | undefined> {
    const id = getLocalMediaId(urlOrId);
    if (!id) {
        return undefined;
    }

    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        const record = await requestToPromise<LocalMediaRecord | undefined>(store.get(id));
        await transactionDone;
        return record;
    } finally {
        database.close();
    }
}

export async function deleteLocalMedia(urlOrId: string): Promise<void> {
    const id = getLocalMediaId(urlOrId);
    if (!id) {
        return;
    }

    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        await requestToPromise(store.delete(id));
        await transactionDone;
    } finally {
        database.close();
    }
}

export async function listLocalMedia(): Promise<LocalMediaRecord[]> {
    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        const records = await requestToPromise<LocalMediaRecord[]>(store.getAll());
        await transactionDone;
        return records;
    } finally {
        database.close();
    }
}

export async function purgeUnusedLocalMedia(projectData: ProjectData): Promise<void> {
    const usedUrls = collectProjectMediaUrls(projectData);
    const records = await listLocalMedia();
    await deleteLocalMediaRecords(records.filter((record) => !usedUrls.has(record.url)).map((record) => record.id));
}

export async function getLocalMediaExtensionHints(projectData: ProjectData): Promise<Record<string, string>> {
    const localUrls = [...collectProjectMediaUrls(projectData)].filter(isLocalMediaUrl);
    const hints: Record<string, string> = {};
    const records = await getLocalMediaRecords(localUrls);

    for (const url of localUrls) {
        const record = records.get(url);
        if (!record) {
            throw new Error(`Missing local media: ${url}`);
        }
        hints[url] = getExtensionFromFileName(record.originalName) || getExtensionFromMimeType(record.mimeType) || getDefaultExtension(record.kind);
    }

    return hints;
}

export async function migrateLocalProjectMedia(
    projectData: ProjectData,
    onProgress?: (progress: LocalMediaMigrationProgress) => void,
): Promise<{ projectData: ProjectData; uploadedUrls: string[] }> {
    const localUrls = [...collectProjectMediaUrls(projectData)].filter(isLocalMediaUrl);
    const replacements = new Map<string, string>();
    const uploadedUrls: string[] = [];

    onProgress?.({ completed: 0, total: localUrls.length });

    try {
        for (const url of localUrls) {
            const record = await getLocalMedia(url);
            if (!record) {
                throw new Error(`Missing local media: ${url}`);
            }

            const uploadedUrl =
                record.kind === 'image'
                    ? await uploadImage(record.blob)
                    : await uploadSound(
                          new File([record.blob], record.originalName || `${record.id}${getExtensionFromMimeType(record.mimeType)}`, {
                              type: record.mimeType,
                          }),
                      );
            replacements.set(url, uploadedUrl);
            uploadedUrls.push(uploadedUrl);
            onProgress?.({ completed: uploadedUrls.length, total: localUrls.length });
        }
    } catch (error) {
        throw new LocalMediaMigrationError('Failed to migrate local media.', uploadedUrls, { cause: error });
    }

    return {
        projectData: replaceProjectMediaUrls(projectData, replacements),
        uploadedUrls,
    };
}

function getLocalMediaId(urlOrId: string): string | null {
    if (isLocalMediaUrl(urlOrId)) {
        return urlOrId.slice(LOCAL_MEDIA_URL_PREFIX.length);
    }
    return urlOrId.includes('/') ? null : urlOrId;
}

function getExtensionFromMimeType(mimeType: string): string {
    const extension = mime.extension(mimeType);
    return extension ? `.${extension}` : '';
}

function getExtensionFromFileName(fileName?: string): string {
    const mimeType = fileName ? mime.lookup(fileName) : false;
    const extension = mimeType ? mime.extension(mimeType) : false;
    return extension ? `.${extension}` : '';
}

function getDefaultExtension(kind: LocalMediaKind): string {
    return kind === 'image' ? '.png' : '.mp3';
}

async function putLocalMediaRecord(record: LocalMediaRecord): Promise<void> {
    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        await requestToPromise(store.put(record));
        await transactionDone;
    } finally {
        database.close();
    }
}

async function getLocalMediaRecords(urlOrIds: string[]): Promise<Map<string, LocalMediaRecord>> {
    const ids = urlOrIds.map(getLocalMediaId).filter((id): id is string => id !== null);
    const records = new Map<string, LocalMediaRecord>();

    if (ids.length === 0) {
        return records;
    }

    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        const results = await Promise.all(ids.map((id) => requestToPromise<LocalMediaRecord | undefined>(store.get(id))));
        await transactionDone;

        for (const record of results) {
            if (record) {
                records.set(record.url, record);
                records.set(record.id, record);
            }
        }
        return records;
    } finally {
        database.close();
    }
}

async function deleteLocalMediaRecords(urlOrIds: string[]): Promise<void> {
    const ids = urlOrIds.map(getLocalMediaId).filter((id): id is string => id !== null);
    if (ids.length === 0) {
        return;
    }

    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const transactionDone = transactionToPromise(transaction);
        const store = transaction.objectStore(STORE_NAME);
        await Promise.all(ids.map((id) => requestToPromise(store.delete(id))));
        await transactionDone;
    } finally {
        database.close();
    }
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onerror = () => {
            reject(request.error || new Error('Unable to open local media database.'));
        };
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onerror = () => {
            reject(request.error || new Error('Local media database request failed.'));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.onerror = () => {
            reject(transaction.error || new Error('Local media database transaction failed.'));
        };
        transaction.onabort = () => {
            reject(transaction.error || new Error('Local media database transaction aborted.'));
        };
        transaction.oncomplete = () => {
            resolve();
        };
    });
}
