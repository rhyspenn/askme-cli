import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { MultiLineTextInputProps, CursorPosition, ImageAttachment } from '../../shared/types/index.js';
import { createClipboardManager } from '../../shared/utils/clipboard.js';
import { createImageAttachment, insertImagePlaceholder } from '../../shared/utils/image.js';

// Custom multi-line text input component
export const MultiLineTextInput: React.FC<MultiLineTextInputProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "",
    images,
    onImagesChange,
    onProcessingStateChange
}) => {
    const [cursor, setCursor] = useState<number>(0);
    const [composition, setComposition] = useState<string>(''); // IME candidates
    const [lastEnterTime, setLastEnterTime] = useState<number>(0);
    const [isProcessingPaste, setIsProcessingPaste] = useState<boolean>(false);

    // Clean up deleted image placeholders when text changes (but not during paste operations)
    useEffect(() => {
        // Skip cleanup during paste operations to avoid conflicts
        if (isProcessingPaste || images.length === 0) return;

        // Find all image placeholders currently in the text
        const placeholderRegex = /\[Image #\d+\]/g;
        const currentPlaceholders: string[] = value.match(placeholderRegex) || [];

        // Check if any images have been removed from the text
        const validImages = images.filter(image =>
            currentPlaceholders.includes(image.placeholder)
        );

        // Update images array only if any were removed
        if (validImages.length < images.length) {
            console.log('🧹 Cleaning up removed images:', images.length, '->', validImages.length);
            onImagesChange(validImages);
        }
    }, [value]); // Only depend on value, not images, to avoid recursion

    // Calculate cursor position (Unicode character safe)
    const getCursorPosition = (): CursorPosition => {
        const beforeCursor = value.slice(0, cursor);
        const lines = beforeCursor.split('\n');
        const row = lines.length - 1;
        const col = Array.from(lines[lines.length - 1]).length;
        return { row, col };
    };

    // Handle paste operation (images or text)
    const handlePasteOperation = async (): Promise<void> => {
        if (isProcessingPaste) return;

        setIsProcessingPaste(true);
        onProcessingStateChange?.(true);

        try {
            const clipboardManager = createClipboardManager();

            // First check if there are images
            const hasImage = await clipboardManager.hasImage();

            if (hasImage) {
                const imageBuffer = await clipboardManager.getImage();
                if (imageBuffer) {
                    // Create image attachment
                    const imageAttachment = createImageAttachment(imageBuffer, images);

                    // Insert placeholder at cursor position
                    const { newText, newCursorPosition } = insertImagePlaceholder(
                        value,
                        cursor,
                        imageAttachment.placeholder
                    );

                    // First update image array, then update text, finally update cursor position
                    onImagesChange([...images, imageAttachment]);

                    // Use setTimeout to ensure image is added first, then update text
                    setTimeout(() => {
                        onChange(newText);
                        setCursor(newCursorPosition);
                    }, 0);
                } else {
                    console.log('\n❌ Cannot get clipboard image');
                }
            } else {
                // If no image, try to get text
                const text = await clipboardManager.getText();
                if (text) {
                    const beforeCursor = value.slice(0, cursor);
                    const afterCursor = value.slice(cursor);
                    const newValue = beforeCursor + text + afterCursor;
                    const newCursorPosition = cursor + text.length;

                    onChange(newValue);
                    setCursor(newCursorPosition);
                } else {
                    console.log('\n💡 Clipboard is empty or no pasteable content');
                }
            }
        } catch (error) {
            console.error('\n❌ Paste operation failed:', (error as Error).message);
        } finally {
            setIsProcessingPaste(false);
            onProcessingStateChange?.(false);
        }
    };

    // Render multi-line text with cursor and IME candidates
    const renderTextWithCursor = () => {
        const displayValue = value + composition; // Include candidate text

        if (displayValue === '') {
            const { row, col } = getCursorPosition();
            const formattedPlaceholder = placeholder
                .replace(/\t/g, '    ')
                .replace(/ /g, ' ');
            const placeholderChars = Array.from(formattedPlaceholder);
            return (
                <Text color="gray">
                    {placeholderChars.slice(0, col).join('')}
                    <Text backgroundColor="white" color="black">
                        {placeholderChars[col] || ' '}
                    </Text>
                    {placeholderChars.slice(col + 1).join('')}
                </Text>
            );
        }

        const lines = displayValue.split('\n');
        const actualCursor = cursor + composition.length;
        const beforeCursor = displayValue.slice(0, actualCursor);
        const cursorLines = beforeCursor.split('\n');
        const cursorRow = cursorLines.length - 1;
        const cursorCol = Array.from(cursorLines[cursorLines.length - 1]).length;

        return lines.map((line, lineIndex) => {
            // Format line text, maintain tabs and spaces
            const formatLine = (text: string) => {
                return text
                    .replace(/\t/g, '    ') // Convert tabs to 4 spaces for display
                    .replace(/ /g, ' '); // Ensure spaces are displayed correctly
            };

            if (lineIndex === cursorRow) {
                // Current line, show blinking cursor
                const formattedLine = formatLine(line);
                const lineChars = Array.from(formattedLine);
                return (
                    <Text key={lineIndex}>
                        {lineChars.slice(0, cursorCol).join('')}
                        {composition && (
                            <Text color="yellow" backgroundColor="gray">
                                {composition}
                            </Text>
                        )}
                        <Text backgroundColor="white" color="black">
                            {lineChars[cursorCol] || ' '}
                        </Text>
                        {lineChars.slice(cursorCol + 1).join('')}
                    </Text>
                );
            } else {
                // Other lines, display normally, maintain formatting
                const formattedLine = formatLine(line);
                return (
                    <Text key={lineIndex}>
                        {formattedLine || ' '}
                    </Text>
                );
            }
        });
    };

    useInput((input, key) => {

        if (key.ctrl && input === 'c') {
            process.exit(0);
        }

        // Handle copy/paste (Cmd+V on macOS, Ctrl+V on others)
        if ((key.meta && input === 'v') || (key.ctrl && input === 'v')) {
            handlePasteOperation();
            return;
        }

        // Handle ESC key
        if (key.escape) {
            return;
        }

        // Handle Emacs-style cursor movement shortcuts
        if (key.ctrl) {
            switch (input) {
                case 'f': // Ctrl+F - move right one character
                    if (cursor < value.length) {
                        const afterCursor = value.slice(cursor);
                        const charArray = Array.from(afterCursor);
                        const nextChar = charArray[0] || '';
                        setCursor(cursor + nextChar.length);
                    }
                    return;

                case 'b': // Ctrl+B - move left one character
                    if (cursor > 0) {
                        const beforeCursor = value.slice(0, cursor);
                        const charArray = Array.from(beforeCursor);
                        setCursor(charArray.slice(0, -1).join('').length);
                    }
                    return;

                case 'p': // Ctrl+P - move up one line
                    const beforeCursor = value.slice(0, cursor);
                    const lines = beforeCursor.split('\n');
                    if (lines.length > 1) {
                        const currentLinePos = Array.from(lines[lines.length - 1]).length;
                        const prevLine = lines[lines.length - 2];
                        const prevLineLength = Array.from(prevLine).length;
                        const newPos = Math.min(currentLinePos, prevLineLength);

                        const newLineStart = beforeCursor.lastIndexOf('\n', beforeCursor.lastIndexOf('\n') - 1) + 1;
                        const newCursorPos = newLineStart + Array.from(prevLine.slice(0, newPos)).join('').length;
                        setCursor(newCursorPos);
                    }
                    return;

                case 'n': // Ctrl+N - move down one line
                    const remainingText = value.slice(cursor);
                    const nextNewlineIndex = remainingText.indexOf('\n');
                    if (nextNewlineIndex !== -1) {
                        const beforeCursorForDown = value.slice(0, cursor);
                        const linesForDown = beforeCursorForDown.split('\n');
                        const currentLinePosForDown = Array.from(linesForDown[linesForDown.length - 1]).length;

                        const nextLineStart = cursor + nextNewlineIndex + 1;
                        const nextLineEnd = value.indexOf('\n', nextLineStart);
                        const nextLine = value.slice(nextLineStart, nextLineEnd === -1 ? undefined : nextLineEnd);
                        const nextLineLength = Array.from(nextLine).length;
                        const newPos = Math.min(currentLinePosForDown, nextLineLength);

                        setCursor(nextLineStart + Array.from(nextLine.slice(0, newPos)).join('').length);
                    }
                    return;

                case 'a': // Ctrl+A - move to line beginning
                    const beforeCursorForLineStart = value.slice(0, cursor);
                    const linesForLineStart = beforeCursorForLineStart.split('\n');
                    const currentLineStart = beforeCursorForLineStart.lastIndexOf('\n') + 1;
                    setCursor(currentLineStart);
                    return;

                case 'e': // Ctrl+E - move to line end
                    const afterCursorForLineEnd = value.slice(cursor);
                    const nextNewlineForLineEnd = afterCursorForLineEnd.indexOf('\n');
                    if (nextNewlineForLineEnd === -1) {
                        // Last line, move to text end
                        setCursor(value.length);
                    } else {
                        // Move to current line end
                        setCursor(cursor + nextNewlineForLineEnd);
                    }
                    return;

                case 'l': // Ctrl+L - clear input
                    onChange('');
                    setCursor(0);
                    return;
            }
        }

        // Handle Enter key - double click to submit, Shift+Enter for newline
        if (key.return) {
            // Shift+Enter forces newline
            if (key.shift) {
                const newValue = value.slice(0, cursor) + '\n' + value.slice(cursor);
                onChange(newValue);
                setCursor(cursor + 1);
                return;
            }

            // Double Enter to submit
            const now = Date.now();
            if (now - lastEnterTime < 500) { // Double click within 500ms
                if (value.trim()) {
                    // Filter images to only include those referenced in the text
                    const placeholderRegex = /\[Image #\d+\]/g;
                    const currentPlaceholders: string[] = value.match(placeholderRegex) || [];
                    const validImages = images.filter(image =>
                        currentPlaceholders.includes(image.placeholder)
                    );

                    onSubmit(value.trim(), validImages.length > 0 ? validImages : undefined);
                }
                return;
            }
            setLastEnterTime(now);

            // Single Enter for newline
            const newValue = value.slice(0, cursor) + '\n' + value.slice(cursor);
            onChange(newValue);
            setCursor(cursor + 1);
            return;
        }

        // Handle backspace/delete
        if (key.backspace || key.delete) {
            if (cursor > 0) {
                // Correctly handle Unicode characters (including Chinese)
                const beforeCursor = value.slice(0, cursor);
                const charArray = Array.from(beforeCursor);
                const newBeforeCursor = charArray.slice(0, -1).join('');
                const newValue = newBeforeCursor + value.slice(cursor);
                onChange(newValue);
                setCursor(newBeforeCursor.length);
            }
            return;
        }

        // Handle arrow keys
        if (key.leftArrow) {
            if (cursor > 0) {
                // Correctly handle Unicode character boundaries
                const beforeCursor = value.slice(0, cursor);
                const charArray = Array.from(beforeCursor);
                setCursor(charArray.slice(0, -1).join('').length);
            }
            return;
        }
        if (key.rightArrow) {
            if (cursor < value.length) {
                // Correctly handle Unicode character boundaries
                const afterCursor = value.slice(cursor);
                const charArray = Array.from(afterCursor);
                const nextChar = charArray[0] || '';
                setCursor(cursor + nextChar.length);
            }
            return;
        }
        if (key.upArrow) {
            // Move up to previous line
            const beforeCursor = value.slice(0, cursor);
            const lines = beforeCursor.split('\n');
            if (lines.length > 1) {
                const currentLinePos = Array.from(lines[lines.length - 1]).length;
                const prevLine = lines[lines.length - 2];
                const prevLineLength = Array.from(prevLine).length;
                const newPos = Math.min(currentLinePos, prevLineLength);

                // Calculate new cursor position
                const newLineStart = beforeCursor.lastIndexOf('\n', beforeCursor.lastIndexOf('\n') - 1) + 1;
                const newCursorPos = newLineStart + Array.from(prevLine.slice(0, newPos)).join('').length;
                setCursor(newCursorPos);
            }
            return;
        }
        if (key.downArrow) {
            // Move down to next line
            const remainingText = value.slice(cursor);
            const nextNewlineIndex = remainingText.indexOf('\n');
            if (nextNewlineIndex !== -1) {
                const beforeCursor = value.slice(0, cursor);
                const lines = beforeCursor.split('\n');
                const currentLinePos = Array.from(lines[lines.length - 1]).length;

                const nextLineStart = cursor + nextNewlineIndex + 1;
                const nextLineEnd = value.indexOf('\n', nextLineStart);
                const nextLine = value.slice(nextLineStart, nextLineEnd === -1 ? undefined : nextLineEnd);
                const nextLineLength = Array.from(nextLine).length;
                const newPos = Math.min(currentLinePos, nextLineLength);

                setCursor(nextLineStart + Array.from(nextLine.slice(0, newPos)).join('').length);
            }
            return;
        }

        // Handle printable characters (including Chinese and special characters)
        if (input && input.length > 0 && !key.ctrl && !key.meta) {
            // Handle pasted multi-line text, maintain original formatting
            let processedInput = input;

            // If input contains newlines, it might be pasted text
            if (input.includes('\n') || input.includes('\r')) {
                // Maintain newlines, normalize to \n
                processedInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            }

            // Maintain tabs and multiple spaces
            const newValue = value.slice(0, cursor) + processedInput + value.slice(cursor);
            onChange(newValue);
            setCursor(cursor + processedInput.length);
        }
    });

    return (
        <Box flexDirection="column">
            {renderTextWithCursor()}
        </Box>
    );
}; 