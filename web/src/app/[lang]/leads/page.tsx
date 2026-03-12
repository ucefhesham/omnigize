"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LeadsList } from "@/components/leads/leads-list";
import { LeadDialog } from "@/components/leads/lead-dialog";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { fetchGraphQL } from "@/lib/api";

const GET_LEADS = `
  query GetLeads($filter: LeadFilterDto) {
    leads(filter: $filter) {
      id
      firstName
      lastName
      email
      phone
      companyName
      sourceChannel
      createdAt
    }
  }
`;

const CREATE_LEAD = `
  mutation CreateLead($createLeadDto: CreateLeadDto!) {
    createLead(createLeadDto: $createLeadDto) {
      id
      firstName
      lastName
    }
  }
`;

const UPDATE_LEAD = `
  mutation UpdateLead($id: ID!, $updateLeadDto: UpdateLeadDto!) {
    updateLead(id: $id, updateLeadDto: $updateLeadDto) {
      id
      firstName
      lastName
    }
  }
`;

const DELETE_LEAD = `
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`;

export default function LeadsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang as Locale;
  
  const [dictionary, setDictionary] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDictionary);
    loadLeads();
  }, [lang]);

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await fetchGraphQL<any>(GET_LEADS);
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Failed to load leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
    try {
      if (selectedLead) {
        // Update
        const { id, ...rest } = data;
        await fetchGraphQL(UPDATE_LEAD, { id, updateLeadDto: rest });
      } else {
        // Create
        await fetchGraphQL(CREATE_LEAD, { createLeadDto: data });
      }
      setIsDialogOpen(false);
      loadLeads();
    } catch (error) {
      console.error("Failed to save lead:", error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm(dictionary?.dashboard.deleteLeadConfirm)) {
      try {
        await fetchGraphQL(DELETE_LEAD, { id });
        loadLeads();
      } catch (error) {
        console.error("Failed to delete lead:", error);
      }
    }
  }

  if (!dictionary) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const d = dictionary.dashboard;

  return (
    <DashboardLayout lang={lang} dictionary={dictionary} activeHref={`/${lang}/leads`}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground-main tracking-tight">{d.leadsTitle}</h2>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>{d.navHome}</span>
              <span>/</span>
              <span className="text-primary uppercase tracking-widest font-black">LEADS</span>
            </div>
          </div>
          
          <Button 
            className="font-black text-[10px] uppercase tracking-widest px-6" 
            onClick={() => { setSelectedLead(null); setIsDialogOpen(true); }}
          >
            <span className="material-symbols-outlined text-[18px] me-2">add</span>
            {d.addLead}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-surface border border-border-main rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <LeadsList 
            leads={leads} 
            onEdit={(lead) => { setSelectedLead(lead); setIsDialogOpen(true); }}
            onDelete={handleDelete}
            dictionary={dictionary}
            lang={lang}
          />
        )}
      </div>

      <LeadDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        lead={selectedLead}
        dictionary={dictionary}
      />
    </DashboardLayout>
  );
}
