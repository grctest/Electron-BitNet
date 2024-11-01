import React, { useState, useEffect, useMemo } from "react";
import { UploadIcon, ReloadIcon } from "@radix-ui/react-icons";
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

import ExternalLink from "@/components/ExternalLink.jsx";
import HoverInfo from "@/components/HoverInfo.jsx";

export default function BenchmarkUI(properties) {
    const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

    const [tokenQuantity, setTokenQuantity] = useState(1);
    const [model, setModel] = useState(""); // proven compatible: ggml-model-i2_s.gguf
    const [threads, setThreads] = useState(2);
    const [promptLength, setPromptLength] = useState(1);

    const [runningBenchmark, setRunningBenchmark] = useState(false);
    const [benchmarkLog, setBenchmarkLog] = useState("");
    
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

        window.electron.onBenchmarkLog((log) => {
            setBenchmarkLog((prevBenchmarkLog) => prevBenchmarkLog + log);
        });

        window.electron.onBenchmarkComplete(() => {
            setRunningBenchmark(false);
        });
    }, []);

    const [parsedBenchmarkData, setParsedBenchmarkData] = useState([]);
    const [timer, setTimer] = useState(null);

    const parseBenchmarkData = () => {
        const lines = benchmarkLog.trim().split('\n');
        const headers = lines[0]?.split('|').map(header => header.trim()).filter(header => header);
        const dataLines = lines.slice(2); // Skip the header and dashes rows
    
        return dataLines.map(line => {
            const values = line.split('|').map(value => value.trim()).filter(value => value);
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        }).filter(obj => {
            // Filter out empty objects and irrelevant entries
            return headers.every(header => obj[header]) && !obj['model']?.includes('build:');
        });
    };

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            setParsedBenchmarkData(parseBenchmarkData());
        }, 750);

        setTimer(newTimer);

        return () => {
            clearTimeout(newTimer);
        };
    }, [benchmarkLog]);

    return (
        <div className="container mx-auto mt-3 mb-5">
            <Card>
                <CardHeader>
                    <CardTitle>{t("Benchmark:title")}</CardTitle>
                    <CardDescription>
                        {t("Benchmark:description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 grid grid-cols-1 gap-2">
                            <b>{t("Benchmark:commandOptions")}</b>
                            <HoverInfo
                                content={t("Benchmark:numberOfTokensInfo")}
                                header={t("Benchmark:numberOfTokens")}
                            />
                            <Input
                                placeholder={128}
                                value={tokenQuantity}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*$/; // Only allows positive whole numbers
                                    if (regex.test(value)) {
                                        setTokenQuantity(value);
                                    }
                                }}
                            />
                            <HoverInfo
                                content={t("Benchmark:modelInfo", {fileFormat: "GGUF", script: "setup_env.py"})}
                                header={t("Benchmark:model")}
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
                                content={t("Benchmark:threadsInfo")}
                                header={t("Benchmark:threads")}
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
                                content={t("Benchmark:promptLengthInfo")}
                                header={t("Benchmark:promptLength")}
                            />
                            <Input
                                placeholder={512}
                                step={1}
                                value={promptLength}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*$/; // Only allows positive whole numbers
                                    if (regex.test(value)) {
                                        setPromptLength(value);
                                    }
                                }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {
                                    model && runningBenchmark
                                    ? <Button disabled>
                                        <span className="flex items-center gap-2">
                                            <ReloadIcon style={{ animation: 'spin 2s linear infinite' }} />
                                            <span>
                                                {t("Benchmark:runBenchmark")}
                                            </span>
                                        </span>
                                    </Button>
                                    : null
                                }
                                {
                                    model &&
                                    tokenQuantity && tokenQuantity > 0 &&
                                    promptLength && promptLength > 0 &&
                                    !runningBenchmark
                                        ? <Button
                                                onClick={() => {
                                                    setBenchmarkLog("");
                                                    setRunningBenchmark(true);
                                                    window.electron.runBenchmark({
                                                        model,
                                                        n_token: tokenQuantity,
                                                        threads,
                                                        n_prompt: promptLength,
                                                    });
                                                }}
                                            >
                                                {t("Benchmark:runBenchmark")}
                                            </Button>
                                        : null
                                }
                                {
                                    !model || !tokenQuantity || !promptLength
                                    ? <Button disabled>
                                        {t("Benchmark:runBenchmark")}
                                    </Button>
                                    : null
                                }
                                {
                                    runningBenchmark
                                        ? <Button
                                            onClick={() => {
                                                window.electron.stopBenchmark({});
                                            }}
                                        >
                                            {t("Benchmark:stopBenchmark")}
                                        </Button>
                                        : <Button disabled>{t("Benchmark:stopBenchmark")}</Button>
                                }
                            </div>

                        </div>
                        <div className="col-span-2">
                            <b>{t("Benchmark:log")}</b>
                            <Textarea
                                readOnly={true}
                                rows={20}
                                className="w-full"
                                value={parsedBenchmarkData ? JSON.stringify(parsedBenchmarkData, null, 2) : null}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 mt-3">
                <h4 className="text-center">
                    <ExternalLink
                        type="text"
                        text={t("Benchmark:license", { license: "MIT" })}
                        gradient
                        hyperlink={"https://github.com/grctest/Electron-BitNet"}
                    />
                    {" " + t("Benchmark:builtWith") + " "}
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