import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadIcon, ReloadIcon, PaperPlaneIcon, TrashIcon, PauseIcon, ClipboardCopyIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '@radix-ui/react-icons'; // Added ClockIcon
import ReactMarkdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VariableSizeList as List } from 'react-window';
import DOMPurify from 'dompurify';

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import ExternalLink from "@/components/ExternalLink.jsx";
import HoverInfo from "@/components/HoverInfo.jsx";

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
    // Sidebar should be open by default, and only closable after conversation starts
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // --- Chat State ---
    const [conversationActive, setConversationActive] = useState(false);
    const [isAiResponding, setIsAiResponding] = useState(false);
    // Update chat history structure to include timestamp
    const [chatHistory, setChatHistory] = useState([]); // Array of { sender: 'user' | 'ai', message: string, timestamp: Date }
    const [currentUserInput, setCurrentUserInput] = useState("");
    const chatScrollAreaRef = useRef(null);
    const inputRef = useRef(null);
    // --- VariableSizeList height cache ---
    const messageHeights = useRef({});
    const chatListRef = useRef();
    const [, forceUpdate] = useState(0);

    // --- Chat Scroll Lock State ---
    const [autoScroll, setAutoScroll] = useState(true);

    // Memoized CodeBlock for performance and security
    const CodeBlock = React.memo((props) => {
        const { node, inline, className, children, ...rest } = props; // Destructure props

        const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
        const match = /language-(\w+)/.exec(className || '');
        const codeString = String(children).replace(/\n$/, '');
        const [copied, setCopied] = useState(false);

        console.log({props})

        const handleCopy = () => {
            navigator.clipboard.writeText(codeString).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        };

        // Sanitize codeString for XSS (using DOMPurify)
        const safeCodeString = DOMPurify.sanitize(codeString);

        return className ? (
            <div
                className="my-2 relative group w-full min-w-0 max-w-full rounded-lg"
                style={{
                    maxWidth: '100%',
                    overflowX: 'auto',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-mono, monospace)',
                }}
            >
                <button
                    onClick={handleCopy}
                    className={`absolute top-2 right-2 z-10 p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ${copied ? 'opacity-100' : ''}`}
                    title={copied ? t('InstructionModel:copied') : t('InstructionModel:copyCode')}
                    aria-label={copied ? t('InstructionModel:copied') : t('InstructionModel:copyCode')}
                    tabIndex={0}
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                </button>
                <div
                    style={{
                        maxWidth: '100%',
                        overflowX: 'auto',
                        boxSizing: 'border-box',
                    }}
                >
                    <SyntaxHighlighter
                        style={atomDark}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        className="rounded border border-border bg-muted/50 p-3 pt-8 text-sm min-w-0 max-w-full whitespace-pre overflow-x-auto font-mono"
                        customStyle={{
                            maxWidth: '100%',
                            overflowX: 'auto',
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            boxSizing: 'border-box',
                            fontFamily: 'var(--font-mono, monospace)',
                        }}
                        wrapLongLines={true}
                        {...props}
                    >
                        {safeCodeString}
                    </SyntaxHighlighter>
                </div>
            </div>
        ) : (
            <code
                // Apply simpler inline styling - let prose handle flow/wrapping
                // Use a darker background and lighter text for contrast, similar to the highlighted block
                className={`bg-neutral-800 text-neutral-100 px-1 py-0.5 rounded text-sm font-mono`}
                style={{
                    display: 'inline', // Ensure it behaves as inline
                    fontFamily: 'var(--font-mono, monospace)',
                    margin: '0 0.1em', // Add slight horizontal margin for spacing
                    padding: '0.1em 0.4em', // Adjust padding slightly (overrides className padding)
                    verticalAlign: 'baseline', // Align with surrounding text
                    whiteSpace: 'normal', // Allow wrapping if needed
                    width: 'auto' // Ensure width is not forced
                }}
                {...props}
            >
                {children}
            </code>
        );
    });

    // Memoized ChatMessage for performance
    const ChatMessage = React.memo(function ChatMessage({ sender, message, timestamp, onRegenerate, canRegenerate, isFirstAiMessage, onDelete, generationTime }) { // Added generationTime prop
        const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
        const isUser = sender === 'user';
        const senderName = isUser ? t("InstructionModel:you") : t("InstructionModel:ai");
        const avatarText = isUser ? '🤔' : '🤖';
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(message).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        };

        const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        const iconButtonStyle = "rounded bg-muted p-1.5 hover:bg-primary/20 transition-colors border border-border flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-primary"; // Adjusted style slightly
        const iconButtonSize = { width: 28, height: 28 }; // Adjusted size slightly

        return (
            <div className={`flex flex-col gap-1 p-2 w-full max-w-full`}>
                <div className={`flex items-start gap-2 w-full max-w-full min-w-0 ${isUser ? 'justify-end flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <Avatar className="w-8 h-8 border mt-1">
                            <AvatarFallback>{avatarText}</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Message Bubble & Content */}
                    <div className={`flex flex-col min-w-0 rounded-lg text-sm ${isUser ? 'ml-auto bg-primary text-primary-foreground max-w-[75%]' : 'flex-1 bg-muted max-w-full'} transition-all duration-300 ease-in-out`}>
                        <div className="p-3 break-words overflow-x-auto" style={{ maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
                            <p className="font-semibold mb-1">{senderName}</p>
                            {isUser ? (
                                <p className="whitespace-pre-wrap break-words">{message}</p>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert transition-all duration-300 ease-in-out">
                                    <ReactMarkdown components={{ code: CodeBlock }}>{message}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                        {/* Action buttons for AI only, moved below content */}
                        {!isUser && (
                            <div className="flex items-center gap-1.5 flex-shrink-0 p-2 border-t border-border/50 mt-1 pt-1">
                                {
                                    !isAiResponding
                                        ? <>
                                            <button
                                                className={iconButtonStyle}
                                                title={copied ? t('InstructionModel:copied') : t('InstructionModel:copy')}
                                                onClick={handleCopy}
                                                style={iconButtonSize}
                                                disabled={copied}
                                                tabIndex={0}
                                            >
                                                {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <ClipboardCopyIcon className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                className={iconButtonStyle}
                                                title={t('InstructionModel:deleteResponse')}
                                                onClick={onDelete}
                                                style={iconButtonSize}
                                                tabIndex={0}
                                            >
                                                <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                                            </button>
                                        </>
                                        : null
                                }
                            </div>
                        )}
                    </div>
                </div>
                {/* Timestamp and Generation Time (only for AI) */}
                <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mt-1 px-2 items-center gap-2`}>
                    {!isUser && ( // Only show timestamp and generation time for AI
                        <>
                            <span className="text-xs text-muted-foreground">{formattedTime}</span>
                            {generationTime !== undefined && (
                                <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {generationTime.toFixed(1)}s
                                </Badge>
                            )}
                        </>
                    )}
                    {/* Removed timestamp for user messages */}
                </div>
            </div>
        );
    });

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

    // Scroll to bottom when chat history updates, unless user has scrolled up
    useEffect(() => {
        if (!autoScroll || !chatListRef.current) return;
        // Only scroll if user is at/near bottom
        chatListRef.current.scrollToItem(chatHistory.length - 1, 'end');
    }, [chatHistory, autoScroll]);

    // Handler to detect user scroll and toggle autoScroll
    const handleChatScroll = () => {
        const scrollViewport = chatScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollViewport) return;
        const atBottom = scrollViewport.scrollHeight - scrollViewport.scrollTop - scrollViewport.clientHeight < 10;
        setAutoScroll(atBottom);
    };

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
            let updatedIndex = -1; // Keep track of the index that was updated
            setChatHistory((prevHistory) => {
                const lastMessage = prevHistory[prevHistory.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    updatedIndex = prevHistory.length - 1;
                    // Append to existing AI message (timestamp remains the same)
                    return prevHistory.map((msg, index) =>
                        index === updatedIndex
                            ? { ...msg, message: msg.message + chunk }
                            : msg
                    );
                } else {
                    updatedIndex = prevHistory.length;
                    // Start new AI message with timestamp
                    return [...prevHistory, { sender: 'ai', message: chunk, timestamp: new Date() }];
                }
            });

            // Explicitly tell react-window to re-measure the updated item
            if (updatedIndex !== -1 && chatListRef.current) {
                 // Use requestAnimationFrame to ensure this runs after the state update is processed
                 requestAnimationFrame(() => {
                    if (chatListRef.current) {
                        chatListRef.current.resetAfterIndex(updatedIndex, false); // Use false to avoid immediate scroll jump
                    }
                 });
            }

            // Basic check if the AI is waiting for input
            if (chunk.trim().endsWith('>')) {
                 setIsAiResponding(false);
                 // Clean up the prompt indicator
                 setChatHistory((prevHistory) => {
                    const lastMessage = prevHistory[prevHistory.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                        // Corrected: Use lastMessage instead of msg
                        const cleanedMessage = lastMessage.message.replace(/>\s*$/, '').trimEnd();
                        // Only update if message actually changed
                        if (cleanedMessage !== lastMessage.message) {
                            const finalIndex = prevHistory.length - 1;
                            const updatedHistory = prevHistory.map((msg, index) =>
                                index === finalIndex
                                    ? { ...msg, message: cleanedMessage }
                                    : msg
                            );
                            // Remeasure after cleaning up the prompt indicator as well
                            requestAnimationFrame(() => {
                                if (chatListRef.current) {
                                    chatListRef.current.resetAfterIndex(finalIndex, false);
                                }
                            });
                            return updatedHistory;
                        }
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

    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

    // --- Handlers ---
    const handleFileSelect = async () => {
        if (conversationActive || isFileDialogOpen) return; // Prevent opening if already open or in conversation
        setIsFileDialogOpen(true); // Disable button
        try {
            const filePaths = await window.electron.openFileDialog();
            if (filePaths.length > 0) {
                setModel(filePaths[0]);
            }
        } catch (error) {
            console.error("Error opening file dialog:", error); // Optional: Log errors
        } finally {
            setIsFileDialogOpen(false); // Re-enable button regardless of outcome
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
    };

    const handleStopConversation = () => {
        if (!conversationActive) return;
        window.electron.stopInference();
        setChatHistory([]); // Clear chat log when stopping conversation
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
            setChatHistory((prev) => prev.slice(0, userMessageIndex + 1));
            setIsAiResponding(true);
            const textToWrite = userPromptText + '\\n'; // Send with newline

            window.electron.sendInstructPrompt(textToWrite);
        } else {
            console.error("Could not find the preceding user message to regenerate from.");
        }
    };

    // --- Delete AI message handler ---
    const handleDeleteMessage = useCallback((index) => {
        setChatHistory(prev => {
            // If deleting an AI message, also remove the preceding user message and put its text back in the input
            if (prev[index]?.sender === 'ai') {
                // Find the preceding user message
                const userIdx = [...prev].slice(0, index).reverse().findIndex(msg => msg.sender === 'user');
                if (userIdx !== -1) {
                    const realUserIdx = index - 1 - userIdx;
                    const userMsg = prev[realUserIdx]?.message || '';
                    // Remove both user and ai message
                    const newHistory = prev.filter((_, i) => i !== index && i !== realUserIdx);
                    setCurrentUserInput(userMsg);
                    // Remove height cache for both
                    delete messageHeights.current[index];
                    delete messageHeights.current[realUserIdx];
                    if (chatListRef.current) {
                        chatListRef.current.resetAfterIndex(Math.min(realUserIdx, index));
                    }
                    forceUpdate(n => n + 1);
                    return newHistory;
                }
            }
            // Default: just remove the message
            delete messageHeights.current[index];
            if (chatListRef.current) {
                chatListRef.current.resetAfterIndex(index);
            }
            forceUpdate(n => n + 1);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // --- Render ---
    const canStart = model && systemPrompt && !conversationActive;
    // Calculate firstAiIndex here
    const firstAiIndex = chatHistory.findIndex(msg => msg.sender === 'ai');

    // --- Constants for Estimation (Adjust as needed based on your styling) ---
    const BASE_MESSAGE_HEIGHT = 60; // Increased base for padding, avatar, name, timestamp, actions
    const LINE_HEIGHT = 22;         // Approx height of a single line of text in prose/user message
    const CHARS_PER_LINE = 65;      // Approx chars per line before wrapping (adjust based on font/width)
    const PARAGRAPH_SPACING = 10;   // Extra space for paragraph breaks (\n\n)
    const CODE_BLOCK_PADDING = 40;  // Padding/margin around code block + copy button space
    const CODE_LINE_HEIGHT = 20;    // Approx height of a line within a code block
    const ROW_VERTICAL_PADDING = 16; // Buffer to avoid cramped layout after measurement

    // --- Helper to estimate code block height ---
    const estimateCodeBlockHeight = (codeContent) => {
        const lines = (codeContent.match(/\n/g) || []).length + 1;
        return CODE_BLOCK_PADDING + (lines * CODE_LINE_HEIGHT);
    };


    // --- VariableSizeList itemSize getter (More Sophisticated Estimation) ---
    const getItemSize = useCallback(index => {
        // Handle typing indicator height
        if (index === chatHistory.length) {
            const showTypingIndicator = isAiResponding && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.sender === 'user';
            return showTypingIndicator ? (messageHeights.current[index] ?? 60) : 0; // Prefer measured height when available
        }

        // Handle hidden first AI message
        if (index === 0 && chatHistory[0]?.sender === 'ai') {
            if (messageHeights.current[index] !== 0) {
                messageHeights.current[index] = 0;
            }
            return 0;
        }

        const cachedHeight = messageHeights.current[index];
        if (cachedHeight != null) {
            return cachedHeight;
        }

        // Estimate height based on content for other messages
        const messageData = chatHistory[index];
        if (!messageData || !messageData.message) {
            return BASE_MESSAGE_HEIGHT + ROW_VERTICAL_PADDING; // Default minimum
        }

        const message = messageData.message;
        let estimatedHeight = BASE_MESSAGE_HEIGHT;

        // Separate code blocks from the rest of the text for estimation
        const codeBlockRegex = /```([\s\S]*?)```/g;
        let codeBlockMatch;
        let nonCodeText = message;
        let totalCodeBlockHeight = 0;

        while ((codeBlockMatch = codeBlockRegex.exec(message)) !== null) {
            const codeContent = codeBlockMatch[1] || '';
            totalCodeBlockHeight += estimateCodeBlockHeight(codeContent);
            // Remove the code block from the text we use for line estimation
            nonCodeText = nonCodeText.replace(codeBlockMatch[0], '');
        }

        // Estimate height for non-code text
        if (nonCodeText.trim()) {
            const newlineCount = (nonCodeText.match(/\n/g) || []).length;
            const paragraphCount = (nonCodeText.match(/\n\n+/g) || []).length; // Count double+ newlines

            // Estimate lines based on characters, ensuring at least 1 line if there's text
            const charLines = Math.max(1, Math.ceil(nonCodeText.trim().length / CHARS_PER_LINE));
            // Estimate lines based on explicit newlines
            const newlineLines = Math.max(1, newlineCount + 1);

            // Use the max of character-based or newline-based line count
            const estimatedLines = Math.max(charLines, newlineLines);

            estimatedHeight += (estimatedLines * LINE_HEIGHT);
            estimatedHeight += (paragraphCount * PARAGRAPH_SPACING); // Add paragraph spacing
        }

        // Add the estimated height of all code blocks
        estimatedHeight += totalCodeBlockHeight;

        // Use cached height if available and larger than estimate (measurement is king)
        // Return the estimated height, ensuring a minimum, plus padding buffer
        return Math.max(estimatedHeight, BASE_MESSAGE_HEIGHT) + ROW_VERTICAL_PADDING;

    }, [chatHistory, isAiResponding]); // Dependencies: chatHistory and isAiResponding

    // --- VariableSizeList row measurer ---
    const measureRow = useCallback((index, node) => {
        if (!node) return;

        // Keep hidden first AI message collapsed
        if (index === 0 && chatHistory[0]?.sender === 'ai') {
            if (messageHeights.current[index] !== 0) {
                messageHeights.current[index] = 0;
            }
            return;
        }

        const rawHeight = node.scrollHeight || node.offsetHeight || 0;
        if (!rawHeight) return;

        const measuredHeight = Math.max(rawHeight + ROW_VERTICAL_PADDING, BASE_MESSAGE_HEIGHT);
        if (messageHeights.current[index] !== measuredHeight) {
            messageHeights.current[index] = measuredHeight;
            if (chatListRef.current) {
                requestAnimationFrame(() => {
                    chatListRef.current?.resetAfterIndex(index, false);
                });
            }
        }
    }, [chatHistory]);

    // --- Scroll to bottom if autoScroll ---
    useEffect(() => {
        if (!autoScroll || !chatListRef.current) return;
        // Determine the target index based on whether the typing indicator is shown
        const showTypingIndicator = isAiResponding && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.sender === 'user';
        const targetIndex = chatHistory.length + (showTypingIndicator ? 0 : -1); // Scroll to typing or last message
        if (targetIndex >= 0) {
             chatListRef.current.scrollToItem(targetIndex, 'end');
        }
    }, [chatHistory, autoScroll, isAiResponding]); // Add isAiResponding dependency

    // --- Calculate itemCount for the List ---
    const showTypingIndicator = isAiResponding && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.sender === 'user';
    const itemCount = chatHistory.length + (showTypingIndicator ? 1 : 0);




    return (
        <div className="container mx-auto mt-3 mb-5 relative max-w-full px-1 sm:px-2 md:px-4 lg:px-8 xl:px-16">
            <Card className="overflow-hidden">
                <div className="grid h-[calc(100vh-120px)]" style={{ gridTemplateColumns: sidebarOpen ? 'minmax(260px, 340px) 1fr' : '0px 1fr' }}>
                    {/* Collapsible Left Panel: Settings */}
                    <div className={`transition-all duration-300 ease-in-out border-r flex flex-col gap-4 overflow-y-auto bg-background z-10 ${sidebarOpen ? 'p-4 min-w-[260px] max-w-md' : 'w-0 min-w-0 max-w-0 p-0 border-0 overflow-hidden'}`}
                        style={{ position: 'relative' }}>
                        {/* Sidebar is always open until conversationActive, then can be closed */}
                        {(sidebarOpen || !conversationActive) && (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <CardTitle className="truncate">{t("InstructionModel:title")}</CardTitle>
                                    {conversationActive && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="ml-2"
                                            onClick={() => setSidebarOpen(false)}
                                            aria-label={t('InstructionModel:collapseSidebar')}
                                        >
                                            <ChevronLeftIcon className="h-5 w-5 text-black" />
                                        </Button>
                                    )}
                                </div>
                                <CardHeader className="p-0 mb-2">
                                    <CardDescription>{t("InstructionModel:description")}</CardDescription>
                                </CardHeader>
                                <div className="space-y-2">
                                    <HoverInfo content={t("InstructionModel:modelInfo", {fileFormat: "GGUF", script: "setup_env.py"})} header={t("InstructionModel:model")} />
                                    <div className="flex gap-2">
                                        <Input readOnly value={model ? model.split(/[\\/]/).pop() : t("InstructionModel:noModelSelected")} className="flex-grow" />
                                        <Button variant="outline" onClick={handleFileSelect} disabled={conversationActive || isFileDialogOpen}>
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
                                        {t("InstructionModel:stopConversation")}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Right Panel: Chat */}
                    <div className="flex flex-col h-full min-w-0">
                        <CardHeader className="p-4 border-b flex justify-start gap-2">

                            <CardTitle className="text-left">
                                                        {/* Sidebar open button (to left of chat title, only when closed and conversation active) */}
                            {!sidebarOpen && conversationActive && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="mr-2"
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label={t('InstructionModel:expandSidebar')}
                                >
                                    <ChevronRightIcon className="h-5 w-5 text-black" />
                                </Button>
                            )}
                                {t("InstructionModel:chat")}
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-1 min-h-0">
                            <div
                                className="h-full max-h-[calc(100vh-300px)] p-2 sm:p-4"
                                style={{ height: "100%", maxHeight: "calc(100vh - 300px)" }}
                                onScroll={handleChatScroll}
                                ref={chatScrollAreaRef}
                            >
                                <List
                                    height={chatScrollAreaRef.current?.clientHeight || 400}
                                    width={"100%"}
                                    itemCount={itemCount} // Use calculated itemCount
                                    itemSize={getItemSize}
                                    ref={chatListRef}
                                    overscanCount={4}
                                    itemData={{
                                        chatHistory,
                                        isAiResponding,
                                        conversationActive,
                                        handleRegenerate,
                                        handleDeleteMessage,
                                        t,
                                        firstAiIndex, // Pass firstAiIndex down
                                    }}
                                    itemKey={index => {
                                        // Handle typing indicator key
                                        if (index === chatHistory.length) return 'typing-indicator';
                                        const msg = chatHistory[index];
                                        // Use timestamp+sender+message hash for stability
                                        return `${msg.sender}-${msg.timestamp?.getTime?.() || ''}-${msg.message?.length || 0}-${index}`;
                                    }}
                                    onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
                                        // If user scrolls, disable autoScroll unless update was requested by code
                                        if (!scrollUpdateWasRequested) setAutoScroll(false);
                                    }}
                                >
                                    {({ index, style, data }) => {
                                        const { chatHistory, isAiResponding, conversationActive, handleRegenerate, handleDeleteMessage, t, firstAiIndex } = data;

                                        // Determine if we are in the initial AI response phase (first message is AI and being generated)
                                        // Note: firstAiIndex might be -1 if no AI message exists yet.
                                        const isInitialAiResponsePhase = firstAiIndex === 0 && chatHistory.length === 1 && isAiResponding;

                                        // 1. Handle initial loading indicator (Only if the very first message is AI and loading)
                                        if (index === 0 && isInitialAiResponsePhase) {
                                            return (
                                                <div style={style}>
                                                    <div ref={node => measureRow(index, node)} className="flex text-left justify-center gap-2 p-4 text-muted-foreground">
                                                        <span>{t('InstructionModel:loading')}</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // 2. Handle the "Typing..." indicator for subsequent responses
                                        const showTypingIndicator = isAiResponding && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.sender === 'user';
                                        if (index === chatHistory.length && showTypingIndicator) {
                                            // Use a fixed, known key for the typing indicator
                                            return (
                                                <div key="typing-indicator" style={style}>
                                                    <div ref={node => measureRow(index, node)}>
                                                        <ChatMessage sender="ai" message={t("InstructionModel:typing")} timestamp={new Date()} />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // 3. Handle rendering actual messages
                                        if (index < chatHistory.length) {
                                            const msg = chatHistory[index];

                                            // Skip rendering the *content* of the first AI message if it's the system prompt response,
                                            // but still render the container for measurement purposes if needed, or just return null.
                                            // Let's simplify: Don't render the first AI message at all if it's index 0.
                                            // This assumes the system prompt response should never be visible.
                                            if (index === 0 && msg.sender === 'ai') {
                                                 // Ensure height cache is 0 for this hidden item
                                                 if (messageHeights.current[index] !== 0) {
                                                    messageHeights.current[index] = 0;
                                                    // No need to call resetAfterIndex here, as it's always 0 height.
                                                 }
                                                 return <div style={{ ...style, height: 0, padding: 0, margin: 0, border: 'none' }}></div>;
                                            }

                                            // Render other messages
                                            const canRegen = msg.sender === 'ai' && !isAiResponding && conversationActive && index > 0 && chatHistory.slice(0, index).some(m => m.sender === 'user');

                                            // Use a stable key based on timestamp and index
                                            const key = `${msg.sender}-${msg.timestamp?.getTime() || index}-${index}`;

                                            return (
                                                <div key={key} style={style}>
                                                    <div ref={node => measureRow(index, node)}>
                                                        <ChatMessage
                                                            sender={msg.sender}
                                                            message={msg.message}
                                                            timestamp={msg.timestamp}
                                                            canRegenerate={canRegen}
                                                            onRegenerate={() => handleRegenerate(index)}
                                                            onDelete={() => handleDeleteMessage(index)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return <div style={style}></div>;
                                    }}
                                </List>
                            </div>
                        </div>
                        <CardFooter className="p-4 border-t">
                            <div className="flex w-full items-center space-x-2">
                                <Textarea
                                    ref={inputRef}
                                    placeholder={t("InstructionModel:typeMessagePlaceholder")}
                                    value={currentUserInput}
                                    onChange={(e) => setCurrentUserInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    className="min-h-[40px] max-h-[150px] resize-none"
                                />
                                {
                                    isAiResponding || !currentUserInput.trim()
                                        ?   <Button
                                                type="button"
                                                size="icon"
                                                disabled
                                                title={t("InstructionModel:sendMessage")}
                                            >
                                                <PaperPlaneIcon className="h-4 w-4" />
                                                <span className="sr-only">
                                                    {t("InstructionModel:sendMessage")}
                                                </span>
                                            </Button>
                                        :   <Button
                                                type="button"
                                                size="icon"
                                                onClick={handleSendUserMessage}
                                                title={t("InstructionModel:sendMessage")}
                                            >
                                                <PaperPlaneIcon className="h-4 w-4" />
                                                <span className="sr-only">
                                                    {t("InstructionModel:sendMessage")}
                                                </span>
                                            </Button>
                                }
                            </div>
                        </CardFooter>
                    </div>
                </div>
            </Card>
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