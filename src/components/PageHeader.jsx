import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { HamburgerMenuIcon, ReloadIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";

function MenuRow(properties) {
  const { url, text, icon } = properties;

  const [hover, setHover] = useState(false);
  const [isCurrentPage, setIsCurrentPage] = useState(false);

  useEffect(() => {
    setIsCurrentPage(window.location.pathname === url);
  }, [url]);

  const [clicked, setClicked] = useState(false);

  return (
    <a
      href={url}
      onClick={() => {
        setClicked(true);
      }}
    >
      <CommandItem
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        style={{
          backgroundColor: hover || isCurrentPage ? "#F1F1F1" : "",
        }}
      >
        <span className="grid grid-cols-8 w-full">
          <span className="col-span-1">{icon}</span>
          <span className="col-span-6">{text}</span>
          <span className="col-span-1 text-right">
            {clicked && !isCurrentPage ? <ReloadIcon className="ml-2 mt-1 animate-spin" /> : ""}
          </span>
        </span>
      </CommandItem>
    </a>
  );
}

function LanguageRow(properties) {
  const { language, text, i18n } = properties;

  const [hover, setHover] = useState(false);
  const [isCurrentLanguage, setIsCurrentLanguage] = useState(false);

  useEffect(() => {
    setIsCurrentLanguage(language === locale.get());
  }, [language]);

  return (
    <CommandItem
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onSelect={() => {
        i18n.changeLanguage(language);
        locale.set(language);
        window.location.reload();
      }}
      style={{
        backgroundColor: hover || isCurrentLanguage ? "#F1F1F1" : "",
      }}
    >
      <span className="grid grid-cols-8 w-full">
        <span className="col-span-6">{text}</span>
        <span className="col-span-1 text-right">{isCurrentLanguage ? "✓" : ""}</span>
      </span>
    </CommandItem>
  );
}

export default function PageHeader(properties) {
  const { page, backURL } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  return (
    <>
      <div key={`header`} className="container mx-auto mb-3">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <HamburgerMenuIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-10 p-0" side="end">
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder={t("PageHeader:commandSearchPlaceholder")} />
                  <CommandList>
                    <CommandEmpty>{t("PageHeader:noResultsFound")}</CommandEmpty>
                    <CommandGroup heading={t("PageHeader:llmFunctionality")}>
                      <MenuRow
                        url="/index.html"
                        text={t("PageHeader:index")}
                        icon="🤖"
                      />
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="col-span-8 text-center"></div>
          <div className="col-span-2 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={32}
                      d="M48 112h288M192 64v48M272 448l96-224 96 224M301.5 384h133M281.3 112S257 206 199 277 80 384 80 384"
                    />
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={32}
                      d="M256 336s-35-27-72-75-56-85-56-85"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-10 p-0" side="end">
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder={t("PageHeader:commandSearchPlaceholder")} />
                  <CommandList>
                    <CommandEmpty>{t("PageHeader:noResultsFound")}</CommandEmpty>
                    <CommandGroup heading={t("PageHeader:exchangingFundsHeading")}>
                      <LanguageRow language="en" i18n={i18n} text={t("PageHeader:english", {locale: "en"})} />
                      <LanguageRow language="da" i18n={i18n} text={t("PageHeader:danish", {locale: "da"})} />
                      <LanguageRow language="de" i18n={i18n} text={t("PageHeader:german", {locale: "de"})} />
                      <LanguageRow language="es" i18n={i18n} text={t("PageHeader:spanish", {locale: "es"})} />
                      <LanguageRow language="fr" i18n={i18n} text={t("PageHeader:french", {locale: "fr"})} />
                      <LanguageRow language="it" i18n={i18n} text={t("PageHeader:italian", {locale: "it"})} />
                      <LanguageRow language="ja" i18n={i18n} text={t("PageHeader:japanese", {locale: "ja"})} />
                      <LanguageRow language="ko" i18n={i18n} text={t("PageHeader:korean", {locale: "ko"})} />
                      <LanguageRow language="pt" i18n={i18n} text={t("PageHeader:portuguese", {locale: "pt"})} />
                      <LanguageRow language="th" i18n={i18n} text={t("PageHeader:thai", {locale: "th"})} />
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
