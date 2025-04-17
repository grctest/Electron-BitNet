import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadIcon, ReloadIcon, PaperPlaneIcon, StopIcon, PauseIcon, ClipboardCopyIcon, CheckIcon, EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import ReactMarkdown from 'react-markdown';
// Import SyntaxHighlighter and a style (e.g., atomDark)
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Or choose another style

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import ExternalLink from "@/components/ExternalLink.jsx";
import HoverInfo from "@/components/HoverInfo.jsx";

// Custom Code Renderer for ReactMarkdown
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const { t } = useTranslation(locale.get(), { i18n: i18nInstance }); // Added for translation
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\\n$/, ''); // Remove trailing newline
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            // Optionally show an error state to the user
        });
    };

    return !inline ? (
        <div className="my-2 relative group"> {/* Added group for hover effect */}
            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 z-10 p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ${copied ? 'opacity-100' : ''}`}
                title={copied ? t('InstructionModel:copied') : t('InstructionModel:copyCode')} // Use translation
                aria-label={copied ? t('InstructionModel:copied') : t('InstructionModel:copyCode')} // Use translation
            >
                {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardCopyIcon className="h-4 w-4" />}
            </button>
            <SyntaxHighlighter
                style={atomDark} // Apply the chosen style
                language={match ? match[1] : 'text'} // Detect language or default to text
                PreTag="div" // Use div instead of pre to avoid nesting issues
                className="rounded border border-border bg-muted/50 p-3 pt-8 text-sm overflow-x-auto" // Added pt-8 for button space, overflow-x-auto
                {...props}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className={`bg-muted/80 px-1 py-0.5 rounded text-sm ${className}`} {...props}>
            {children}
        </code>
    );
};


// Simple component to render chat messages
function ChatMessage({ sender, message, timestamp, onRegenerate, canRegenerate, isFirstAiMessage }) {
    const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
    const isUser = sender === 'user';
    const senderName = isUser ? t("InstructionModel:you") : t("InstructionModel:ai");
    const avatarText = isUser ? '🤔' : '🤖';

    const [copied, setCopied] = useState(false);
    // Collapse only the first AI message by default
    const [collapsed, setCollapsed] = useState(!isUser && isFirstAiMessage);

    const handleCopy = () => {
        navigator.clipboard.writeText(message).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Format timestamp (HH:MM)
    const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    const iconButtonStyle = "rounded-full bg-muted p-2 hover:bg-primary/20 transition-colors border border-border flex items-center justify-center";
    const iconButtonSize = { width: 32, height: 32 };

    return (
        <div className={`flex flex-col items-${isUser ? 'end' : 'start'} gap-1 p-3`}>
            {/* Main message row */}
            <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''} w-full`}>
                {/* Avatar (AI) */}
                {!isUser && (
                    <Avatar className="w-8 h-8 border mt-1">
                        <AvatarFallback>{avatarText}</AvatarFallback>
                    </Avatar>
                )}
                {/* Message Bubble */}
                <div
                    className={`rounded-lg p-3 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} transition-all duration-300 ease-in-out ${!isUser ? 'max-w-screen-md break-words' : ''}`}
                    style={{ maxWidth: !isUser ? '600px' : '80%' }} // 600px is a good readable width
                >
                    <p className="font-semibold mb-1">{senderName}</p>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message}</p>
                    ) : (
                        <div
                            className={`prose prose-sm dark:prose-invert max-w-none overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}
                        >
                            <ReactMarkdown components={{ code: CodeBlock }}>
                                {message}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                {/* Avatar (User) */}
                {isUser && (
                    <Avatar className="w-8 h-8 border mt-1">
                        <AvatarFallback>{avatarText}</AvatarFallback>
                    </Avatar>
                )}
            </div>

            {/* Timestamp and Action Buttons Row (AI only) */}
            {!isUser && (
                <div className="flex justify-between items-center w-full mt-1 px-10">
                    {/* Timestamp (Left Aligned) */}
                    <span className="text-xs text-muted-foreground">{formattedTime}</span>

                    {/* Action Buttons (Right Aligned) */}
                    <div className="flex items-center space-x-2">
                        {/* Collapse/Expand Button */}
                        <button
                            className={iconButtonStyle}
                            title={collapsed ? t('InstructionModel:expand') : t('InstructionModel:collapse')}
                            onClick={toggleCollapse}
                            style={iconButtonSize}
                        >
                            {collapsed ? <EyeClosedIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
                        </button>
                        {/* Copy Button */}
                        <button
                            className={iconButtonStyle}
                            title={copied ? t('InstructionModel:copied') : t('InstructionModel:copy')}
                            onClick={handleCopy}
                            style={iconButtonSize}
                            disabled={copied}
                        >
                            {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                        </button>
                        {/* Regenerate Button */}
                        {canRegenerate && (
                             <button
                                className={iconButtonStyle}
                                title={t('InstructionModel:regenerate')}
                                onClick={onRegenerate}
                                style={iconButtonSize}
                            >
                                <ReloadIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
             {/* Timestamp for User messages */}
             {isUser && (
                 <div className="flex justify-end w-full mt-1 px-10">
                     <span className="text-xs text-muted-foreground">{formattedTime}</span>
                 </div>
             )}
        </div>
    );
}


export default function InstructionModel(properties) {
    const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

    // --- Model & Settings State ---
    const [tokenQuantity, setTokenQuantity] = useState(512);
    const [model, setModel] = useState("");
    const [threads, setThreads] = useState(2);
    const [ctxSize, setCtxSize] = useState(2048);
    const [temperature, setTemperature] = useState(0.7);
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
    const [maxThreads, setMaxThreads] = useState(2);

    // --- Chat State ---
    const [conversationActive, setConversationActive] = useState(false);
    const [isAiResponding, setIsAiResponding] = useState(false);
    // Update chat history structure to include timestamp
    const [chatHistory, setChatHistory] = useState([]); // Array of { sender: 'user' | 'ai', message: string, timestamp: Date }
    const [currentUserInput, setCurrentUserInput] = useState("");
    const chatScrollAreaRef = useRef(null);
    const inputRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        if (!window.electron) return;
        async function getMaxThreads() {
            const _maxThreads = await window.electron.getMaxThreads();
            setMaxThreads(_maxThreads);
            // Set default threads to a reasonable value based on maxThreads
            setThreads(Math.max(1, Math.min(4, Math.floor(_maxThreads / 2))));
        }
        getMaxThreads();
    }, []);

    // Scroll to bottom when chat history updates
    useEffect(() => {
        const scrollViewport = chatScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }, [chatHistory]);

    // Refocus input after AI finishes
    useEffect(() => {
        if (!isAiResponding && conversationActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAiResponding, conversationActive]);

    // Setup IPC listeners
    useEffect(() => {
        if (!window.electron) return;

        const removeAiInstructStarted = window.electron.onAiInstructStarted(() => {
            console.log("Instruction mode started by backend.");
            setConversationActive(true);
            setIsAiResponding(true);
        });

        const removeAiResponseChunk = window.electron.onAiResponseChunk((chunk) => {
            setIsAiResponding(true);
            setChatHistory((prevHistory) => {
                const lastMessage = prevHistory[prevHistory.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    // Append to existing AI message (timestamp remains the same)
                    return prevHistory.map((msg, index) =>
                        index === prevHistory.length - 1
                            ? { ...msg, message: msg.message + chunk }
                            : msg
                    );
                } else {
                    // Start new AI message with timestamp
                    return [...prevHistory, { sender: 'ai', message: chunk, timestamp: new Date() }];
                }
            });

            // Basic check if the AI is waiting for input
            if (chunk.trim().endsWith('>')) {
                 setIsAiResponding(false);
                 // Clean up the prompt indicator
                 setChatHistory((prevHistory) => {
                    const lastMessage = prevHistory[prevHistory.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                        return prevHistory.map((msg, index) =>
                            index === prevHistory.length - 1
                                ? { ...msg, message: msg.message.replace(/>\s*$/, '').trimEnd() }
                                : msg
                        );
                    }
                    return prevHistory;
                 });
            }
        });

        const removeAiError = window.electron.onAiError((errorMsg) => {
            // Add error message with timestamp
            setChatHistory((prev) => [...prev, { sender: 'ai', message: `Error: ${errorMsg}`, timestamp: new Date() }]);
            setConversationActive(false);
            setIsAiResponding(false);
        });

        const removeAiInstructComplete = window.electron.onAiInstructComplete(() => {
            console.log("Instruction mode completed/terminated by backend.");
            setConversationActive(false);
            setIsAiResponding(false);
            // Check if the last message was only the prompt indicator
             setChatHistory((prevHistory) => {
                const lastMessage = prevHistory[prevHistory.length - 1];
                if (lastMessage && lastMessage.sender === 'ai' && lastMessage.message.trim() === '>') {
                    return prevHistory.slice(0, -1);
                }
                return prevHistory;
             });
        });

        // Cleanup listeners on component unmount
        return () => {
            removeAiInstructStarted();
            removeAiResponseChunk();
            removeAiError();
            removeAiInstructComplete();
            // Ensure process is stopped if component unmounts while active
            if (conversationActive && window.electron) {
                window.electron.stopInference();
            }
        };
    }, [conversationActive]); // Rerun if conversationActive changes to ensure cleanup works correctly

    // --- Handlers ---
    const handleFileSelect = async () => {
        if (conversationActive) return; // Don't change model mid-conversation
        const filePaths = await window.electron.openFileDialog();
        if (filePaths.length > 0) {
            setModel(filePaths[0]);
        }
    };

    const handleStartConversation = () => {
        if (!model || !systemPrompt || conversationActive) return;
        setChatHistory([]); // Clear previous chat
        setIsAiResponding(true); // Expecting initial output/processing
        window.electron.initInstructInference({
            model,
            n_predict: tokenQuantity,
            threads,
            prompt: systemPrompt, // Use system prompt for initialization
            ctx_size: ctxSize,
            temperature,
        });
        // Note: setConversationActive(true) will be handled by onAiInstructStarted listener
    };

    const handleStopConversation = () => {
        if (!conversationActive) return;
        window.electron.stopInference();
        setChatHistory([]); // Clear chat log when stopping conversation
        // Note: setConversationActive(false) will be handled by onAiInstructComplete listener
    };

    const handleInterject = () => {
        if (!conversationActive || !isAiResponding) return;
        console.log('Attempting to interject AI response...');
        window.electron.interjectInference();
        // Note: We don't immediately set isAiResponding to false here.
        // We wait for the backend/llama-cli to confirm interruption,
        // potentially via a specific event or by seeing the '>' prompt again
        // in onAiResponseChunk.
    };

    const handleSendUserMessage = useCallback(() => {
        if (!conversationActive || isAiResponding || !currentUserInput.trim()) return;

        const trimmedInput = currentUserInput.trimEnd();
        let messageToSend = trimmedInput;
        let textToWrite = '';

        if (trimmedInput.endsWith('\\')) {
            // Multi-line input: send line without '\' but with newline
            textToWrite = trimmedInput.slice(0, -1) + '\n';
            messageToSend = trimmedInput.slice(0, -1); // Store message without trailing slash
        } else if (trimmedInput.endsWith('/')) {
            // Send without newline: send line without '/'
            textToWrite = trimmedInput.slice(0, -1);
            messageToSend = trimmedInput.slice(0, -1); // Store message without trailing slash
        } else {
            // Standard input: send line with newline
            textToWrite = trimmedInput + '\n';
        }

        // Add user message with timestamp
        setChatHistory((prev) => [...prev, { sender: 'user', message: messageToSend, timestamp: new Date() }]);
        setCurrentUserInput("");
        setIsAiResponding(true); // Expect AI response (or prompt)
        window.electron.sendInstructPrompt(textToWrite); // Send the processed text

    }, [conversationActive, isAiResponding, currentUserInput]);

    // Handle Enter key press in the input area
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default newline insertion
            handleSendUserMessage();
        }
    };

    // Regenerate handler - Refactored
    const handleRegenerate = (aiMessageIndex) => {
        if (!conversationActive || isAiResponding) return;

        // Find the index of the last user message *before* the AI message being regenerated
        const userMessageIndex = chatHistory.slice(0, aiMessageIndex).findLastIndex(msg => msg.sender === 'user');

        if (userMessageIndex !== -1) {
            const userPromptMessage = chatHistory[userMessageIndex];
            const userPromptText = userPromptMessage.message; // This is the message as stored (without trailing / or \)

            // Reset history to include only messages up to and including the triggering user prompt
            setChatHistory((prev) => prev.slice(0, userMessageIndex + 1));

            setIsAiResponding(true);

            // Resend the user prompt. Assume standard newline addition.
            // The original special handling (\, /) was for the *initial* send.
            // When regenerating, we just resend the core prompt text.
            // The backend instruction loop should handle adding the newline if needed.
            // If the backend *requires* the newline explicitly, add it here.
            const textToWrite = userPromptText + '\\n'; // Send with newline

            window.electron.sendInstructPrompt(textToWrite);
        } else {
            console.error("Could not find the preceding user message to regenerate from.");
            // Optionally, inform the user that regeneration isn't possible for this message.
            // e.g., using a toast notification.
        }
    };

    // --- Render ---
    const canStart = model && systemPrompt && !conversationActive;
    let firstAiIndex = -1;
    chatHistory.forEach((msg, idx) => {
        if (firstAiIndex === -1 && msg.sender === 'ai') {
            firstAiIndex = idx;
        }
    });

    return (
        <div className="container mx-auto mt-3 mb-5">
            <Card className="overflow-hidden">
                <div className="grid md:grid-cols-3 h-[calc(100vh-120px)]">
                    {/* Left Panel: Settings */}
                    <div className="md:col-span-1 p-4 border-r flex flex-col gap-4 overflow-y-auto">
                        <CardHeader className="p-0 mb-2">
                            <CardTitle>{t("InstructionModel:title")}</CardTitle>
                            <CardDescription>{t("InstructionModel:description")}</CardDescription>
                        </CardHeader>

                        <div className="space-y-2">
                            <HoverInfo content={t("InstructionModel:modelInfo", {fileFormat: "GGUF", script: "setup_env.py"})} header={t("InstructionModel:model")} />
                            <div className="flex gap-2">
                                <Input readOnly value={model ? model.split(/[\\/]/).pop() : t("InstructionModel:noModelSelected")} className="flex-grow" />
                                <Button variant="outline" onClick={handleFileSelect} disabled={conversationActive}>
                                    <UploadIcon />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <HoverInfo content={t("InstructionModel:systemPromptInfo")} header={t("InstructionModel:systemPrompt")} />
                             <Textarea
                                placeholder={t("InstructionModel:systemPromptPlaceholder")}
                                value={systemPrompt}
                                onInput={(e) => setSystemPrompt(e.currentTarget.value)}
                                disabled={conversationActive}
                                rows={4}
                             />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <HoverInfo content={t("InstructionModel:numberOfTokensInfo")} header={t("InstructionModel:numberOfTokens")} />
                                <Input type="number" value={tokenQuantity} min={1} disabled={conversationActive} onInput={(e) => setTokenQuantity(Math.max(1, parseInt(e.currentTarget.value) || 1))} />
                            </div>
                            <div className="space-y-2">
                                <HoverInfo content={t("InstructionModel:threadsInfo")} header={t("InstructionModel:threads")} />
                                <Select value={threads.toString()} disabled={conversationActive} onValueChange={(data) => setThreads(parseInt(data))}>
                                    <SelectTrigger><SelectValue placeholder={threads} /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: maxThreads }, (_, i) => (
                                            <SelectItem key={`thread_${i + 1}`} value={(i + 1).toString()}>{i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <HoverInfo content={t("InstructionModel:contextSizeInfo")} header={t("InstructionModel:contextSize")} />
                                <Input type="number" value={ctxSize} min={1} disabled={conversationActive} onInput={(e) => setCtxSize(Math.max(1, parseInt(e.currentTarget.value) || 1))} />
                            </div>
                            <div className="space-y-2">
                                <HoverInfo content={t("InstructionModel:temperatureInfo")} header={t("InstructionModel:temperature")} />
                                <Input type="number" value={temperature} step={0.1} min={0} max={2} disabled={conversationActive} onInput={(e) => setTemperature(parseFloat(e.currentTarget.value) || 0)} />
                            </div>
                        </div>

                        <div className="mt-auto pt-4 space-y-2"> {/* Push buttons to bottom */}
                             <Button onClick={handleStartConversation} disabled={!canStart || isAiResponding} className="w-full">
                                {isAiResponding && !conversationActive ? ( // Show loading only during initial start
                                    <span className="flex items-center gap-2">
                                        <ReloadIcon className="animate-spin" /> {t("InstructionModel:starting")}
                                    </span>
                                ) : (
                                    t("InstructionModel:startConversation")
                                )}
                            </Button>
                            <Button onClick={handleStopConversation} disabled={!conversationActive} variant="destructive" className="w-full">
                                <StopIcon className="mr-2"/> {t("InstructionModel:stopConversation")}
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Chat */}
                    <div className="md:col-span-2 flex flex-col h-full">
                        <CardHeader className="p-4 border-b">
                            <CardTitle>{t("InstructionModel:chat")}</CardTitle>
                        </CardHeader>

                        {/* Make chat area scrollable and fill available space */}
                        <div className="flex-1 min-h-0">
                            <ScrollArea
                                className="h-full max-h-[calc(100vh-300px)] p-4"
                                ref={chatScrollAreaRef}
                                style={{ height: "100%", maxHeight: "calc(100vh - 300px)" }}
                            >
                                <div className="space-y-4">
                                    {chatHistory.map((msg, index) => {
                                        // Determine if regeneration is possible (AI message, not responding, active convo, not the very first message, and has a preceding user message)
                                        const canRegen = msg.sender === 'ai' && !isAiResponding && conversationActive && index > 0 && chatHistory.slice(0, index).some(m => m.sender === 'user');
                                        const isFirstAiMessage = index === firstAiIndex && msg.sender === 'ai';
                                        return (
                                            <ChatMessage
                                                key={`${msg.sender}-${index}-${msg.timestamp?.toISOString()}`}
                                                sender={msg.sender}
                                                message={msg.message}
                                                timestamp={msg.timestamp}
                                                canRegenerate={canRegen}
                                                onRegenerate={() => handleRegenerate(index)}
                                                isFirstAiMessage={isFirstAiMessage}
                                            />
                                        );
                                    })}
                                    {/* Typing indicator */}
                                    {isAiResponding && chatHistory[chatHistory.length - 1]?.sender === 'user' && (
                                         <ChatMessage key="typing" sender="ai" message={t("InstructionModel:typing")} timestamp={null}/> // No timestamp for typing indicator
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <CardFooter className="p-4 border-t">
                            <div className="flex w-full items-center space-x-2">
                                <Textarea
                                    ref={inputRef}
                                    placeholder={t("InstructionModel:typeMessagePlaceholder")}
                                    value={currentUserInput}
                                    onChange={(e) => setCurrentUserInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={!conversationActive || isAiResponding}
                                    rows={1}
                                    className="min-h-[40px] max-h-[150px] resize-none"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={isAiResponding ? handleInterject : handleSendUserMessage} // Switch action based on state
                                    disabled={!conversationActive || (!isAiResponding && !currentUserInput.trim())} // Enable interject even if input is empty
                                    title={isAiResponding ? t("InstructionModel:interject") : t("InstructionModel:sendMessage")} // Dynamic title
                                >
                                    {isAiResponding ? (
                                        <PauseIcon className="h-4 w-4" /> // Show Pause icon when AI is responding
                                    ) : (
                                        <PaperPlaneIcon className="h-4 w-4" /> // Show Send icon otherwise
                                    )}
                                    <span className="sr-only">
                                        {isAiResponding ? t("InstructionModel:interject") : t("InstructionModel:sendMessage")}
                                    </span>
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                </div>
            </Card>

            {/* Footer Links (Optional) */}
             <div className="grid grid-cols-1 mt-3">
                <h4 className="text-center">
                    <ExternalLink type="text" text={t("InstructionModel:license", { license: "MIT" })} gradient hyperlink={"https://github.com/grctest/Electron-BitNet"} />
                    {" " + t("InstructionModel:builtWith") + " "}
                    <ExternalLink type="text" text="Astro" gradient hyperlink={`https://astro.build/`} />{", "}
                    <ExternalLink type="text" text="React" gradient hyperlink={`https://react.dev/`} />{" & "}
                    <ExternalLink type="text" text="Electron" gradient hyperlink={`https://www.electronjs.org/`} />
                </h4>
            </div>
        </div>
    );
}