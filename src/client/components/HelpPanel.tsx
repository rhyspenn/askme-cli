import React from 'react';
import { Box, Text } from 'ink';

interface HelpPanelProps {
    visible: boolean;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ visible }) => {
    if (!visible) {
        return <Box />;
    }

    return (
        <Box marginTop={1} borderStyle="round" borderColor="yellow" padding={1} flexDirection="column">
            <Text color="yellow" bold>⌘ Keyboard Shortcuts:</Text>
            <Text></Text>
            <Text color="green" >• Double Enter - Submit plan/confirmation</Text>
            <Text color="green" >• Enter / Shift+Enter - New line</Text>
            <Text color="green" >• Ctrl+L - Clear input</Text>
            <Text color="green" >• Ctrl+V - Paste (text/image)</Text>
            <Text color="red">• Ctrl+C - Cancel and exit</Text>
            <Text></Text>
            <Text color="cyan">➡︎ Navigation</Text>
            <Text color="white">• Ctrl+F/B - Move left/right</Text>
            <Text color="white">• Ctrl+P/N - Move up/down</Text>
            <Text color="white">• Ctrl+A/E - Line start/end</Text>
            <Text></Text>
        </Box>
    );
}; 