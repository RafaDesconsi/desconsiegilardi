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
        <LeadModal lead={editing} onClose={() => setEditing(null)} onSave={saveLead} onDelete={deleteLead} isNew={!leads.some((l) => l.id === editing.id)} />
      )}
    </div>
  );
}

function LeadModal({ lead, onClose, onSave, onDelete, isNew }) {
  const [form, setForm] = useState(lead);
  function update(field, value) { setForm({ ...form, [field]: value }); }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: 'rgba(5,8,11,0.7)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: CREAM, maxHeight: '90vh', overflowY: 'auto' }} className="w-full sm:w-96 sm:max-w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '20px', fontWeight: 600 }}>{isNew ? 'Novo lead' : 'Editar lead'}</h2>
          <button onClick={onClose}><X size={20} color={MUTED} /></button>
        </div>

        <Field label="Nome"><input value={form.nome} onChange={(e) => update('nome', e.target.value)} style={inputStyle} placeholder="Nome do lead" /></Field>
        <Field label="Nicho / segmento"><input value={form.nicho} onChange={(e) => update('nicho', e.target.value)} style={inputStyle} placeholder="Ex: clínica odontológica" /></Field>
        <Field label="Já investe em tráfego pago?"><ToggleRow value={form.jaInveste} onChange={(v) => update('jaInveste', v)} /></Field>
        <Field label="Investimento pretendido">
          <input value={form.faturamento} onChange={(e) => update('faturamento', e.target.value)} style={inputStyle} placeholder="Ex: R$ 3 mil/mês em mídia" />
        </Field>
        <Field label="Etapa do funil">
          <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} style={inputStyle}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Notas">
          <textarea value={form.notas} onChange={(e) => update('notas', e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Observações da conversa…" />
        </Field>

        <div className="flex gap-3 mt-6">
          {!isNew && <button onClick={() => onDelete(form.id)} style={{ background: INK_2, color: '#D9704A' }} className="p-3"><Trash2 size={16} /></button>}
          <button onClick={() => onSave(form)} disabled={!form.nome.trim()} style={{ background: form.nome.trim() ? GOLD_SOFT : '#C7BEAC', color: form.nome.trim() ? INK : MUTED, flex: 1 }} className="py-3 font-medium text-sm">
            Salvar lead
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= CLIENTES + TAREFAS ============================= */

const CLIENT_STATUS = {
  ativo: { label: 'Ativo', color: GREEN },
  pausado: { label: 'Pausado', color: GOLD_SOFT },
  encerrado: { label: 'Encerrado', color: '#6E7A88' },
};

const RESPONSAVEIS = ['Rafaela', 'Aline', 'Ambas'];

function emptyClient() {
  return {
    id: 'cli_' + Date.now() + Math.random().toString(36).slice(2, 7),
    nome: '',
    nicho: '',
    ticket: '',
    inicio: '',
    status: 'ativo',
    notas: '',
  };
}

function emptyTask(clienteId) {
  return {
    id: 'task_' + Date.now() + Math.random().toString(36).slice(2, 7),
    titulo: '',
    clienteId: clienteId || null,
    responsavel: 'Ambas',
    prazo: '',
    status: 'pendente',
    createdAt: new Date().toISOString(),
  };
}

function ClientesView({ clients, setClients, tasks, setTasks }) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showDone, setShowDone] = useState(false);

  function saveClient(client) {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) return prev.map((c) => (c.id === client.id ? client : c));
      return [...prev, client];
    });
    setEditingClient(null);
  }

  function deleteClient(id) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.clienteId !== id));
    setEditingClient(null);
    setSelectedClientId(null);
  }

  function saveTask(task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) return prev.map((t) => (t.id === task.id ? task : t));
      return [...prev, task];
    });
    setEditingTask(null);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditingTask(null);
  }

  function toggleTaskDone(task) {
    saveTask({ ...task, status: task.status === 'feito' ? 'pendente' : 'feito' });
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  if (selectedClient) {
    const clientTasks = tasks
      .filter((t) => t.clienteId === selectedClient.id)
      .filter((t) => showDone || t.status !== 'feito')
      .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));

    return (
      <div className="px-5 pt-5 pb-10">
        <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-1 mb-4" style={{ color: MUTED, fontSize: '14px' }}>
          <ArrowLeft size={16} /> Clientes
        </button>

        <div className="flex items-center justify-between mb-1">
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: INK, fontSize: '24px' }}>{selectedClient.nome}</h1>
          <span style={{ color: CLIENT_STATUS[selectedClient.status].color, fontSize: '12px', fontFamily: 'IBM Plex Mono, monospace' }}>
            {CLIENT_STATUS[selectedClient.status].label}
          </span>
        </div>
        <p style={{ color: MUTED, fontSize: '13px', marginBottom: '4px' }}>{selectedClient.nicho}</p>
        {selectedClient.ticket && <p style={{ color: GOLD_SOFT, fontSize: '13px', marginBottom: '16px' }}>Ticket: {selectedClient.ticket}</p>}

        <button onClick={() => setEditingClient(selectedClient)} style={{ background: INK_2, color: INK }} className="px-3 py-2 text-sm mb-6">
          Editar dados do cliente
        </button>

        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '17px', fontWeight: 600 }}>Tarefas</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowDone(!showDone)} style={{ color: showDone ? GOLD_SOFT : MUTED, fontSize: '12px' }}>
              {showDone ? 'Ocultar concluídas' : 'Ver concluídas'}
            </button>
            <button onClick={() => setEditingTask(emptyTask(selectedClient.id))} style={{ background: GOLD_SOFT, color: INK }} className="flex items-center gap-1 px-3 py-1.5 text-sm">
              <Plus size={14} /> Tarefa
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {clientTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={() => toggleTaskDone(task)} onEdit={() => setEditingTask(task)} />
          ))}
          {clientTasks.length === 0 && <p style={{ color: '#C7BEAC', fontSize: '13px', fontStyle: 'italic' }}>Nenhuma tarefa por aqui</p>}
        </div>

        {editingTask && (
          <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={saveTask} onDelete={deleteTask} isNew={!tasks.some((t) => t.id === editingTask.id)} clients={clients} lockedClientId={selectedClient.id} />
        )}
        {editingClient && (
          <ClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={saveClient} onDelete={deleteClient} isNew={false} />
        )}
      </div>
    );
  }

  const agencyTasks = tasks
    .filter((t) => !t.clienteId)
    .filter((t) => showDone || t.status !== 'feito')
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));

  return (
    <div className="px-5 pt-5 pb-10">
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: INK, fontSize: '24px' }}>Clientes</h1>
        <button onClick={() => setEditingClient(emptyClient())} style={{ background: GOLD_SOFT, color: INK }} className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
          <Plus size={16} /> Cliente
        </button>
      </div>
      <p style={{ color: MUTED, fontSize: '13px', marginBottom: '20px' }}>{clients.filter((c) => c.status === 'ativo').length} clientes ativos</p>

      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '17px', fontWeight: 600 }}>Tarefas da agência</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDone(!showDone)} style={{ color: showDone ? GOLD_SOFT : MUTED, fontSize: '12px' }}>
            {showDone ? 'Ocultar concluídas' : 'Ver concluídas'}
          </button>
          <button onClick={() => setEditingTask(emptyTask(null))} style={{ background: INK_2, color: GOLD_SOFT }} className="flex items-center gap-1 px-3 py-1.5 text-sm">
            <Plus size={14} /> Tarefa
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        {agencyTasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={() => toggleTaskDone(task)} onEdit={() => setEditingTask(task)} />
        ))}
        {agencyTasks.length === 0 && <p style={{ color: '#C7BEAC', fontSize: '13px', fontStyle: 'italic' }}>Nenhuma tarefa geral pendente</p>}
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '17px', fontWeight: 600, marginBottom: '12px' }}>Espaço dos clientes</h2>
      <div className="flex flex-col gap-3">
        {clients.map((client) => {
          const openTasks = tasks.filter((t) => t.clienteId === client.id && t.status !== 'feito').length;
          return (
            <div key={client.id} onClick={() => setSelectedClientId(client.id)} style={{ background: INK_2, borderLeft: `2px solid ${CLIENT_STATUS[client.status].color}` }} className="p-4 cursor-pointer flex items-center justify-between">
              <div>
                <p style={{ color: INK, fontSize: '16px', fontWeight: 500 }}>{client.nome}</p>
                <p style={{ color: MUTED, fontSize: '13px' }}>{client.nicho}</p>
              </div>
              <div className="flex items-center gap-3">
                {openTasks > 0 && (
                  <span style={{ color: GOLD_SOFT, fontSize: '12px', fontFamily: 'IBM Plex Mono, monospace' }}>{openTasks} tarefa{openTasks > 1 ? 's' : ''}</span>
                )}
                <ChevronRight size={18} color={MUTED} />
              </div>
            </div>
          );
        })}
        {clients.length === 0 && <p style={{ color: '#C7BEAC', fontSize: '13px', fontStyle: 'italic' }}>Nenhum cliente cadastrado ainda</p>}
      </div>

      {editingTask && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={saveTask} onDelete={deleteTask} isNew={!tasks.some((t) => t.id === editingTask.id)} clients={clients} />
      )}
      {editingClient && (
        <ClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={saveClient} onDelete={deleteClient} isNew={!clients.some((c) => c.id === editingClient.id)} />
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit }) {
  const done = task.status === 'feito';
  return (
    <div style={{ background: INK_2 }} className="p-3 flex items-center gap-3">
      <button onClick={onToggle}>
        {done ? <CheckCircle2 size={20} color={GREEN} /> : <Circle size={20} color={MUTED} />}
      </button>
      <div className="flex-1 cursor-pointer" onClick={onEdit}>
        <p style={{ color: done ? MUTED : INK, fontSize: '14.5px', textDecoration: done ? 'line-through' : 'none' }}>{task.titulo || 'Sem título'}</p>
        <div className="flex gap-3 mt-0.5">
          {task.responsavel && <span style={{ color: MUTED, fontSize: '11.5px' }}>{task.responsavel}</span>}
          {task.prazo && <span style={{ color: MUTED, fontSize: '11.5px' }}>{task.prazo}</span>}
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, onClose, onSave, onDelete, isNew, clients, lockedClientId }) {
  const [form, setForm] = useState(task);
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: 'rgba(5,8,11,0.7)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: CREAM, maxHeight: '90vh', overflowY: 'auto' }} className="w-full sm:w-96 sm:max-w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '20px', fontWeight: 600 }}>{isNew ? 'Nova tarefa' : 'Editar tarefa'}</h2>
          <button onClick={onClose}><X size={20} color={MUTED} /></button>
        </div>

        <Field label="Título"><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="O que precisa ser feito?" /></Field>

        {!lockedClientId && (
          <Field label="Cliente (ou geral da agência)">
            <select value={form.clienteId || ''} onChange={(e) => setForm({ ...form, clienteId: e.target.value || null })} style={inputStyle}>
              <option value="">Tarefa geral da agência</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
        )}

        <Field label="Responsável">
          <select value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} style={inputStyle}>
            {RESPONSAVEIS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Prazo">
          <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} style={inputStyle} />
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
            <option value="pendente">Pendente</option>
            <option value="fazendo">Fazendo</option>
            <option value="feito">Feito</option>
          </select>
        </Field>

        <div className="flex gap-3 mt-6">
          {!isNew && <button onClick={() => onDelete(form.id)} style={{ background: INK_2, color: '#D9704A' }} className="p-3"><Trash2 size={16} /></button>}
          <button onClick={() => onSave(form)} disabled={!form.titulo.trim()} style={{ background: form.titulo.trim() ? GOLD_SOFT : '#C7BEAC', color: form.titulo.trim() ? INK : MUTED, flex: 1 }} className="py-3 font-medium text-sm">
            Salvar tarefa
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onSave, onDelete, isNew }) {
  const [form, setForm] = useState(client);
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: 'rgba(5,8,11,0.7)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: CREAM, maxHeight: '90vh', overflowY: 'auto' }} className="w-full sm:w-96 sm:max-w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '20px', fontWeight: 600 }}>{isNew ? 'Novo cliente' : 'Editar cliente'}</h2>
          <button onClick={onClose}><X size={20} color={MUTED} /></button>
        </div>

        <Field label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder="Nome do cliente/empresa" /></Field>
        <Field label="Nicho / segmento"><input value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })} style={inputStyle} placeholder="Ex: clínica odontológica" /></Field>
        <Field label="Ticket mensal"><input value={form.ticket} onChange={(e) => setForm({ ...form, ticket: e.target.value })} style={inputStyle} placeholder="Ex: R$ 2.500/mês" /></Field>
        <Field label="Início do contrato"><input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} style={inputStyle} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
            {Object.entries(CLIENT_STATUS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Notas">
          <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Observações sobre o cliente…" />
        </Field>

        <div className="flex gap-3 mt-6">
          {!isNew && <button onClick={() => onDelete(form.id)} style={{ background: INK_2, color: '#D9704A' }} className="p-3"><Trash2 size={16} /></button>}
          <button onClick={() => onSave(form)} disabled={!form.nome.trim()} style={{ background: form.nome.trim() ? GOLD_SOFT : '#C7BEAC', color: form.nome.trim() ? INK : MUTED, flex: 1 }} className="py-3 font-medium text-sm">
            Salvar cliente
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= DASHBOARD + IMPORTAÇÃO ============================= */

const CHART_COLORS = [GOLD_SOFT, '#7FB08A', '#6E8AA8', '#D9704A', '#B8923F', '#8A93A0'];

function parseNumber(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return raw;
  let s = String(raw).trim();
  if (!s) return 0;
  s = s.replace(/[^\d,.\-]/g, '');
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (lastComma > -1) {
    const decimals = s.length - lastComma - 1;
    if (decimals === 2) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (lastDot > -1) {
    const decimals = s.length - lastDot - 1;
    if (decimals !== 2) s = s.replace(/\./g, '');
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function guessColumn(headers, keywords) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx > -1) return headers[idx];
  }
  return '';
}

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = Papa.parse(reader.result, { header: true, skipEmptyLines: true });
        const headers = result.meta.fields || [];
        resolve({ headers, rows: result.data });
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const wb = XLSX.read(reader.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const headers = rows.length ? Object.keys(rows[0]) : [];
          resolve({ headers, rows });
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    }
  });
}

function emptyReport(clienteId, mes) {
  return {
    id: 'rel_' + Date.now() + Math.random().toString(36).slice(2, 7),
    clienteId,
    mes,
    investimentoTotal: 0,
    porObjetivo: [],
    seguidores: 0,
    mensagens: 0,
    ctr: 0,
    criadoEm: new Date().toISOString(),
  };
}

function DashboardView({ clients, reports, setReports }) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  function saveReport(report) {
    setReports((prev) => {
      const exists = prev.some((r) => r.clienteId === report.clienteId && r.mes === report.mes);
      if (exists) return prev.map((r) => (r.clienteId === report.clienteId && r.mes === report.mes ? report : r));
      return [...prev, report];
    });
    setImporting(false);
  }

  function deleteReport(id) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  if (!selectedClient) {
    return (
      <div className="px-5 pt-5 pb-10">
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: INK, fontSize: '24px', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: MUTED, fontSize: '13px', marginBottom: '20px' }}>Selecione um cliente pra ver os resultados</p>

        <div className="flex flex-col gap-3">
          {clients.map((client) => {
            const clientReports = reports.filter((r) => r.clienteId === client.id);
            return (
              <div key={client.id} onClick={() => setSelectedClientId(client.id)} style={{ background: INK_2 }} className="p-4 cursor-pointer flex items-center justify-between">
                <div>
                  <p style={{ color: INK, fontSize: '16px', fontWeight: 500 }}>{client.nome}</p>
                  <p style={{ color: MUTED, fontSize: '13px' }}>{clientReports.length} relatório{clientReports.length !== 1 ? 's' : ''} importado{clientReports.length !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={18} color={MUTED} />
              </div>
            );
          })}
          {clients.length === 0 && <p style={{ color: '#C7BEAC', fontSize: '13px', fontStyle: 'italic' }}>Cadastre um cliente na aba Clientes primeiro</p>}
        </div>
      </div>
    );
  }

  const clientReports = reports.filter((r) => r.clienteId === selectedClient.id).sort((a, b) => a.mes.localeCompare(b.mes));
  const latest = clientReports[clientReports.length - 1];
  const chartData = clientReports.map((r) => ({ mes: r.mes, investimento: r.investimentoTotal }));
  const objetivoData = latest ? latest.porObjetivo.filter((o) => o.valor > 0) : [];

  return (
    <div className="px-5 pt-5 pb-10">
      <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-1 mb-4" style={{ color: MUTED, fontSize: '14px' }}>
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: INK, fontSize: '24px' }}>{selectedClient.nome}</h1>
        <div className="flex gap-2">
          {clientReports.length > 0 && (
            <button onClick={() => setExporting(true)} style={{ background: INK_2, color: GOLD_SOFT }} className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
              <FileSpreadsheet size={14} /> Exportar
            </button>
          )}
          <button onClick={() => setImporting(true)} style={{ background: GOLD_SOFT, color: INK }} className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
            <Upload size={14} /> Importar
          </button>
        </div>
      </div>
      <p style={{ color: MUTED, fontSize: '13px', marginBottom: '20px' }}>{clientReports.length} relatório{clientReports.length !== 1 ? 's' : ''} · {selectedClient.nicho}</p>

      {!latest && (
        <div style={{ background: INK_2, padding: '24px' }} className="text-center">
          <FileSpreadsheet size={28} color={MUTED} style={{ margin: '0 auto 10px' }} />
          <p style={{ color: MUTED, fontSize: '14px' }}>Nenhum relatório importado ainda.</p>
          <p style={{ color: '#5A6470', fontSize: '12.5px', marginTop: '4px' }}>Exporte o arquivo do Meta Ads ou Google Ads e importe aqui.</p>
        </div>
      )}

      {latest && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <KpiCard label="Investimento (último mês)" value={`R$ ${latest.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <KpiCard label="CTR médio" value={`${latest.ctr.toFixed(2)}%`} />
            <KpiCard label="Mensagens" value={latest.mensagens.toLocaleString('pt-BR')} />
            <KpiCard label="Seguidores" value={latest.seguidores.toLocaleString('pt-BR')} />
          </div>

          {chartData.length > 1 && (
            <div style={{ background: INK_2, padding: '16px' }} className="mb-6">
              <p style={{ color: INK, fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Investimento por mês</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={INK_3} />
                  <XAxis dataKey="mes" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} />
                  <Tooltip contentStyle={{ background: CREAM, border: `1px solid ${INK_3}`, color: INK }} />
                  <Bar dataKey="investimento" fill={GOLD_SOFT} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {objetivoData.length > 0 && (
            <div style={{ background: INK_2, padding: '16px' }} className="mb-6">
              <p style={{ color: INK, fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Investimento por objetivo (último mês)</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={objetivoData} dataKey="valor" nameKey="objetivo" cx="50%" cy="50%" outerRadius={70} label={(d) => d.objetivo}>
                    {objetivoData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: CREAM, border: `1px solid ${INK_3}`, color: INK }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <p style={{ color: INK, fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>Histórico de relatórios</p>
          <div className="flex flex-col gap-2">
            {[...clientReports].reverse().map((r) => (
              <div key={r.id} style={{ background: INK_2 }} className="p-3 flex items-center justify-between">
                <div>
                  <p style={{ color: INK, fontSize: '14px' }}>{r.mes}</p>
                  <p style={{ color: MUTED, fontSize: '12px' }}>R$ {r.investimentoTotal.toLocaleString('pt-BR')} · CTR {r.ctr.toFixed(2)}%</p>
                </div>
                <button onClick={() => deleteReport(r.id)}><Trash2 size={15} color="#D9704A" /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {importing && (
        <ImportModal clientId={selectedClient.id} existingReports={clientReports} onClose={() => setImporting(false)} onSave={saveReport} />
      )}

      {exporting && (
        <ReportPrintView client={selectedClient} reports={clientReports} onClose={() => setExporting(false)} />
      )}
    </div>
  );
}

function ReportPrintView({ client, reports, onClose }) {
  const sorted = [...reports].sort((a, b) => a.mes.localeCompare(b.mes));
  const latest = sorted[sorted.length - 1];
  const objetivoData = latest ? latest.porObjetivo.filter((o) => o.valor > 0) : [];
  const chartData = sorted.map((r) => ({ mes: r.mes, investimento: r.investimentoTotal }));
  const hoje = new Date().toLocaleDateString('pt-BR');
  const PRINT_INK = '#1D2733';
  const PRINT_GOLD = '#9C7A2E';
  const PRINT_MUTED = '#6B7480';

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 60, overflowY: 'auto' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E2E2E2' }}>
        <p style={{ color: PRINT_INK, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '16px' }}>Pré-visualização do relatório</p>
        <div className="flex gap-2">
          <button onClick={onClose} style={{ color: PRINT_MUTED, fontSize: '14px' }}>Fechar</button>
          <button onClick={() => window.print()} style={{ background: PRINT_GOLD, color: '#fff' }} className="px-4 py-2 text-sm font-medium">Imprimir / Salvar PDF</button>
        </div>
      </div>

      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1" style={{ borderBottom: `2px solid ${PRINT_GOLD}`, paddingBottom: '16px' }}>
          <div>
            <p style={{ color: PRINT_MUTED, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace' }}>Relatório de Resultados</p>
            <h1 style={{ color: PRINT_INK, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '28px', marginTop: '4px' }}>{client.nome}</h1>
            <p style={{ color: PRINT_MUTED, fontSize: '13px', marginTop: '2px' }}>{client.nicho}</p>
          </div>
          <p style={{ color: PRINT_MUTED, fontSize: '12px' }}>Gerado em {hoje}</p>
        </div>

        {latest && (
          <div className="grid grid-cols-2 gap-4 my-8">
            <PrintKpi label="Investimento (último mês)" value={`R$ ${latest.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} ink={PRINT_INK} gold={PRINT_GOLD} muted={PRINT_MUTED} />
            <PrintKpi label="CTR médio" value={`${latest.ctr.toFixed(2)}%`} ink={PRINT_INK} gold={PRINT_GOLD} muted={PRINT_MUTED} />
            <PrintKpi label="Mensagens" value={latest.mensagens.toLocaleString('pt-BR')} ink={PRINT_INK} gold={PRINT_GOLD} muted={PRINT_MUTED} />
            <PrintKpi label="Seguidores" value={latest.seguidores.toLocaleString('pt-BR')} ink={PRINT_INK} gold={PRINT_GOLD} muted={PRINT_MUTED} />
          </div>
        )}

        {chartData.length > 1 && (
          <div className="mb-8">
            <p style={{ color: PRINT_INK, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>Investimento por mês</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" />
                <XAxis dataKey="mes" stroke={PRINT_MUTED} fontSize={11} />
                <YAxis stroke={PRINT_MUTED} fontSize={11} />
                <Tooltip />
                <Bar dataKey="investimento" fill={PRINT_GOLD} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {objetivoData.length > 0 && (
          <div className="mb-8">
            <p style={{ color: PRINT_INK, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>Investimento por objetivo</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {objetivoData.map((o, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EDEDED' }}>
                    <td style={{ padding: '8px 0', color: PRINT_INK, fontSize: '13.5px' }}>{o.objetivo}</td>
                    <td style={{ padding: '8px 0', color: PRINT_INK, fontSize: '13.5px', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>R$ {o.valor.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-8">
          <p style={{ color: PRINT_INK, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>Histórico mensal</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${PRINT_INK}` }}>
                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px', color: PRINT_MUTED, fontWeight: 500 }}>Mês</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: PRINT_MUTED, fontWeight: 500 }}>Investimento</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: PRINT_MUTED, fontWeight: 500 }}>CTR</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: PRINT_MUTED, fontWeight: 500 }}>Mensagens</th>
              </tr>
            </thead>
            <tbody>
              {[...sorted].reverse().map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #EDEDED' }}>
                  <td style={{ padding: '8px 0', fontSize: '13.5px', color: PRINT_INK }}>{r.mes}</td>
                  <td style={{ padding: '8px 0', fontSize: '13.5px', color: PRINT_INK, textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>R$ {r.investimentoTotal.toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '8px 0', fontSize: '13.5px', color: PRINT_INK, textAlign: 'right' }}>{r.ctr.toFixed(2)}%</td>
                  <td style={{ padding: '8px 0', fontSize: '13.5px', color: PRINT_INK, textAlign: 'right' }}>{r.mensagens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: PRINT_MUTED, fontSize: '11px', marginTop: '40px', borderTop: '1px solid #EDEDED', paddingTop: '16px' }}>
          Relatório gerado automaticamente a partir dos dados importados no dashboard da agência.
        </p>
      </div>
    </div>
  );
}

function PrintKpi({ label, value, ink, gold, muted }) {
  return (
    <div style={{ borderLeft: `2px solid ${gold}`, paddingLeft: '12px' }}>
      <p style={{ color: muted, fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: ink, fontSize: '20px', fontFamily: 'IBM Plex Mono, monospace' }}>{value}</p>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div style={{ background: INK_2, padding: '14px' }}>
      <p style={{ color: MUTED, fontSize: '11.5px', marginBottom: '6px' }}>{label}</p>
      <p style={{ color: GOLD_SOFT, fontSize: '19px', fontFamily: 'IBM Plex Mono, monospace' }}>{value}</p>
    </div>
  );
}

function ImportModal({ clientId, existingReports, onClose, onSave }) {
  const [step, setStep] = useState('upload');
  const [mes, setMes] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({ investimento: '', ctr: '', mensagens: '', seguidores: '', objetivo: '' });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    try {
      const result = await parseFile(file);
      if (!result.headers.length) {
        setError('Não consegui identificar colunas nesse arquivo. Tente exportar novamente.');
        return;
      }
      setParsed(result);
      setMapping({
        investimento: guessColumn(result.headers, ['valor usado', 'amount spent', 'gasto', 'investimento', 'custo']),
        ctr: guessColumn(result.headers, ['ctr', 'taxa de cliques', 'click-through']),
        mensagens: guessColumn(result.headers, ['mensagens', 'messages', 'conversas iniciadas']),
        seguidores: guessColumn(result.headers, ['seguidores', 'followers', 'curtidas da página', 'page likes']),
        objetivo: guessColumn(result.headers, ['objetivo', 'objective', 'campaign objective']),
      });
      setStep('mapping');
    } catch (err) {
      setError('Não consegui ler esse arquivo. Confira se é um .csv ou .xlsx exportado do Meta/Google Ads.');
    }
  }

  function buildPreview() {
    const rows = parsed.rows;
    const sumCol = (col) => rows.reduce((acc, r) => acc + parseNumber(r[col]), 0);
    const avgCol = (col) => (rows.length ? rows.reduce((acc, r) => acc + parseNumber(r[col]), 0) / rows.length : 0);

    const investimentoTotal = mapping.investimento ? sumCol(mapping.investimento) : 0;
    const ctr = mapping.ctr ? avgCol(mapping.ctr) : 0;
    const mensagens = mapping.mensagens ? sumCol(mapping.mensagens) : 0;
    const seguidores = mapping.seguidores ? sumCol(mapping.seguidores) : 0;

    let porObjetivo = [];
    if (mapping.objetivo && mapping.investimento) {
      const groups = {};
      rows.forEach((r) => {
        const key = String(r[mapping.objetivo] || 'Sem objetivo').trim();
        groups[key] = (groups[key] || 0) + parseNumber(r[mapping.investimento]);
      });
      porObjetivo = Object.entries(groups).map(([objetivo, valor]) => ({ objetivo, valor: Math.round(valor * 100) / 100 }));
    }

    setPreview({
      investimentoTotal: Math.round(investimentoTotal * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      mensagens: Math.round(mensagens),
      seguidores: Math.round(seguidores),
      porObjetivo,
    });
    setStep('preview');
  }

  function confirmSave() {
    const report = emptyReport(clientId, mes);
    report.investimentoTotal = preview.investimentoTotal;
    report.ctr = preview.ctr;
    report.mensagens = preview.mensagens;
    report.seguidores = preview.seguidores;
    report.porObjetivo = preview.porObjetivo;
    onSave(report);
  }

  const alreadyExists = mes && existingReports.some((r) => r.mes === mes);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: 'rgba(5,8,11,0.7)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: CREAM, maxHeight: '90vh', overflowY: 'auto' }} className="w-full sm:w-96 sm:max-w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'Fraunces, serif', color: INK, fontSize: '20px', fontWeight: 600 }}>Importar relatório</h2>
          <button onClick={onClose}><X size={20} color={MUTED} /></button>
        </div>

        {step === 'upload' && (
          <>
            <Field label="Mês de referência">
              <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Arquivo exportado (Meta Ads ou Google Ads, .csv ou .xlsx)">
              <label style={{ background: INK_2, color: INK, padding: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Upload size={16} color={GOLD_SOFT} />
                <span style={{ fontSize: '13.5px' }}>{fileName || 'Escolher arquivo…'}</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </Field>
            {error && <p style={{ color: '#D9704A', fontSize: '13px' }}>{error}</p>}
            {!mes && <p style={{ color: MUTED, fontSize: '12px' }}>Selecione o mês antes de escolher o arquivo.</p>}
          </>
        )}

        {step === 'mapping' && parsed && (
          <>
            <p style={{ color: MUTED, fontSize: '12.5px', marginBottom: '16px' }}>
              Identifiquei {parsed.headers.length} colunas em {fileName}. Confira se o app escolheu certo — ajuste se precisar.
            </p>
            <MapField label="Coluna de investimento" value={mapping.investimento} headers={parsed.headers} onChange={(v) => setMapping({ ...mapping, investimento: v })} />
            <MapField label="Coluna de objetivo da campanha (opcional, pra separar investimento por objetivo)" value={mapping.objetivo} headers={parsed.headers} onChange={(v) => setMapping({ ...mapping, objetivo: v })} />
            <MapField label="Coluna de CTR" value={mapping.ctr} headers={parsed.headers} onChange={(v) => setMapping({ ...mapping, ctr: v })} />
            <MapField label="Coluna de mensagens" value={mapping.mensagens} headers={parsed.headers} onChange={(v) => setMapping({ ...mapping, mensagens: v })} />
            <MapField label="Coluna de seguidores" value={mapping.seguidores} headers={parsed.headers} onChange={(v) => setMapping({ ...mapping, seguidores: v })} />

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('upload')} style={{ background: INK_2, color: MUTED }} className="px-4 py-3 text-sm">Voltar</button>
              <button onClick={buildPreview} style={{ background: GOLD_SOFT, color: INK, flex: 1 }} className="py-3 font-medium text-sm">Calcular</button>
            </div>
          </>
        )}

        {step === 'preview' && preview && (
          <>
            <p style={{ color: MUTED, fontSize: '12.5px', marginBottom: '14px' }}>
              Confira os números antes de salvar — pode ajustar qualquer valor manualmente.
            </p>
            <Field label="Investimento total (R$)">
              <input type="number" value={preview.investimentoTotal} onChange={(e) => setPreview({ ...preview, investimentoTotal: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </Field>
            <Field label="CTR médio (%)">
              <input type="number" value={preview.ctr} onChange={(e) => setPreview({ ...preview, ctr: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </Field>
            <Field label="Mensagens">
              <input type="number" value={preview.mensagens} onChange={(e) => setPreview({ ...preview, mensagens: parseInt(e.target.value) || 0 })} style={inputStyle} />
            </Field>
            <Field label="Seguidores">
              <input type="number" value={preview.seguidores} onChange={(e) => setPreview({ ...preview, seguidores: parseInt(e.target.value) || 0 })} style={inputStyle} />
            </Field>

            {preview.porObjetivo.length > 0 && (
              <Field label="Investimento por objetivo">
                <div className="flex flex-col gap-2">
                  {preview.porObjetivo.map((o, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={o.objetivo} onChange={(e) => {
                        const next = [...preview.porObjetivo];
                        next[i] = { ...next[i], objetivo: e.target.value };
                        setPreview({ ...preview, porObjetivo: next });
                      }} style={{ ...inputStyle, flex: 2 }} />
                      <input type="number" value={o.valor} onChange={(e) => {
                        const next = [...preview.porObjetivo];
                        next[i] = { ...next[i], valor: parseFloat(e.target.value) || 0 };
                        setPreview({ ...preview, porObjetivo: next });
                      }} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  ))}
                </div>
              </Field>
            )}

            {alreadyExists && (
              <p style={{ color: GOLD_SOFT, fontSize: '12px', marginBottom: '10px' }}>
                Já existe um relatório pra esse mês — salvar vai substituir os dados anteriores.
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('mapping')} style={{ background: INK_2, color: MUTED }} className="px-4 py-3 text-sm">Voltar</button>
              <button onClick={confirmSave} style={{ background: GOLD_SOFT, color: INK, flex: 1 }} className="py-3 font-medium text-sm">Salvar relatório</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MapField({ label, value, headers, onChange }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">Não encontrado / ignorar</option>
        {headers.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
    </Field>
  );
}

/* ============================= APP SHELL ============================= */

export default function App() {
  const [tab, setTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const loadedRef = useRef(false);
  const skipLeadsSave = useRef(true);
  const skipClientsSave = useRef(true);
  const skipTasksSave = useRef(true);
  const skipReportsSave = useRef(true);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function withRetry(fn, retries = 3, delayMs = 700) {
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await fn();
        if (result !== false) return result;
      } catch (e) {
        // tenta de novo
      }
      if (i < retries) await wait(delayMs * (i + 1));
    }
    return null;
  }

  useEffect(() => {
    (async () => {
      const load = async (key, setter) => {
        const r = await withRetry(() => window.storage.get(key, true).catch(() => null));
        if (r && r.value) setter(JSON.parse(r.value));
      };
      await load('agencia-crm-leads', setLeads);
      await wait(150);
      await load('agencia-clientes', setClients);
      await wait(150);
      await load('agencia-tarefas', setTasks);
      await wait(150);
      await load('agencia-relatorios', setReports);
      setLoading(false);
      loadedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipLeadsSave.current) { skipLeadsSave.current = false; return; }
    withRetry(() => window.storage.set('agencia-crm-leads', JSON.stringify(leads), true)).then((r) => {
      if (r) setSaveError(false); else setSaveError(true);
    });
  }, [leads]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipClientsSave.current) { skipClientsSave.current = false; return; }
    withRetry(() => window.storage.set('agencia-clientes', JSON.stringify(clients), true)).then((r) => {
      if (r) setSaveError(false); else setSaveError(true);
    });
  }, [clients]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipTasksSave.current) { skipTasksSave.current = false; return; }
    withRetry(() => window.storage.set('agencia-tarefas', JSON.stringify(tasks), true)).then((r) => {
      if (r) setSaveError(false); else setSaveError(true);
    });
  }, [tasks]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipReportsSave.current) { skipReportsSave.current = false; return; }
    withRetry(() => window.storage.set('agencia-relatorios', JSON.stringify(reports), true)).then((r) => {
      if (r) setSaveError(false); else setSaveError(true);
    });
  }, [reports]);

  if (loading) {
    return (
      <div style={{ background: CREAM, minHeight: '100vh' }} className="flex items-center justify-center">
        <p style={{ color: MUTED, fontFamily: 'IBM Plex Sans, sans-serif' }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {FONTS}

      <div className="flex items-center justify-center py-5" style={{ background: INK }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', letterSpacing: '0.01em' }}>
          <span style={{ color: CREAM }}>Desconsi</span>
          <span style={{ color: GOLD_SOFT, fontStyle: 'italic', margin: '0 8px' }}>&</span>
          <span style={{ color: CREAM }}>Gilardi</span>
        </p>
      </div>

      <div className="flex" style={{ borderBottom: `1px solid ${INK_3}` }}>
        <button
          onClick={() => setTab('leads')}
          style={{ color: tab === 'leads' ? GOLD_SOFT : MUTED, borderBottom: tab === 'leads' ? `2px solid ${GOLD_SOFT}` : '2px solid transparent' }}
          className="flex-1 py-3 text-sm font-medium"
        >
          Leads
        </button>
        <button
          onClick={() => setTab('clientes')}
          style={{ color: tab === 'clientes' ? GOLD_SOFT : MUTED, borderBottom: tab === 'clientes' ? `2px solid ${GOLD_SOFT}` : '2px solid transparent' }}
          className="flex-1 py-3 text-sm font-medium"
        >
          Clientes
        </button>
        <button
          onClick={() => setTab('dashboard')}
          style={{ color: tab === 'dashboard' ? GOLD_SOFT : MUTED, borderBottom: tab === 'dashboard' ? `2px solid ${GOLD_SOFT}` : '2px solid transparent' }}
          className="flex-1 py-3 text-sm font-medium"
        >
          Dashboard
        </button>
      </div>

      {saveError && (
        <p style={{ color: '#D9704A', fontSize: '12px', padding: '8px 20px 0' }}>
          Não foi possível salvar as últimas alterações. Verifique a conexão e tente novamente.
        </p>
      )}

      {tab === 'leads' && <LeadsView leads={leads} setLeads={setLeads} />}
      {tab === 'clientes' && <ClientesView clients={clients} setClients={setClients} tasks={tasks} setTasks={setTasks} />}
      {tab === 'dashboard' && <DashboardView clients={clients} reports={reports} setReports={setReports} />}
    </div>
  );
}
