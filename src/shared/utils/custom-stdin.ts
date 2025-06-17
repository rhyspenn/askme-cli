import { EventEmitter } from 'events';

// Create custom stdin class to simulate TTY behavior
export class CustomStdin extends EventEmitter {
    public isTTY: boolean = true;
    private isRaw: boolean = false;

    constructor() {
        super();
    }

    setRawMode(mode: boolean): this {
        this.isRaw = mode;
        return this;
    }

    setEncoding(): this {
        return this;
    }

    resume(): this {
        return this;
    }

    pause(): this {
        return this;
    }

    write(data: string): boolean {
        this.emit('data', data);
        return true;
    }

    simulateKeypress(key: string): void {
        this.emit('data', key);
    }
} 