import { InfoCircledIcon } from "@radix-ui/react-icons";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";

export default function HoverInfo({ header, content, type }) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  return (
    <HoverCard>
      <HoverCardTrigger>
        <span className="flex">
          <span className="flex-grow">
            {!type ? (
              <Label>{header}</Label>
            ) : (
              <Label className="text-xl text-semibold">{header}</Label>
            )}
          </span>
          {!type ? (
            <span className="flex-shrink mr-2 text-gray-400">
              <Label>
                <InfoCircledIcon className="mt-3" />
              </Label>
            </span>
          ) : null}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className={"w-140 mt-1"} align="start">
        <h4 className="scroll-m-20 text-md font-semibold tracking-tight">
          <div className="flex items-center">
            <span>{t("PageHeader:about")}:</span>
            <span className="ml-2">{header}</span>
          </div>
        </h4>
        <p className="leading-6 text-sm [&:not(:first-child)]:mt-1">{content}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
