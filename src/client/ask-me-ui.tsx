#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { AskMeApp } from './components/AskMeApp.js';
import { CustomStdin } from '../shared/utils/custom-stdin.js';

// Get message and socket path from command line arguments
const message: string = process.argv[2] || "Please enter your next plan or confirmation:";
const socketPath: string | null = process.argv[3] || null;

// Check if raw mode is supported
const isRawModeSupported: boolean = !!(process.stdin.isTTY && typeof process.stdin.setRawMode === 'function');

if (isRawModeSupported) {
    render(<AskMeApp message={message} socketPath={socketPath} />);
} else {
    const customStdin = new CustomStdin();

    render(<AskMeApp message={message} socketPath={socketPath} />, {
        stdin: customStdin as any,
        stdout: process.stdout,
        stderr: process.stderr
    });

    // Listen to real stdin input and forward to custom stdin
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data: string) => {
        customStdin.simulateKeypress(data);
    });

    // Ensure stdin is in the correct mode
    if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
    }
    process.stdin.resume();
} 