import Image from "next/image";
import { getDictionary } from "../../get-dictionary";
import type { Locale } from "../../i18n-config";
import { siteConfig } from "../../config/site";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const dict = await getDictionary(lang);
  const isRtl = lang === "ar";

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display antialiased selection:bg-primary selection:text-text-main overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-light bg-background-light/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-text-main shadow-sm">
              <span className="material-symbols-outlined text-[20px] font-bold">grid_view</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-text-main">{siteConfig.name}</h2>
          </div>
          <nav className="hidden md:flex flex-1 justify-center gap-8">
            <a className="text-sm font-medium text-text-muted hover:text-primary-dark transition-colors" href="#">{dict.nav.platform}</a>
            <a className="text-sm font-medium text-text-muted hover:text-primary-dark transition-colors" href="#">{dict.nav.solutions}</a>
            <a className="text-sm font-medium text-text-muted hover:text-primary-dark transition-colors" href="#">{dict.nav.enterprise}</a>
            <a className="text-sm font-medium text-text-muted hover:text-primary-dark transition-colors" href="#">{dict.nav.resources}</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold text-text-main transition-colors hover:text-primary-dark">
              {dict.common.signIn}
            </button>
            <button className="flex h-9 items-center justify-center rounded-lg bg-text-main px-4 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-md">
              {dict.common.requestDemo}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent opacity-70 pointer-events-none blur-3xl"></div>
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white px-3 py-1 text-xs font-medium text-primary-dark shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {dict.hero.badge}
              </span>
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-text-main sm:text-6xl lg:text-7xl leading-[1.1]">
              {dict.hero.titlePart1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-primary-dark to-primary">
                {dict.hero.titleHighlight}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted font-medium">
              {dict.hero.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-slate-900 transition-all hover:bg-primary-hover hover:scale-105 shadow-glow hover:shadow-lg">
                {dict.common.requestEnterpriseDemo}
              </button>
              <button className="flex h-12 min-w-[200px] items-center justify-center rounded-lg border border-border-light bg-white px-8 text-base font-medium text-text-main transition-colors hover:border-primary/50 hover:bg-gray-50 shadow-sm">
                {dict.common.viewDocs}
              </button>
            </div>

            {/* Mockup UI */}
            <div className="mt-16 sm:mt-24 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/20 to-transparent blur opacity-40"></div>
              <div className="relative rounded-xl border border-border-light bg-white shadow-xl overflow-hidden aspect-[16/9] sm:aspect-[2/1]">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white"></div>
                <div className="absolute inset-0 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-light pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-2 w-32 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 h-full">
                    <div className="col-span-3 hidden md:flex flex-col gap-3 border-r border-border-light pr-4">
                      <div className="h-8 w-full bg-gray-100 rounded-lg"></div>
                      <div className="h-8 w-3/4 bg-gray-50 rounded-lg"></div>
                      <div className="h-8 w-4/5 bg-gray-50 rounded-lg"></div>
                      <div className="h-8 w-2/3 bg-gray-50 rounded-lg"></div>
                    </div>
                    <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-24 bg-white rounded-lg border border-border-light p-4 flex flex-col justify-between shadow-sm">
                            <div className="h-2 w-12 bg-primary/40 rounded"></div>
                            <div className="h-8 w-20 bg-gray-100 rounded"></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 bg-white rounded-lg border border-border-light relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-sm z-10">
                          <button className="bg-text-main text-white font-bold py-2 px-4 rounded shadow-lg transform scale-95 group-hover:scale-100 transition-transform">Live Analytics Preview</button>
                        </div>
                        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiMxNjJiMmIiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzIzNDA0MCIvPgo8L3N2Zz4=')] opacity-5 mix-blend-multiply"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent"></div>
                        <svg className={`absolute bottom-4 left-4 right-4 h-24 w-[calc(100%-2rem)] text-primary-dark ${isRtl ? 'scale-x-[-1]' : ''}`} preserveAspectRatio="none" viewBox="0 0 100 20">
                          <path d="M0 15 Q 10 5 20 12 T 40 10 T 60 14 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
                          <path d="M0 15 L 100 15" fill="none" stroke="#e2e8f0" strokeDasharray="2" strokeWidth="0.2"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="border-y border-border-light bg-background-offset py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-text-muted mb-8">{dict.trustedBy}</p>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-5 items-center opacity-60 mix-blend-multiply">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="h-8 w-32 bg-slate-400/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl text-start">
                {dict.features.sectionTitle}
              </h2>
              <p className="mt-4 text-lg text-text-muted text-start">
                {dict.features.sectionDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
              {/* Feature 1 - Spans 2 */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:border-primary/50 hover:shadow-card-hover shadow-card">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="text-start">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                      <span className="material-symbols-outlined">sync_alt</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">{dict.features.sync.title}</h3>
                    <p className="mt-2 text-text-muted max-w-md">{dict.features.sync.description}</p>
                  </div>
                  <div className="mt-8 h-32 w-full rounded-lg bg-background-offset border border-border-light relative overflow-hidden">
                    <div className={`absolute inset-0 flex items-center justify-around ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="w-16 h-16 rounded border border-primary/20 bg-white shadow-sm animate-pulse"></div>
                      <span className={`material-symbols-outlined text-primary-dark/50 ${isRtl ? 'rotate-180' : ''}`}>arrow_forward</span>
                      <div className="w-16 h-16 rounded border border-primary/20 bg-white shadow-sm animate-pulse delay-75"></div>
                      <span className={`material-symbols-outlined text-primary-dark/50 ${isRtl ? 'rotate-180' : ''}`}>arrow_forward</span>
                      <div className="w-16 h-16 rounded border border-primary/20 bg-white shadow-sm animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10"></div>
              </div>

              {/* Feature 2 - Talk to Tia */}
              <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:border-primary/50 hover:shadow-card-hover shadow-card text-start">
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main">{dict.features.ai.title}</h3>
                  <p className="mt-2 text-text-muted">{dict.features.ai.description}</p>
                  <div className={`mt-auto pt-6 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${isRtl ? 'rounded-r-xl' : 'rounded-l-xl'} rounded-t-xl bg-slate-50 border border-border-light p-3 max-w-[80%] text-xs text-text-muted shadow-sm`}>
                      {lang === 'ar' ? 'جاري تشغيل تحليل مخاطر المحفظة #429...' : 'Running risk analysis on portfolio #429...'}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-primary/10 to-transparent"></div>
              </div>

              {/* Feature 3 - Maker/Checker */}
              <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:border-primary/50 hover:shadow-card-hover shadow-card text-start">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main">{dict.features.automation.title}</h3>
                  <p className="mt-2 text-text-muted">{dict.features.automation.description}</p>
                </div>
              </div>

              {/* Feature 4 - Serverless Scale */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:border-primary/50 hover:shadow-card-hover shadow-card">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center text-start">
                  <div className="flex-1">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">{dict.features.scale.title}</h3>
                    <p className="mt-2 text-text-muted">{dict.features.scale.description}</p>
                  </div>
                  <div className="w-full md:w-1/3">
                    <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg border border-border-light">
                      <div className="flex items-center justify-between text-xs text-text-muted font-medium">
                        <span>{lang === 'ar' ? 'حمل المرور' : 'Traffic Load'}</span>
                        <span className="text-primary-dark">99.99% {lang === 'ar' ? 'وقت التشغيل' : 'Uptime'}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-3/4 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-muted mt-2 font-medium">
                        <span>{lang === 'ar' ? 'استجابة الخادم' : 'Server Response'}</span>
                        <span className="text-primary-dark">12ms</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/4 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden bg-background-offset border-t border-border-light">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">{dict.cta.title}</h2>
            <p className="mt-4 text-lg text-text-muted">{dict.cta.description}</p>
            <div className="mt-10 flex justify-center gap-4">
              <button className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-slate-900 transition-all hover:bg-primary-hover hover:scale-105 shadow-glow shadow-primary/30">
                {dict.common.freeTrial}
              </button>
              <button className="flex h-12 items-center justify-center rounded-lg border border-border-light bg-white px-8 text-base font-bold text-text-main transition-colors hover:bg-gray-50 hover:border-gray-300">
                {dict.common.contactSales}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-slate-900">
                <span className="material-symbols-outlined text-[16px] font-bold">grid_view</span>
              </div>
              <span className="text-lg font-bold text-text-main">{siteConfig.name}</span>
            </div>
            <div className="flex gap-8 text-sm text-text-muted font-medium">
              <a className="hover:text-primary-dark transition-colors" href="#">{dict.footer.privacy}</a>
              <a className="hover:text-primary-dark transition-colors" href="#">{dict.footer.terms}</a>
              <a className="hover:text-primary-dark transition-colors" href="#">{dict.footer.security}</a>
              <a className="hover:text-primary-dark transition-colors" href="#">{dict.footer.status}</a>
            </div>
            <div className="text-sm text-text-muted">
              © {new Date().getFullYear()} {siteConfig.name} Inc. {dict.footer.rights}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
