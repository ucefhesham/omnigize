"use client";
import React from "react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  sourceChannel: string;
  createdAt: string;
}

interface LeadsListProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  dictionary: any;
  lang: string;
}

export function LeadsList({ leads, onEdit, onDelete, dictionary, lang }: LeadsListProps) {
  const d = dictionary.dashboard;

  if (leads.length === 0) {
    return (
      <div className="bg-surface border border-border-main rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-background-main rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-slate-400 text-3xl">list_alt</span>
        </div>
        <h3 className="text-lg font-black text-foreground-main mb-2">No Leads Found</h3>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Start growing your pipeline today</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-main rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-main/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="py-5 px-6">{d.firstName} & {d.lastName}</th>
              <th className="py-5 px-6">{d.email} & {d.phone}</th>
              <th className="py-5 px-6">{d.company}</th>
              <th className="py-5 px-6">{d.source}</th>
              <th className="py-5 px-6 text-end">{d.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/30">
            {leads.map((lead) => (
              <tr key={lead.id} className="group hover:bg-background-main/50 transition-colors">
                <td className="py-4 px-6 text-sm font-black text-foreground-main">
                  {lead.firstName} {lead.lastName}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-foreground-main">{lead.email}</p>
                    <p className="text-[10px] font-bold text-slate-400">{lead.phone}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-xs font-bold text-slate-500">
                  {lead.companyName || "—"}
                </td>
                <td className="py-4 px-6">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                    {lead.sourceChannel}
                  </span>
                </td>
                <td className="py-4 px-6 text-end">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(lead)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(lead.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
