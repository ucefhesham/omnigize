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
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.firstName}</label>
              <Input 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.lastName}</label>
              <Input 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.email}</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.phone}</label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.company}</label>
            <Input 
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.source}</label>
            <select 
              className="w-full h-10 px-3 bg-background-main border border-border-main rounded-xl text-sm font-bold text-foreground-main outline-none focus:border-primary transition-colors appearance-none"
              value={formData.sourceChannel}
              onChange={(e) => setFormData({...formData, sourceChannel: e.target.value})}
            >
              <option value="WEBSITE">{d.channelWeb}</option>
              <option value="EMAIL">{d.channelEmail}</option>
              <option value="PHONE">{d.channelPhone}</option>
              <option value="SOCIAL">{d.channelSocial}</option>
              <option value="REFERRAL">{d.channelReferral}</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 font-black uppercase text-[10px] tracking-widest" onClick={onClose}>
              {d.cancel}
            </Button>
            <Button type="submit" className="flex-1 font-black uppercase text-[10px] tracking-widest">
              {d.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
