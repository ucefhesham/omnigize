import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = (await params) as { lang: Locale };
  const d = await getDictionary(lang);
  return {
    title: `${d.auth.signupTitle} | ${d.common.brand}`,
  };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const d = await getDictionary(lang);

  return (
    <AuthLayout lang={lang} dictionary={d}>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {d.auth.signupTitle}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {d.auth.signupSubtitle}
          </p>
        </div>

        <form className="flex flex-col gap-5 mt-4" action="#">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 select-none">
                {d.auth.firstNameLabel}
              </label>
              <Input 
                type="text" 
                placeholder={d.auth.firstNamePlaceholder} 
                icon="person" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 select-none">
                {d.auth.lastNameLabel}
              </label>
              <Input 
                type="text" 
                placeholder={d.auth.lastNamePlaceholder} 
                icon="person" 
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 select-none">
              {d.auth.workspaceLabel}
            </label>
            <Input 
              type="text" 
              placeholder={d.auth.workspacePlaceholder} 
              icon="domain" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 select-none">
              {d.auth.emailLabel}
            </label>
            <Input 
              type="email" 
              placeholder={d.auth.emailPlaceholder} 
              icon="mail" 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 select-none">
              {d.auth.passwordLabel}
            </label>
            <Input 
              type="password" 
              placeholder={d.auth.passwordPlaceholder} 
              icon="lock" 
              required 
            />
          </div>

          <div className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
            {d.auth.termsText}{" "}
            <Link href={`/${lang}/terms`} className="text-sky-600 hover:underline">
              {d.auth.termsLink}
            </Link>{" "}
            {"&"}{" "}
            <Link href={`/${lang}/privacy`} className="text-sky-600 hover:underline">
              {d.auth.privacyLink}
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2">
            {d.auth.signUpButton}
            <span className="material-symbols-outlined rtl:rotate-180 text-[18px] ms-2">
              arrow_forward
            </span>
          </Button>
        </form>

        <div className="mt-4 text-center text-sm font-medium text-slate-600">
          {d.auth.hasAccount}{" "}
          <Link 
            href={`/${lang}/login`} 
            className="text-sky-600 hover:text-sky-700 font-bold transition-colors shadow-sky-600/30 hover:shadow-[0_2px_0_0_currentColor]"
          >
            {d.auth.signInLink}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
