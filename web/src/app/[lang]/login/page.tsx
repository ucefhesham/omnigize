"use client";
import React, { useState } from "react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Metadata removed because this is now a client component
// In Next.js App Router, you'd typically have a server component wrapper for metadata or just use it in the page if it was a server component.
// For simplicity in this demo, I'll convert it to a client-side layout.

export default function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang as Locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dictionary, setDictionary] = useState<any>(null);

  React.useEffect(() => {
    getDictionary(lang).then(setDictionary);
  }, [lang]);

  if (!dictionary) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const d = dictionary;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push(`/${lang}/dashboard`);
    }, 1200);
  };

  return (
    <AuthLayout lang={lang} dictionary={d}>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {d.auth.loginTitle}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {d.auth.loginSubtitle}
          </p>
        </div>

        <form className="flex flex-col gap-5 mt-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 select-none">
              {d.auth.emailLabel}
            </label>
            <Input 
              type="email" 
              placeholder={d.auth.emailPlaceholder} 
              icon="mail" 
              defaultValue="ucefhesham@gmail.com"
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 select-none">
                {d.auth.passwordLabel}
              </label>
              <Link 
                href={`/${lang}/forgot-password`} 
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                {d.auth.forgotPassword}
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder={d.auth.passwordPlaceholder} 
              icon="lock" 
              defaultValue="Omnigize2026!"
              required 
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600 focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
              {d.auth.rememberMe}
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? d.auth.signingIn : d.auth.signInButton}
            {!loading && (
              <span className="material-symbols-outlined rtl:rotate-180 text-[18px] ms-2">
                arrow_forward
              </span>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm font-medium text-slate-600">
          {d.auth.noAccount}{" "}
          <Link 
            href={`/${lang}/signup`} 
            className="text-sky-600 hover:text-sky-700 font-bold transition-colors shadow-sky-600/30 hover:shadow-[0_2px_0_0_currentColor]"
          >
            {d.auth.signUpLink}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
