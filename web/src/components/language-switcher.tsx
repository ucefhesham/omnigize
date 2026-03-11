"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Locale, i18n } from "@/i18n-config";

interface LanguageSwitcherProps {
  currentLang: Locale;
  dictionary: any;
}

export function LanguageSwitcher({ currentLang, dictionary }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const nextLang = currentLang === "en" ? "ar" : "en";

  return (
    <Link
      href={redirectedPathName(nextLang)}
      className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-3 py-1.5 text-sm font-medium text-text-main transition-colors hover:bg-slate-50 hover:border-slate-300"
    >
      <span className="material-symbols-outlined text-[16px] text-primary-dark">language</span>
      {dictionary.language[nextLang]}
    </Link>
  );
}
