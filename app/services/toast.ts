import { showToast as originalShowToast } from 'nextjs-toast-notify';

function dismissSimilarToasts(message: string) {
    if (typeof document === 'undefined') return;
    
    const msgLower = message.toLowerCase();
    let typeKey = '';
    
    if (msgLower.includes('agregad')) {
        typeKey = 'agregacion';
    } else if (msgLower.includes('eliminad') || msgLower.includes('eliminar') || msgLower.includes('no se puede')) {
        typeKey = 'eliminacion';
    } else if (msgLower.includes('exportad')) {
        typeKey = 'exportacion';
    } else {
        typeKey = 'other';
    }

    const existingToasts = document.querySelectorAll('.toast-nextjs');
    existingToasts.forEach((toast) => {
        const toastText = toast.textContent?.toLowerCase() || '';
        let toastTypeKey = '';
        
        if (toastText.includes('agregad')) {
            toastTypeKey = 'agregacion';
        } else if (toastText.includes('eliminad') || toastText.includes('eliminar') || toastText.includes('no se puede')) {
            toastTypeKey = 'eliminacion';
        } else if (toastText.includes('exportad')) {
            toastTypeKey = 'exportacion';
        } else {
            toastTypeKey = 'other';
        }

        if (toastTypeKey === typeKey && typeKey !== 'other') {
            toast.remove();
        }
    });
}

export const showToast = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: (message: string, options?: any) => {
        dismissSimilarToasts(message);
        originalShowToast.success(message, options);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message: string, options?: any) => {
        dismissSimilarToasts(message);
        originalShowToast.error(message, options);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message: string, options?: any) => {
        dismissSimilarToasts(message);
        originalShowToast.info(message, options);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warning: (message: string, options?: any) => {
        dismissSimilarToasts(message);
        originalShowToast.warning(message, options);
    }
};
