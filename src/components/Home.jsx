import React, { useState, useEffect } from "react";

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
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Home(properties) {


    const [tokenQuantity, setTokenQuantity] = useState(0);
    const [model, setModel] = useState("models/Llama3-8B-1.58-100B-tokens/ggml-model-i2_s.gguf");
    const [prompt, setPrompt] = useState("");
    const [threads, setThreads] = useState(2);
    const [ctxSize, setCtxSize] = useState(2048);
    const [temperature, setTemperature] = useState(0.8);

    const [runningInference, setRunningInference] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

    useEffect(() => {
        // listen for ipcrenderer ai response response chunks
        if (!window.electron) {
            return;
        }
        window.electron.onAiResponse((response) => {
            const totalResponse = aiResponse + response;
            setAiResponse(totalResponse);
        });
    }, []);

    /*
        node run_inference.js -m models/Llama3-8B-1.58-100B-tokens/ggml-model-i2_s.gguf -p "tell me how to make money" -n 1000 -temp 0
    */

    return (
        <div className="container mx-auto mt-3 mb-5">
            <Card>
                <CardHeader>
                    <CardTitle>Electron BitNet Inference appq</CardTitle>
                    <CardDescription>
                        bitnet.cpp is the official inference framework for 1-bit LLMs (e.g., BitNet b1.58). It offers a suite of optimized kernels, that support fast and lossless inference of 1.58-bit models on CPU (with NPU and GPU support coming next).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 grid grid-cols-1 gap-2">
                            <b>Command Options</b>
                            <Label>Number of tokens to predict</Label>
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
                            <Label>Model</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue>{model}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Models</SelectLabel>
                                        <SelectItem
                                            onClick={() => {
                                                setModel("models/Llama3-8B-1.58-100B-tokens/ggml-model-i2_s.gguf");
                                            }}
                                        >
                                            models/Llama3-8B-1.58-100B-tokens/ggml-model-i2_s.gguf
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Label>Threads</Label>
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
                            <Label>Context size</Label>
                            <Input
                                placeholder={2048}
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
                            <Label>Temperature</Label>
                            <Input
                                placeholder={0.8}
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
                            <Label>Prompt</Label>
                            <Textarea
                                value={prompt}
                                onInput={(e) => {
                                    setPrompt(e.currentTarget.value);
                                }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {
                                    !runningInference
                                    ? <Button
                                        onClick={() => {
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
                                        Run Inference
                                    </Button>
                                    : <Button disabled>
                                        Run Inference
                                    </Button>
                                }
                                
                                <Button
                                    onClick={() => {
                                        window.electron.stopInference();
                                    }}
                                >
                                    Stop Inference
                                </Button>
                            </div>

                        </div>
                        <div className="col-span-2">
                            <Textarea readOnly={true} rows={20} className="w-full" value={aiResponse} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                <p>Footer</p>
                </CardFooter>
            </Card>
        </div>
    );
}