import React, { useState, useEffect, useMemo } from "react";
import { UploadIcon, ReloadIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

import ExternalLink from "@/components/ExternalLink.jsx";
import HoverInfo from "@/components/HoverInfo.jsx";

export default function PerplexityUI(properties) {
    const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

    const [model, setModel] = useState(""); // proven compatible: ggml-model-i2_s.gguf
    const [threads, setThreads] = useState(4);
    const [ctxSize, setCtxSize] = useState(4);
    const [prompt, setPrompt] = useState("hello world");
    const [pplStride, setPplStride] = useState(0);

    const [runningPerplexity, setRunningPerplexity] = useState(false);
    const [perplexityLog, setPerplexityLog] = useState("");
    const [parsedPerplexityData, setParsedPerplexityData] = useState([]);
    const [timer, setTimer] = useState(null);

    const [maxThreads, setMaxThreads] = useState(2);
    useEffect(() => {
        if (!window.electron) {
            return;
        }
        async function getMaxThreads() {
            const _maxThreads = await window.electron.getMaxThreads();
            setMaxThreads(_maxThreads);
        }
        getMaxThreads();
    }, []);

    const handleFileSelect = async () => {
        const filePaths = await window.electron.openFileDialog();
        if (filePaths.length > 0) {
            setModel(filePaths[0]);
        }
    };

    useEffect(() => {
        if (!window.electron) {
            return;
        }

        window.electron.onPerplexityLog((log) => {
            setPerplexityLog((prevPerplexityLog) => prevPerplexityLog + log);
        });

        window.electron.onPerplexityComplete(() => {
            setRunningPerplexity(false);
        });

    }, []);
   
    const parsePerplexityData = () => {
        const lines = perplexityLog.trim().split('\n');
        const data = {};
    
        lines.forEach(line => {
            if (line.includes('Final estimate:')) {
                const parts = line.split('Final estimate: PPL = ')[1].split(' +/- ');
                if (parts.length === 2) {
                    data.final_estimate = {
                        ppl: parseFloat(parts[0]),
                        uncertainty: parseFloat(parts[1])
                    };
                }
            } else if (line.startsWith('llama_perf_context_print:')) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim().replace('llama_perf_context_print:', '').replace(/\s+/g, '');
                    let value = parts[1].trim();
                    value = value.replace(/\s+/g, ' ').replace(/ \(/g, ' (').replace(/, /g, ', '); // Clean up excess whitespace
                    if (!data.llama_perf_context_print) {
                        data.llama_perf_context_print = {};
                    }
                    data.llama_perf_context_print[key] = value;
                }
            } else if (line.startsWith('system_info:')) {
                const infoString = line.replace('system_info:', '').trim();
                const infoParts = infoString.split('|').map(part => part.trim());
                const systemInfo = {};
            
                infoParts.forEach(part => {
                    const [key, value] = part.split('=').map(str => str.trim());
                    if (key && value) {
                        systemInfo[key] = isNaN(value) ? value : parseFloat(value);
                    }
                });
            
                data.system_info = systemInfo;
            } else if (line.startsWith('llm_load_print_meta:')) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim().replace('llm_load_print_meta:', '').replace(/\s+/g, '');
                    const value = parts[1].trim();
                    if (!data.llm_load_print_meta) {
                        data.llm_load_print_meta = {};
                    }
                    data.llm_load_print_meta[key] = value;
                }
            } else if (line.startsWith('llama_model_loader:')) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const keyParts = parts[0].trim().replace('llama_model_loader: - kv', '').trim().split('.');
                    const value = parts[1].trim();
            
                    if (!data.llama_model_loader) {
                        data.llama_model_loader = {};
                    }
            
                    let currentLevel = data.llama_model_loader;
            
                    keyParts.forEach((key, index) => {
                        key = key.replace(/^\d+:\s*/, '').trim().split(' ')[0]; // Remove leading numbers and spaces, keep only the first segment
                        if (index === keyParts.length - 1) {
                            currentLevel[key] = value;
                        } else {
                            if (!currentLevel[key]) {
                                currentLevel[key] = {};
                            }
                            currentLevel = currentLevel[key];
                        }
                    });
                }
            }
        });
    
        return data;
    };

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            setParsedPerplexityData(parsePerplexityData());
        }, 750);

        setTimer(newTimer);

        return () => {
            clearTimeout(newTimer);
        };
    }, [perplexityLog]);

    const sufficientTokens = useMemo(() => {
        return prompt.split(/\s+/).length >= 2 * ctxSize
    }, [prompt, ctxSize]);

    return (
        <div className="container mx-auto mt-3 mb-5">
            <Card>
                <CardHeader>
                    <CardTitle>{t("Perplexity:title")}</CardTitle>
                    <CardDescription>
                        {t("Perplexity:description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 grid grid-cols-1 gap-2">
                            <b>{t("Perplexity:commandOptions")}</b>
                            <HoverInfo
                                content={t("Perplexity:promptInfo")}
                                header={t("Perplexity:prompt")}
                            />
                            <Textarea
                                value={prompt}
                                onInput={(e) => {
                                    setPrompt(e.currentTarget.value);
                                }}
                            />
                            {
                                model && !sufficientTokens
                                    ? <Alert variant="destructive">
                                        <ExclamationTriangleIcon />
                                        <AlertTitle>{t("Perplexity:error")}</AlertTitle>
                                        <AlertDescription>
                                            {t("Perplexity:insufficientPromptTokens")}
                                        </AlertDescription>
                                    </Alert>
                                    : null
                            }
                            <HoverInfo
                                content={t("Perplexity:modelInfo", {fileFormat: "GGUF", script: "setup_env.py"})}
                                header={t("Perplexity:model")}
                            />
                            <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-3">
                                    <Input readOnly value={model ? model.split("\\").at(-1) : ""} />
                                </div>
                                <Button variant="outline" onClick={handleFileSelect}>
                                    <UploadIcon />
                                </Button>
                            </div>
                            <HoverInfo
                                content={t("Perplexity:threadsInfo")}
                                header={t("Perplexity:threads")}
                            />
                            <Select value={threads} onValueChange={(data) => {
                                setThreads(data);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={threads} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: maxThreads }, (_, index) => (
                                        <SelectItem key={`thread_${index + 1}`} value={index + 1}>
                                            {index + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <HoverInfo
                                content={t("Perplexity:contextSizeInfo")}
                                header={t("Perplexity:contextSize")}
                            />
                            <Input
                                placeholder={512}
                                step={1}
                                value={ctxSize}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*$/; // Only allows positive whole numbers
                                    if (regex.test(value)) {
                                        setCtxSize(value);
                                    }
                                }}
                            />
                            <HoverInfo
                                content={t("Perplexity:pplStrideInfo")}
                                header={t("Perplexity:pplStride")}
                            />
                            <Input
                                placeholder={0}
                                step={1}
                                value={pplStride}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*$/; // Only allows positive whole numbers
                                    if (regex.test(value)) {
                                        setPplStride(value);
                                    }
                                }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {
                                    model && sufficientTokens && runningPerplexity
                                    ? <Button disabled>
                                        <span className="flex items-center gap-2">
                                            <ReloadIcon style={{ animation: 'spin 3s linear infinite' }} />
                                            <span>
                                                {t("Perplexity:runPerplexity")}
                                            </span>
                                        </span>
                                    </Button>
                                    : null
                                }
                                {
                                    model && sufficientTokens && ctxSize > 0 && !runningPerplexity
                                    ? <Button
                                            onClick={() => {
                                                setPerplexityLog("");
                                                setParsedPerplexityData([]);
                                                setRunningPerplexity(true);
                                                window.electron.runPerplexity({
                                                    model,
                                                    prompt: prompt,
                                                    threads,
                                                    ctx_size: ctxSize,
                                                    ppl_stride: pplStride,
                                                });
                                            }}
                                        >
                                            {t("Perplexity:runPerplexity")}
                                        </Button>
                                    : null
                                }
                                {
                                    !model || !sufficientTokens
                                    ? <Button disabled>
                                        {t("Perplexity:runPerplexity")}
                                    </Button>
                                    : null
                                }
                                {
                                    runningPerplexity
                                        ? <Button
                                            onClick={() => {
                                                window.electron.stopPerplexity({});
                                            }}
                                        >
                                            {t("Perplexity:stopPerplexity")}
                                        </Button>
                                        : <Button disabled>{t("Perplexity:stopPerplexity")}</Button>
                                }
                            </div>

                        </div>
                        <div className="col-span-2">
                            <b>{t("Perplexity:log")}</b>
                            <Textarea
                                readOnly={true}
                                rows={20}
                                className="w-full"
                                value={parsedPerplexityData ? JSON.stringify(parsedPerplexityData, null, 2) : null}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 mt-3">
                <h4 className="text-center">
                    <ExternalLink
                        type="text"
                        text={t("Perplexity:license", { license: "MIT" })}
                        gradient
                        hyperlink={"https://github.com/grctest/Electron-BitNet"}
                    />
                    {" " + t("Perplexity:builtWith") + " "}
                    <ExternalLink
                        type="text"
                        text="Astro"
                        gradient
                        hyperlink={`https://astro.build/`}
                    />
                    {", "}
                    <ExternalLink
                        type="text"
                        text="React"
                        gradient
                        hyperlink={`https://react.dev/`}
                    />
                    {" & "}
                    <ExternalLink
                        type="text"
                        text="Electron"
                        gradient
                        hyperlink={`https://www.electronjs.org/`}
                    />
                </h4>
            </div>
        </div>
    );
}