import React, { useState, useEffect } from "react";
import { UploadIcon } from "@radix-ui/react-icons";
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

import ExternalLink from "@/components/ExternalLink.jsx";
import HoverInfo from "@/components/HoverInfo.jsx";

export default function Home(properties) {
    const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

    const [tokenQuantity, setTokenQuantity] = useState(20);
    const [model, setModel] = useState(""); // proven compatible: ggml-model-i2_s.gguf
    const [threads, setThreads] = useState(2);
    const [ctxSize, setCtxSize] = useState(2048);
    const [temperature, setTemperature] = useState(0.8);

    const [prompt, setPrompt] = useState("");

    const [runningInference, setRunningInference] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

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

        window.electron.onAiResponse((response) => {
            setAiResponse((prevAiResponse) => prevAiResponse + response);
        });

        window.electron.onAiError(() => {
            setAiResponse((prevAiResponse) => prevAiResponse + "!!! An error occurred while running inference.");
            setRunningInference(false);
        });

        window.electron.onAiComplete(() => {
            setRunningInference(false);
        });
    }, []);

    return (
        <div className="container mx-auto mt-3 mb-5">
            <Card>
                <CardHeader>
                    <CardTitle>{t("Home:title")}</CardTitle>
                    <CardDescription>
                        {t("Home:description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 grid grid-cols-1 gap-2">
                            <b>{t("Home:commandOptions")}</b>
                            <HoverInfo
                                content={t("Home:numberOfTokensInfo")}
                                header={t("Home:numberOfTokens")}
                            />
                            <Input
                                placeholder={0}
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
                                content={t("Home:modelInfo", {fileFormat: "GGUF", script: "setup_env.py"})}
                                header={t("Home:model")}
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
                                content={t("Home:threadsInfo")}
                                header={t("Home:threads")}
                            />
                            <Input
                                placeholder={2}
                                value={threads}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*$/; // Only allows positive whole numbers
                                    if (regex.test(value)) {
                                        setThreads(value);
                                    }
                                }}
                            />
                            <HoverInfo
                                content={t("Home:contextSizeInfo")}
                                header={t("Home:contextSize")}
                            />
                            <Input
                                placeholder={2048}
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
                                content={t("Home:temperatureInfo")}
                                header={t("Home:temperature")}
                            />
                            <Input
                                placeholder={0.8}
                                step={0.1}
                                value={temperature}
                                type="number"
                                onInput={(e) => {
                                    const value = e.currentTarget.value;
                                    const regex = /^\d*\.?\d*$/; // Only allows positive floats or whole numbers
                                    if (regex.test(value)) {
                                        setTemperature(value);
                                    }
                                }}
                            />
                            <HoverInfo
                                content={t("Home:promptInfo")}
                                header={t("Home:prompt")}
                            />
                            <Textarea
                                value={prompt}
                                onInput={(e) => {
                                    setPrompt(e.currentTarget.value);
                                }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {
                                    runningInference || !model
                                    ? <Button disabled>
                                        {t("Home:runInference")}
                                    </Button>
                                    : <Button
                                        onClick={() => {
                                            setAiResponse("");
                                            setRunningInference(true);
                                            window.electron.runInference({
                                                model,
                                                n_predict: tokenQuantity,
                                                threads,
                                                prompt,
                                                ctx_size: ctxSize,
                                                temperature,
                                            });
                                        }}
                                    >
                                        {t("Home:runInference")}
                                    </Button>
                                }
                                
                                <Button
                                    onClick={() => {
                                        window.electron.stopInference({});
                                    }}
                                >
                                    {t("Home:stopInference")}
                                </Button>
                            </div>

                        </div>
                        <div className="col-span-2">
                            <b>{t("Home:response")}</b>
                            <Textarea readOnly={true} rows={20} className="w-full" value={aiResponse} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 mt-3">
                <h4 className="text-center">
                    <ExternalLink
                        type="text"
                        text={t("Home:license", { license: "MIT" })}
                        gradient
                        hyperlink={"https://github.com/grctest/Electron-BitNet"}
                    />
                    {" " + t("Home:builtWith") + " "}
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