'use client';

import type { ToastMessage } from './toasts.type';

export const TOAST_EVENT = 'app::toast-event';

export const sendToast = (toastMessage: ToastMessage) => {
    document.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: toastMessage }));
};
