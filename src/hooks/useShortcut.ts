import * as GlobalShortcut from '@tauri-apps/plugin-global-shortcut';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { getSettings} from '../store/settings';

type ShortcutTriggerState = {
id: number;
shortcut: string;
state: "Pressed" | "Released";
};

export function useShortcut() {
    const register = async (shortcut: string, callback: () => void): Promise<void> => {
        try {
            const registered = await GlobalShortcut.isRegistered(shortcut);
            if (registered) {
                console.log('Shortcut already registered:', shortcut);
                throw new Error('快捷键已被占用，请选择其他快捷键');
            }
            await GlobalShortcut.register(shortcut, ({state}:ShortcutTriggerState) => {
                if (state === "Pressed") return;
                callback();
            });

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const unregister = async (shortcut: string): Promise<void> => {
        try {
            const registered = await GlobalShortcut.isRegistered(shortcut);
            if (registered) {
                await GlobalShortcut.unregister(shortcut);
                console.log('Unregistered shortcut:', shortcut);
            }
        } catch (error) {
            console.error('Failed to unregister shortcut:', error);
        }
    };

    const initShortcut = async (): Promise<void> => {
        try {
            const settings = await getSettings();

            const toggleShortcut = settings.drawing?.toggleShortcut || 'Alt+1';
            await register(toggleShortcut, async () => {
                await invoke('trigger_drawing_mode');
            });

            const toolbarShortcut = settings.drawing?.toolbarShortcut || 'Alt+H';
            await register(toolbarShortcut, async () => {
                await emit('toolbar-visibility-toggled');
            });

            const toggleAndClearShortcut = settings.drawing?.toggleAndClearShortcut || 'Alt+`';
            await register(toggleAndClearShortcut, async () => {
                await emit('trigger-clear-canvas');
                await invoke('trigger_drawing_mode');
            });
        } catch (error) {
            console.error('Failed to initialize shortcut:', error);
        }
    };

    return { initShortcut, register, unregister };
}

