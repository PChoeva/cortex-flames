import { writable } from 'svelte/store';

type ModalOptions = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    confirmColor?: 'red' | 'blue' | 'green';
};

type ModalState = {
    isOpen: boolean;
    options: ModalOptions | null;
    resolve: ((value: boolean) => void) | null;
};

function createModalStore() {
    const { subscribe, set, update } = writable<ModalState>({
        isOpen: false,
        options: null,
        resolve: null
    });

    return {
        subscribe,
        show: (options: ModalOptions): Promise<boolean> => {
            return new Promise(resolve => {
                set({
                    isOpen: true,
                    options,
                    resolve
                });
            });
        },
        close: (confirmed: boolean) => {
            update((state: ModalState): ModalState => {
                if (state.resolve) {
                    state.resolve(confirmed);
                }
                return {
                    isOpen: false,
                    options: null,
                    resolve: null
                };
            });
        }
    };
}

export const modalDialog = createModalStore(); 