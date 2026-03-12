import { Locale } from "@/i18n-config";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  lang: Locale;
  dictionary: any;
  activeHref?: string;
}

export function DashboardLayout({ children, lang, dictionary, activeHref }: DashboardLayoutProps) {
  const isRtl = lang === "ar";

  const menuItems = [
    { section: dictionary.dashboard.sections.menu, items: [
      { icon: "grid_view", label: dictionary.dashboard.navHome, href: `/${lang}/dashboard`, active: true },
      { icon: "group", label: dictionary.dashboard.navLeads, href: `/${lang}/leads` },
      { icon: "handshake", label: dictionary.dashboard.navDeals, href: `/${lang}/deals` },
      { icon: "contact_page", label: dictionary.dashboard.navContacts, href: `/${lang}/contacts` },
    ]},
    { section: dictionary.dashboard.sections.apps, items: [
      { icon: "calendar_today", label: dictionary.dashboard.navCalendar, href: `/${lang}/calendar` },
      { icon: "chat", label: dictionary.dashboard.navChat, href: `/${lang}/chat` },
      { icon: "task_alt", label: dictionary.dashboard.navTodo, href: `/${lang}/todo` },
    ]},
    { section: dictionary.dashboard.sections.pages, items: [
      { icon: "settings", label: dictionary.dashboard.navSettings, href: `/${lang}/settings` },
      { icon: "help", label: dictionary.dashboard.navSupport, href: `/${lang}/support` },
    ]}
  ];

  return (
    <div className="min-h-screen bg-background-main flex font-sans text-foreground-main antialiased overflow-x-hidden transition-colors duration-300">
      {/* Sidebar - Structured Pro Sidebar */}
      <aside className={`w-[260px] bg-surface border-e border-border-main flex flex-col fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 transition-colors duration-300`}>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border-main/20">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-slate-900 text-[20px] font-black italic">hub</span>
          </div>
          <span className="text-xl font-black tracking-tight uppercase">
            {dictionary.common.brand}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          {menuItems.map((group, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h5 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {group.section}
              </h5>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeHref ? item.href === activeHref : (item.href.includes('dashboard') && !activeHref);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? "bg-primary text-slate-900 font-bold shadow-sm" 
                          : "text-slate-500 hover:text-foreground-main hover:bg-background-main"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'font-black' : 'text-slate-400 group-hover:text-foreground-main'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border-main/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-background-main border border-border-main/50 transition-colors">
             <div className="w-9 h-9 rounded-full bg-surface shadow-sm flex items-center justify-center text-primary text-xs font-black ring-1 ring-border-main/20">
              UH
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Ucef Hesham</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                Workspace Owner
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isRtl ? "mr-[260px]" : "ml-[260px]"} relative`}>
        {/* Header - Pro Header with Search */}
        <header className="h-16 bg-surface border-b border-border-main sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="relative w-full max-w-md group">
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">search</span>
               <input 
                 type="text" 
                 placeholder={dictionary.dashboard.searchPlaceholder} 
                 className="w-full bg-background-main border border-border-main rounded-xl py-2 ps-10 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground-main"
               />
             </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} dictionary={dictionary} />
            
            <div className="flex items-center gap-2 border-s border-border-main ps-4">
              <ThemeToggle />
              <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-foreground-main hover:bg-background-main rounded-lg transition-all">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
              <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-foreground-main hover:bg-background-main rounded-lg transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
              </button>
              
              <div className="ms-2 w-9 h-9 rounded-full bg-slate-900 border border-border-main/20 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                <div className="text-white text-[10px] font-black uppercase">UH</div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
