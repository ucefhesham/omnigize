import React from "react";
import Link from "next/link";
import { Locale } from "@/i18n-config";

interface AuthLayoutProps {
  children: React.ReactNode;
  lang: Locale;
  dictionary: any;
}

export function AuthLayout({ children, lang, dictionary }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* Side Image / Banner (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 overflow-hidden bg-slate-900 border-e border-slate-800 p-12 lg:p-16 text-white">
        
        {/* Background Gradients */}
        <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 end-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <Link href={`/${lang}`} className="inline-flex flex-col">
            <h1 className="text-3xl font-black tracking-tight">{dictionary.common.brand}</h1>
            <span className="text-sm font-medium text-slate-400 mt-1">{dictionary.common.description}</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl flex flex-1 flex-col justify-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium backdrop-blur-md mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-sky-400">verified</span>
              {dictionary.trustedBy}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 flex flex-col gap-2">
              <span>{dictionary.hero.titlePart1}</span>
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">{dictionary.hero.titleHighlight}</span>
            </h2>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              {dictionary.hero.description}
            </p>
          </div>
        </div>

        {/* Floating Abstract UI Elements Decor */}
        <div className="absolute end-12 top-1/2 -translate-y-1/2 rotate-12 opacity-20 pointer-events-none mix-blend-overlay">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M47.7,-57.2C59.4,-47.3,64.8,-29.7,68.1,-11.5C71.3,6.7,72.4,25.4,63.9,40.1C55.4,54.8,37.3,65.5,18.4,69.5C-0.5,73.5,-20.3,70.8,-38.3,61.5C-56.3,52.2,-72.5,36.3,-78.9,16.8C-85.3,-2.7,-81.9,-25.9,-69.6,-42C-57.3,-58.1,-36.1,-67.2,-17.1,-71.8C1.9,-76.4,23.1,-76.5,36,-67.1Z" transform="translate(100 100)" />
          </svg>
        </div>

      </div>

      {/* Auth Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <Link href={`/${lang}`} className="inline-flex">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{dictionary.common.brand}</h1>
            </Link>
          </div>

          {children}

        </div>
      </div>
      
    </div>
  );
}
