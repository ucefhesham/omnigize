import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { InteractiveChart } from "@/components/dashboard/interactive-chart";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const d = await getDictionary(lang);

  const stats = [
    { label: d.dashboard.newUsers, value: "15,000", color: "#3B82F6", trend: "+200", icon: "person", chart: [10, 20, 15, 25, 20, 35, 30] },
    { label: d.dashboard.activeUsers, value: "8,000", color: "#10B981", trend: "+200", icon: "group", chart: [15, 25, 20, 40, 35, 50, 45] },
    { label: d.dashboard.totalSales, value: "$5,00,000", color: "#F59E0B", trend: "-$10k", icon: "payments", chart: [30, 25, 45, 35, 50, 40, 55] },
    { label: d.dashboard.totalProfit, value: "$3,00,700", color: "#06B6D4", trend: "+$15k", icon: "trending_up", chart: [20, 30, 25, 45, 40, 60, 55] },
  ];

  // Correctly interpolate the greeting
  const greeting = d.dashboard.greeting.replace('{name}', 'Ucef');

  return (
    <DashboardLayout lang={lang} dictionary={d}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-foreground-main tracking-tight">{d.dashboard.navHome}</h2>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>{d.dashboard.navHome}</span>
            <span>/</span>
            <span className="text-primary uppercase tracking-widest font-black">CRM</span>
          </div>
        </div>

        {/* Informative Stats Row - WowDash Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface p-6 rounded-2xl border border-border-main shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">{stat.label}</p>
                  <h3 className="text-2xl font-black text-foreground-main">{stat.value}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: stat.color }}>
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
              </div>
              
              <div className="h-10 w-full mb-3">
                 <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path 
                    d={`M0,${40-((stat.chart[0] / 60) * 30 + 5)} ${stat.chart.map((val, idx) => `L${(idx / (stat.chart.length - 1)) * 100},${40-((val / 60) * 30 + 5)}`).join(' ')}`}
                    fill="none" 
                    stroke={stat.color} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    className="animate-spark"
                    style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <span className={stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>
                  {d.dashboard.increaseBy} {stat.trend}
                </span>
                <span className="text-slate-500">{d.dashboard.thisWeek}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Revenue Growth - WowDash Style */}
          <div className="lg:col-span-8 bg-surface border border-border-main rounded-2xl shadow-sm p-8 flex flex-col transition-all duration-300">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground-main tracking-tight">{d.dashboard.revenueGrowth}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{d.dashboard.weeklyReport}</p>
              </div>
              <div className="text-end">
                <h3 className="text-2xl font-black text-foreground-main">$50,000.00</h3>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">$10k</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px] flex items-end">
              <InteractiveChart 
                data={[40, 45, 55, 50, 65, 60, 75, 70, 85, 80, 95, 100]} 
                color="#3B82F6" 
                label={d.dashboard.revenueGrowth} 
              />
            </div>
            
            <div className="flex justify-between mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
               {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Side Module - Campaigns/Customer Review */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.campaigns}</h3>
                <select className="bg-background-main border border-border-main text-[10px] font-black rounded-lg px-2 py-1 outline-none text-foreground-main">
                  <option>Yearly</option>
                </select>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: "Email", val: "80%", color: "bg-orange-500", icon: "mail" },
                  { name: "Website", val: "60%", color: "bg-emerald-500", icon: "language" },
                  { name: "Facebook", val: "49%", color: "bg-blue-600", icon: "hub" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        <span className="text-xs font-bold text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-foreground-main">{item.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-border-main/20 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.val }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary p-8 rounded-2xl shadow-lg relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                 <h3 className="text-xl font-black text-slate-900 leading-tight">{d.dashboard.readyToBoost}</h3>
                 <p className="text-slate-900/60 text-xs font-bold leading-relaxed">{d.dashboard.upgradePro}</p>
                 <button className="bg-slate-900 text-white text-xs font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                   {d.dashboard.getStarted}
                 </button>
               </div>
               <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>

        {/* New Row: Earning Statistic & Customer Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Earning Statistic - Multi-Chart Module */}
          <div className="lg:col-span-8 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground-main tracking-tight">{d.dashboard.earningStatistic}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{d.dashboard.monthly}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4 bg-background-main p-2 rounded-xl border border-border-main/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-main shadow-sm">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">bar_chart</span>
                    <span className="text-[10px] font-black uppercase text-slate-500">{d.dashboard.sales}</span>
                    <span className="text-[10px] font-black text-foreground-main">$200k</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance_wallet</span>
                    <span className="text-[10px] font-black uppercase text-slate-500">{d.dashboard.income}</span>
                    <span className="text-[10px] font-black text-foreground-main">$200k</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">trending_up</span>
                    <span className="text-[10px] font-black uppercase text-slate-500">{d.dashboard.profit}</span>
                    <span className="text-[10px] font-black text-foreground-main">$200k</span>
                  </div>
                </div>
                <select className="bg-background-main border border-border-main text-[10px] font-black rounded-lg px-2 py-1.5 outline-none text-foreground-main">
                  <option>{d.dashboard.yearly}</option>
                </select>
              </div>
            </div>

            <div className="h-[300px] flex items-end gap-3 px-2">
              {[60, 80, 70, 45, 65, 55, 60, 50, 65, 60, 45, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div 
                    className="w-full bg-primary/20 rounded-t-lg transition-all duration-300 group-hover:bg-primary group-hover:scale-y-105 origin-bottom"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Overview - Donut/Arc Module */}
          <div className="lg:col-span-4 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.customerOverview}</h3>
              <select className="bg-background-main border border-border-main text-[10px] font-black rounded-lg px-2 py-1 outline-none text-foreground-main">
                <option>{d.dashboard.yearly}</option>
              </select>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {d.dashboard.total}: 500</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> {d.dashboard.new}: 500</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> {d.dashboard.active}: 1500</div>
              </div>

              <div className="relative flex items-center justify-center pt-8">
                <div className="w-48 h-24 overflow-hidden relative">
                   <div className="w-48 h-48 border-[20px] border-emerald-500 rounded-full border-b-transparent border-l-transparent -rotate-45" />
                   <div className="absolute inset-x-0 bottom-0 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.dashboard.customerReport}</p>
                   </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-background-main border border-border-main/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.dashboard.total}</span>
                  <span className="text-xs font-black text-foreground-main">1,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Row: Payment Status & Countries & Top Performer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Client Payment Status */}
          <div className="lg:col-span-4 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all">
             <div className="space-y-1 mb-8">
                <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.clientPaymentStatus}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{d.dashboard.weeklyReport}</p>
             </div>

             <div className="flex justify-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest mb-8">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {d.dashboard.paid}: 500</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> {d.dashboard.pending}: 500</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> {d.dashboard.overdue}: 1500</div>
             </div>

             <div className="h-[200px] flex items-end gap-3 px-2">
                {[40, 65, 50, 75, 60, 45, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex gap-[2px] items-end">
                    <div className="w-2 bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                    <div className="w-2 bg-orange-500 rounded-t-sm" style={{ height: `${h*0.7}%` }} />
                    <div className="w-2 bg-emerald-500 rounded-t-sm" style={{ height: `${h*0.4}%` }} />
                  </div>
                ))}
             </div>
          </div>

          {/* Countries Status */}
          <div className="lg:col-span-4 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.countriesStatus}</h3>
              <select className="bg-background-main border border-border-main text-[10px] font-black rounded-lg px-2 py-1 outline-none text-foreground-main">
                <option>{d.dashboard.yearly}</option>
              </select>
            </div>

            <div className="space-y-6">
               {[
                 { name: d.dashboard.usa, val: "80%", color: "bg-blue-500", count: `1,240 ${d.common.users}` },
                 { name: d.dashboard.japan, val: "60%", color: "bg-orange-500", count: `1,240 ${d.common.users}` },
                 { name: d.dashboard.france, val: "49%", color: "bg-blue-600", count: `1,240 ${d.common.users}` },
                 { name: d.dashboard.germany, val: "100%", color: "bg-emerald-500", count: `1,240 ${d.common.users}` },
               ].map((c, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-black">
                     <span className="text-foreground-main uppercase tracking-widest">{c.name}</span>
                     <span className="text-slate-400">{c.count}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="h-1.5 flex-1 bg-border-main/20 rounded-full overflow-hidden">
                       <div className={`h-full ${c.color} rounded-full`} style={{ width: c.val }} />
                     </div>
                     <span className="text-[10px] font-black text-foreground-main min-w-[30px]">{c.val}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Top Performer */}
          <div className="lg:col-span-4 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.topPerformer}</h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">{d.dashboard.viewAll}</button>
            </div>

            <div className="space-y-6">
               {[
                 { name: "Dianne Russell", id: "36254", val: "60/80" },
                 { name: "Wade Warren", id: "36254", val: "50/70" },
                 { name: "Albert Flores", id: "36254", val: "55/75" },
                 { name: "Bessie Cooper", id: "36254", val: "60/80" },
                 { name: "Arlene McCoy", id: "36254", val: "55/75" },
               ].map((p, i) => (
                 <div key={i} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-full bg-background-main border border-border-main/50 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-primary/50 transition-colors">
                       {p.name.charAt(0)}
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-xs font-black text-foreground-main">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.dashboard.agentId}: {p.id}</p>
                     </div>
                   </div>
                   <span className="text-[11px] font-black text-foreground-main">{p.val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* New Row: Task List & Last Transaction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
          {/* Task List Table */}
          <div className="lg:col-span-7 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.taskList}</h3>
                <div className="flex gap-4">
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest">{d.dashboard.viewAll}</button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-4 ps-2">{d.dashboard.taskName}</th>
                      <th className="pb-4">{d.dashboard.assignedTo}</th>
                      <th className="pb-4 text-end pe-2">{d.dashboard.dueDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30">
                    {[
                      { name: "Hotel Management Syst...", id: "#5632", user: "Kathryn Murphy", date: "27 Mar 2024" },
                      { name: "Hotel Management Syst...", id: "#5632", user: "Darlene Robertson", date: "27 Mar 2024" },
                      { name: "Hotel Management Syst...", id: "#5632", user: "Courtney Henry", date: "27 Mar 2024" },
                      { name: "Hotel Management Syst...", id: "#5632", user: "Jenny Wilson", date: "27 Mar 2024" },
                    ].map((t, i) => (
                      <tr key={i} className="group hover:bg-background-main/50 transition-colors">
                        <td className="py-4 ps-2">
                          <p className="text-xs font-black text-foreground-main">{t.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">{t.id}</p>
                        </td>
                        <td className="py-4 text-xs font-bold text-foreground-main">{t.user}</td>
                        <td className="py-4 text-[10px] font-black text-slate-400 text-end pe-2">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Last Transaction Table */}
          <div className="lg:col-span-5 bg-surface border border-border-main rounded-2xl shadow-sm p-8 transition-all overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-foreground-main tracking-tight">{d.dashboard.lastTransaction}</h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">{d.dashboard.viewAll}</button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-4 ps-2">{d.dashboard.status}</th>
                      <th className="pb-4">{d.dashboard.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30">
                    {[
                      { status: d.dashboard.pending, color: "text-orange-500 bg-orange-500/10", amount: "$20,000.00" },
                      { status: d.dashboard.rejected, color: "text-rose-500 bg-rose-500/10", amount: "$20,000.00" },
                      { status: d.dashboard.completed, color: "text-emerald-500 bg-emerald-500/10", amount: "$20,000.00" },
                      { status: d.dashboard.completed, color: "text-emerald-500 bg-emerald-500/10", amount: "$20,000.00" },
                    ].map((tr, i) => (
                      <tr key={i} className="group hover:bg-background-main/50 transition-colors">
                        <td className="py-4 ps-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${tr.color}`}>
                            {tr.status}
                          </span>
                        </td>
                        <td className="py-4 text-[11px] font-black text-foreground-main">{tr.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spark-draw {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        .animate-spark {
          animation: spark-draw 1.5s ease-out forwards;
        }
      `}} />
    </DashboardLayout>
  );
}
