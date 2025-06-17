import { useEffect } from 'react';
import { DELAYS } from '../../shared/utils/constants.js';

// Setup process exit protection
export const useExitProtection = (): void => {
    useEffect(() => {
        let forceExitTimer: NodeJS.Timeout | undefined;

        const handleExit = (): void => {
            forceExitTimer = setTimeout(() => {
                process.exit(0);
            }, DELAYS.EXIT_PROTECTION);
        };

        const signals = ['SIGTERM', 'SIGINT', 'SIGHUP'] as const;
        signals.forEach(signal => process.on(signal, handleExit));

        return () => {
            if (forceExitTimer) {
                clearTimeout(forceExitTimer);
            }
            signals.forEach(signal => process.removeListener(signal, handleExit));
        };
    }, []);
}; 