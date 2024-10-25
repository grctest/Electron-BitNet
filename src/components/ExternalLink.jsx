import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const _gradient = {
  backgroundImage: "var(--accent-gradient)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "400%",
  backgroundPosition: "0%",
};

const allowedDomains = [
  "https://github.com",
  "https://react.dev/",
  "https://astro.build/",
  "https://www.electronjs.org/"
];

/**
 * Launches a dialog prompt, prompting the user to verify their intent to launch a new tab to an external web resource
 */
export default function ExternalLink(properties) {
  const { hyperlink, type, text, variant, classnamecontents, gradient } = properties;

  const [open, setOpen] = useState(false);

  if (!allowedDomains.some((domain) => hyperlink.startsWith(domain))) {
    console.log("Invalid external link");
    return null;
  }

  return (
    <>
      {type === "text" ? (
        <span
          onClick={(event) => {
            setOpen(true);
            event.preventDefault();
          }}
          className={classnamecontents}
          style={gradient ? _gradient : null}
        >
          {text}
        </span>
      ) : (
        <Button
          variant={variant}
          onClick={(event) => {
            setOpen(true);
            event.preventDefault();
          }}
          className={classnamecontents}
        >
          {text}
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>⚠️ You are about to leave this app!"</DialogTitle>
            <DialogDescription>
              You are about to navigate to an external website.
            </DialogDescription>
          </DialogHeader>
          <h3 className="scroll-m-20 text-1xl font-semibold tracking-tight mb-3 mt-1">
            Do you want to proceed to the following URL?
          </h3>
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {hyperlink}
          </code>
          <h3 className="scroll-m-20 text-1xl font-semibold tracking-tight mb-3 mt-1">
            Just checking - are you sure you want to leave?
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {
              window.electron
                ? <Button color="gray" variant="outline" onClick={() => window.electron.openURL(hyperlink)}>
                    Open Link
                  </Button>
                : <a href={hyperlink} target="_blank">
                    <Button color="gray" variant="outline">
                      Open Link
                    </Button>
                  </a>
            }
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
