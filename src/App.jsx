import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Search, Trash2, ChevronRight, ChevronLeft, ArrowLeft, CheckCircle2, Circle, Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const INK = '#241F1A';
const INK_2 = '#FFFFFF';
const INK_3 = '#E4DCC8';
const GOLD = '#A9814A';
const GOLD_SOFT = '#C9A876';
const CREAM = '#F6F1E7';
const MUTED = '#8B8175';
const GREEN = '#6B8F6E';

const FONTS = (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
  />
);

const inputStyle = {
  background: INK_2,
  color: INK,
  padding: '10px 12px',
  width: '100%',
  fontSize: '14px',
  border: `1px solid ${INK_3}`,
  outline: 'none',
};

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label style={{ color: MUTED, fontSize: '12px', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        style={{ background: value ? GOLD_SOFT : INK_2, color: value ? INK : MUTED, flex: 1, padding: '8px' }}
      >
        Sim
      </button>
      <button
        onClick={() => onChange(false)}
        style={{ background: !value ? GOLD_SOFT : INK_2, color: !value ? INK : MUTED, flex: 1, padding: '8px' }}
      >
        Não
      </button>
    </div>
  );
}

/* ============================= LEADS (CRM) ============================= */

const STAGES = [
  { id: 'novo', label: 'Novo lead' },
  { id: 'qualificando', label: 'Qualificando' },
  { id: 'call', label: 'Call agendada' },
  { id: 'proposta', label: 'Proposta enviada' },
  { id: 'fechado', label: 'Fechado' },
  { id: 'perdido', label: 'Perdido' },
  { id: 'desqualificado', label: 'Desqualificado' },
];

function emptyLead() {
  return {
    id: 'lead_' + Date.now() + Math.random().toString(36).slice(2, 7),
    nome: '',
    nicho: '',
    jaInveste: false,
    faturamento: '',
    stage: 'novo',
    notas: '',
    createdAt: new Date().toISOString(),
  };
}

function LeadsView({ leads, setLeads }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  function saveLead(lead) {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === lead.id);
      if (exists) return prev.map((l) => (l.id === lead.id ? lead : l));
      return [...prev, lead];
    });
    setEditing(null);
  }

  function deleteLead(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setEditing(null);
  }

  function moveStage(id, direction) {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = STAGES.findIndex((s) => s.id === l.stage);
        const newIdx = Math.min(STAGES.length - 1, Math.max(0, idx + direction));
        return { ...l, stage: STAGES[newIdx].id };
      })
    );
  }

  const filtered = leads.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.nome.toLowerCase().includes(q) || l.nicho.toLowerCase().includes(q);
  });

  const counts = STAGES.reduce((acc, s) => {
    acc[s.id] = filtered.filter((l) => l.stage === s.id).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: INK, fontSize: '24px' }}>
            Funil de Leads
          </h1>
          <button
            onClick={() => setEditing(emptyLead())}
            style={{ background: GOLD_SOFT, color: INK }}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium"
          >
            <Plus size={16} /> Novo
          </button>
        </div>
        <p style={{ color: MUTED, fontSize: '13px' }}>CRM da agência · compartilhado com a equipe</p>

        <div className="flex items-center gap-2 mt-4 px-3 py-2" style={{ background: INK_2 }}>
          <Search size={15} color={MUTED} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou nicho…"
            style={{ background: 'transparent', color: INK, outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto px-5 pb-6 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 style={{ color: INK, fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600 }}>
                {stage.label}
              </h2>
              <span
                style={{ color: GOLD_SOFT, fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', background: INK_2, padding: '2px 8px' }}
              >
                {counts[stage.id]}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {filtered
                .filter((l) => l.stage === stage.id)
                .map((lead) => {
                  const stageIdx = STAGES.findIndex((s) => s.id === lead.stage);
                  return (
                    <div
                      key={lead.id}
                      style={{ background: INK_2, borderLeft: `2px solid ${GOLD}` }}
                      className="p-3 cursor-pointer"
                      onClick={() => setEditing(lead)}
                    >
                      <p style={{ color: INK, fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>
                        {lead.nome || 'Sem nome'}
                      </p>
                      {lead.nicho && <p style={{ color: MUTED, fontSize: '12.5px', marginBottom: '8px' }}>{lead.nicho}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <button
                          disabled={stageIdx === 0}
                          onClick={(e) => { e.stopPropagation(); moveStage(lead.id, -1); }}
                          style={{ color: stageIdx === 0 ? '#C7BEAC' : MUTED }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          disabled={stageIdx === STAGES.length - 1}
                          onClick={(e) => { e.stopPropagation(); moveStage(lead.id, 1); }}
                          style={{ color: stageIdx === STAGES.length - 1 ? '#C7BEAC' : GOLD_SOFT }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              {counts[stage.id] === 0 && (
                <p style={{ color: '#C7BEAC', fontSize: '13px', fontStyle: 'italic', padding: '8px 4px' }}>Nenhum lead aqui</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        
