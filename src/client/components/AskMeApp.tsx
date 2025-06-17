import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useStdin, useInput } from 'ink';
import { AskMeAppProps, ImageAttachment } from '../../shared/types/index.js';
import { useExitProtection } from '../hooks/useExitProtection.js';
import { sendAskMeToSocket } from '../../shared/utils/socket.js';
import { MultiLineTextInput } from './MultiLineTextInput.js';
import { HelpPanel } from './HelpPanel.js';
import { SimpleMarkdown } from './SimpleMarkdown.js';

export const AskMeApp: React.FC<AskMeAppProps> = ({
    message = "Please enter your next plan or confirm:",
    socketPath = null
}) => {
    const [askMe, setAskMe] = useState<string>('');
    const [images, setImages] = useState<ImageAttachment[]>([]);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [isProcessingPaste, setIsProcessingPaste] = useState<boolean>(false);
    const { exit } = useApp();
    const { isRawModeSupported } = useStdin();

    useExitProtection();

    // Handle ESC key to hide help panel
    useInput((input, key) => {
        if (key.escape && showHelp) {
            setShowHelp(false);
            setAskMe(''); // Clear ask me to prevent re-showing help
        }
    });

    const handleSubmit = async (value: string, images?: ImageAttachment[]): Promise<void> => {
        if (socketPath) {
            await sendAskMeToSocket(socketPath, value, images);
        }
        setIsSubmitted(true);
        exit();
    };

    if (isSubmitted) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="green">✅ Successfully submitted!</Text>
            </Box>
        );
    }

    if (!isRawModeSupported) {
        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Text color="cyan" bold>📋 ASKME-CLI User Confirmation</Text>
                </Box>

                <Box marginBottom={1}>
                    <SimpleMarkdown>{message}</SimpleMarkdown>
                </Box>

                <Box flexDirection="column" borderStyle="round" borderColor="red" padding={1}>
                    <Text color="red">⚠️ TTY mode not supported, cannot receive keyboard input</Text>
                    <Text color="yellow">Please run this program in a real terminal</Text>
                    <Text color="gray">Or use the readline version of user confirmation collector</Text>
                </Box>

                <Box marginTop={1}>
                    <Text color="gray" dimColor>Press Ctrl+C to exit</Text>
                </Box>
            </Box>
        );
    }

    if (showHelp) {
        return (
            <Box flexDirection="column" padding={1}>
                <HelpPanel visible={true} />
                <Box justifyContent="center" marginTop={1}>
                    <Text color="gray" >Press ESC to exit help</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text color="cyan" bold>Ask User Confirmation</Text>
            </Box>

            <Box marginBottom={2}>
                <SimpleMarkdown>{message}</SimpleMarkdown>
            </Box>

            <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
                <MultiLineTextInput
                    value={askMe}
                    onChange={(newValue) => {
                        setAskMe(newValue);
                        if (newValue.trim() === '/help') {
                            setShowHelp(true);
                        }
                    }}
                    onSubmit={handleSubmit}
                    placeholder="Type your plan or confirmation here..."
                    images={images}
                    onImagesChange={setImages}
                    onProcessingStateChange={setIsProcessingPaste}
                />
            </Box>

            {/* Help text and enter tip - conditional display */}
                    <Box  marginLeft={1}>
                {!askMe.trim() && (
                    <Text color="cyan" dimColor>/help get help</Text>
                )}
                {askMe.trim() && (
                    <Text color="gray">• Double Enter to submit</Text>
                )}
            </Box>

            {/* Image display box outside and below input box */}
            {images.length > 0 && (
                <Box marginTop={1} marginLeft={2} flexDirection="column">
                    {images.map((image) => (
                        <Text key={image.id} color="green">
                            • {image.placeholder} ({Math.round(image.size / 1024)}KB, {image.mimeType})
                        </Text>
                    ))}
                </Box>
            )}

            {/* Processing paste status indicator displayed below input box */}
            {isProcessingPaste && (
                <Box marginTop={1} marginLeft={2}>
                    <Text color="yellow">⏳ Processing...</Text>
                </Box>
            )}


            {/* Help panel also moved below input box */}
            <HelpPanel visible={showHelp} />
        </Box>
    );
}; 