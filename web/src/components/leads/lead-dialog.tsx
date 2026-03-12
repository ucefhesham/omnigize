"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  sourceChannel: string;
}

interface LeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  lead?: Lead | null;
  dictionary: any;
}

export function LeadDialog({ isOpen, onClose, onSave, lead, dictionary }: LeadDialogProps) {
  const d = dictionary.dashboard;
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    sourceChannel: "WEBSITE",
  });

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        sourceChannel: "WEBSITE",
      });
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-main rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-6 border-b border-border-main flex justify-between items-center bg-background-main/30">
          <h2 className="text-xl font-black text-foreground-main tracking-tight">
            {lead ? d.editLead : d.addLead}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-foreground-main transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.firstName}</label>
              <Input 
                placeholder={d.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.lastName}</label>
              <Input 
                placeholder={d.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.email}</label>
              <Input 
                type="email"
                placeholder={d.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.phone}</label>
              <Input 
                placeholder={d.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.company}</label>
            <Input 
              placeholder={d.company}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-foreground-main/40 uppercase tracking-[0.2em]">{d.source}</label>
            <div className="relative group">
              <select 
                className="w-full h-12 px-4 bg-background-main/50 border border-border-main rounded-xl text-sm font-bold text-foreground-main outline-none focus:border-primary transition-all appearance-none cursor-pointer hover:bg-background-main"
                value={formData.sourceChannel}
                onChange={(e) => setFormData({...formData, sourceChannel: e.target.value})}
              >
              <option value="WEBSITE">{d.channelWeb}</option>
              <option value="EMAIL">{d.channelEmail}</option>
              <option value="PHONE">{d.channelPhone}</option>
              <option value="SOCIAL">{d.channelSocial}</option>
              <option value="REFERRAL">{d.channelReferral}</option>
              </select>
              <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 font-bold uppercase text-xs tracking-wider" onClick={onClose}>
              {d.cancel}
            </Button>
            <Button type="submit" className="flex-1 font-bold uppercase text-xs tracking-wider">
              {d.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
