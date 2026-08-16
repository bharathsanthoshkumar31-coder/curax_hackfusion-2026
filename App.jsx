import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  QrCode, UserPlus, Stethoscope, AlertTriangle, Search,
  Heart, Phone, Pill, CalendarClock, Plus, ChevronRight,
  ShieldAlert, ClipboardList, ArrowLeft, CheckCircle2, Languages
} from "lucide-react";

// ---------- Deterministic pseudo-QR renderer (visual, seeded from patient ID) ----------
function seededGrid(seed, size) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) row.push(rand() > 0.52);
    grid.push(row);
  }
  return grid;
}

function QRCodeVisual({ value, size = 132 }) {
  const cells = 21;
  const grid = useMemo(() => seededGrid(value, cells), [value]);
  const cellSize = size / cells;

  const isFinder = (x, y) => {
    const corners = [[0, 0], [cells - 7, 0], [0, cells - 7]];
    return corners.some(([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
  };
  const drawFinder = (cx, cy) => (
    <g key={`f-${cx}-${cy}`}>
      <rect x={cx * cellSize} y={cy * cellSize} width={7 * cellSize} height={7 * cellSize} fill="#0A1330" />
      <rect x={(cx + 1) * cellSize} y={(cy + 1) * cellSize} width={5 * cellSize} height={5 * cellSize} fill="#fff" />
      <rect x={(cx + 2) * cellSize} y={(cy + 2) * cellSize} width={3 * cellSize} height={3 * cellSize} fill="#0A1330" />
    </g>
  );

  return (
    <svg width={size} height={size} className="rounded-md" style={{ background: "#fff" }}>
      {grid.map((row, y) =>
        row.map((on, x) =>
          !isFinder(x, y) && on ? (
            <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="#0A1330" />
          ) : null
        )
      )}
      {drawFinder(0, 0)}
      {drawFinder(cells - 7, 0)}
      {drawFinder(0, cells - 7)}
    </svg>
  );
}

// ---------- Seed data ----------
const seedPatients = [
  {
    id: "CURAX-PT-10293",
    name: "Ramesh Kumar",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    allergies: "Penicillin",
    chronic: "Type 2 Diabetes",
    emergencyName: "Lakshmi Kumar (Wife)",
    emergencyPhone: "+91 98765 43210",
    phone: "+91 90000 11122",
    language: "Tamil",
    visits: [
      {
        date: "2026-06-02",
        hospital: "Chennai Rural Health Clinic",
        doctor: "Dr. S. Anitha",
        diagnosis: "Routine diabetes follow-up, elevated blood sugar",
        prescription: "Metformin 500mg — twice daily, 30 days",
        followUp: "2026-08-20",
      },
    ],
  },
  {
    id: "CURAX-PT-10417",
    name: "Priya Suresh",
    age: 29,
    gender: "Female",
    bloodGroup: "O-",
    allergies: "None known",
    chronic: "Asthma",
    emergencyName: "Suresh Babu (Father)",
    emergencyPhone: "+91 98123 45670",
    phone: "+91 90111 22233",
    language: "English",
    visits: [],
  },
];

function newId() {
  return "CURAX-PT-" + Math.floor(10000 + Math.random() * 89999);
}

// ---------- Shared style tokens ----------
const COLORS = {
  base: "#080B1A",
  panel: "#0E1430",
  toast: "#0F1730",
};
const panelStyle = { backgroundColor: COLORS.panel };
const inputStyle = { backgroundColor: COLORS.panel };

// ---------- Shared UI bits ----------
function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold tracking-wide text-blue-200/70 uppercase mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition";

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-900/40"
          : "text-blue-200/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ---------- Main App ----------
export default function CuraxPrototype() {
  const [patients, setPatients] = useState(seedPatients);
  const [tab, setTab] = useState("register");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div
      className="min-h-screen w-full text-white font-sans"
      style={{
        backgroundColor: COLORS.base,
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09), transparent 55%)",
      }}
    >
      {/* Header */}
      <header
        className="border-b border-white/10 sticky top-0 z-20 backdrop-blur-md"
        style={{ backgroundColor: "rgba(8,11,26,0.9)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
              <Heart size={18} className="text-white" fill="white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none">Curax</div>
              <div className="text-xs text-blue-300/60 leading-none mt-1">One QR. A Lifetime of Care.</div>
            </div>
          </div>
          <nav className="flex items-center gap-1.5">
            <NavButton active={tab === "register"} onClick={() => setTab("register")} icon={UserPlus} label="Register" />
            <NavButton active={tab === "clinic"} onClick={() => setTab("clinic")} icon={Stethoscope} label="Clinic Scan" />
            <NavButton active={tab === "emergency"} onClick={() => setTab("emergency")} icon={ShieldAlert} label="Emergency Mode" />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "register" && <RegisterTab patients={patients} setPatients={setPatients} showToast={showToast} />}
        {tab === "clinic" && <ClinicTab patients={patients} setPatients={setPatients} showToast={showToast} />}
        {tab === "emergency" && <EmergencyTab patients={patients} />}
      </main>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border border-blue-500/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm"
          style={{ backgroundColor: COLORS.toast }}
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
// ---------- Register Tab ----------
function RegisterTab({ patients, setPatients, showToast }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", bloodGroup: "O+",
    allergies: "", chronic: "", emergencyName: "", emergencyPhone: "",
    phone: "", language: "English",
  });
  const [justRegistered, setJustRegistered] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.age) return;
    const patient = { ...form, id: newId(), visits: [] };
    setPatients((p) => [patient, ...p]);
    setJustRegistered(patient);
    showToast(`${patient.name} registered — QR code generated`);
    setForm({ name: "", age: "", gender: "Male", bloodGroup: "O+", allergies: "", chronic: "", emergencyName: "", emergencyPhone: "", phone: "", language: "English" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="border border-white/10 rounded-2xl p-6" style={panelStyle}>
        <h2 className="text-xl font-bold mb-1">Patient Registration</h2>
        <p className="text-sm text-blue-200/60 mb-6">One-time intake — filled by clinic staff on a patient's first visit.</p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-x-5">
          <Field label="Full Name"><input required className={inputCls} style={inputStyle} value={form.name} onChange={set("name")} placeholder="e.g. Ramesh Kumar" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age"><input required type="number" className={inputCls} style={inputStyle} value={form.age} onChange={set("age")} placeholder="58" /></Field>
            <Field label="Gender">
              <select className={inputCls} style={inputStyle} value={form.gender} onChange={set("gender")}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
          </div>
          <Field label="Blood Group">
            <select className={inputCls} style={inputStyle} value={form.bloodGroup} onChange={set("bloodGroup")}>
              {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Preferred Language">
            <select className={inputCls} style={inputStyle} value={form.language} onChange={set("language")}>
              <option>English</option><option>Tamil</option><option>Hindi</option>
            </select>
          </Field>
          <Field label="Known Allergies"><input className={inputCls} style={inputStyle} value={form.allergies} onChange={set("allergies")} placeholder="e.g. Penicillin, or 'None known'" /></Field>
          <Field label="Chronic Conditions"><input className={inputCls} style={inputStyle} value={form.chronic} onChange={set("chronic")} placeholder="e.g. Diabetes, Asthma" /></Field>
          <Field label="Emergency Contact Name"><input className={inputCls} style={inputStyle} value={form.emergencyName} onChange={set("emergencyName")} placeholder="e.g. Lakshmi Kumar (Wife)" /></Field>
          <Field label="Emergency Contact Phone"><input className={inputCls} style={inputStyle} value={form.emergencyPhone} onChange={set("emergencyPhone")} placeholder="+91 ..." /></Field>
          <Field label="Patient Phone (for reminders)"><input className={inputCls} style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="+91 ..." /></Field>
          <div className="sm:col-span-2 mt-2">
            <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:brightness-110 transition px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
              <QrCode size={16} /> Register & Generate QR
            </button>
          </div>
        </form>
      </div>

      <div className="border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ ...panelStyle, minHeight: "380px" }}>
        {justRegistered ? (
          <>
            <div className="text-xs uppercase tracking-wide text-blue-300/60 mb-3">Patient QR Card</div>
            <div className="bg-white p-3 rounded-xl shadow-xl">
              <QRCodeVisual value={justRegistered.id} size={150} />
            </div>
            <div className="mt-4 font-bold text-lg">{justRegistered.name}</div>
            <div className="text-xs text-blue-300/70 font-mono mt-1">{justRegistered.id}</div>
            <p className="text-xs text-blue-200/50 mt-4" style={{ maxWidth: "220px" }}>Print this or send it via SMS. Scanning it at any clinic pulls up this patient's full record.</p>
          </>
        ) : (
          <>
            <QrCode size={40} className="text-blue-400/40 mb-3" />
            <p className="text-sm text-blue-200/50" style={{ maxWidth: "220px" }}>Register a patient to generate their unique QR health card.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Clinic Tab ----------
function ClinicTab({ patients, setPatients, showToast }) {
  const [selectedId, setSelectedId] = useState("");
  const [scanned, setScanned] = useState(null);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ diagnosis: "", prescription: "", followUp: "" });

  const patient = patients.find((p) => p.id === scanned);

  const doScan = () => {
    if (!selectedId) return;
    setScanned(selectedId);
    setShowAddVisit(false);
    showToast("QR scanned — record loaded");
  };

  const addVisit = (e) => {
    e.preventDefault();
    if (!visitForm.diagnosis) return;
    const visit = {
      date: new Date().toISOString().slice(0, 10),
      hospital: "CareChain Demo Clinic",
      doctor: "Dr. (Demo Login)",
      diagnosis: visitForm.diagnosis,
      prescription: visitForm.prescription,
      followUp: visitForm.followUp,
    };
    setPatients((ps) => ps.map((p) => (p.id === patient.id ? { ...p, visits: [visit, ...p.visits] } : p)));
    showToast("Visit record saved to patient's history");
    setVisitForm({ diagnosis: "", prescription: "", followUp: "" });
    setShowAddVisit(false);
  };

  if (!patient) {
    return (
      <div className="max-w-lg mx-auto border border-white/10 rounded-2xl p-8 text-center" style={panelStyle}>
        <Search size={30} className="mx-auto text-blue-400/50 mb-3" />
        <h2 className="text-lg font-bold mb-1">Scan Patient QR</h2>
        <p className="text-sm text-blue-200/60 mb-6">Select a patient card to simulate a QR scan at your clinic device.</p>
        <select className={inputCls + " text-center"} style={inputStyle} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">— Choose a patient QR to scan —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}
        </select>
        <button onClick={doScan} disabled={!selectedId} className="mt-4 w-full bg-gradient-to-r from-blue-600 to-violet-600 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
          <QrCode size={16} /> Scan QR
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <button onClick={() => setScanned(null)} className="text-xs text-blue-300/70 hover:text-white flex items-center gap-1.5">
          <ArrowLeft size={14} /> Scan a different patient
        </button>
        <div className="border border-white/10 rounded-2xl p-6" style={panelStyle}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <div className="text-xs text-blue-300/60 font-mono mt-0.5">{patient.id}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-400">{patient.bloodGroup}</div>
              <div className="text-xs text-blue-200/50 uppercase">Blood Group</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Age / Gender" value={`${patient.age} yrs · ${patient.gender}`} />
            <InfoRow label="Language" value={patient.language} />
            <InfoRow label="Allergies" value={patient.allergies || "None known"} warn={!!patient.allergies && patient.allergies !== "None known"} />
            <InfoRow label="Chronic Conditions" value={patient.chronic || "None"} />
            <InfoRow label="Emergency Contact" value={patient.emergencyName || "—"} />
            <InfoRow label="Contact Phone" value={patient.emergencyPhone || "—"} />
          </div>
        </div>

        {!showAddVisit ? (
          <button onClick={() => setShowAddVisit(true)} className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:brightness-110 transition px-6 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
            <Plus size={16} /> Add New Visit Record
          </button>
        ) : (
          <form onSubmit={addVisit} className="border border-blue-500/30 rounded-2xl p-6" style={panelStyle}>
            <h3 className="font-bold mb-4 flex items-center gap-2"><ClipboardList size={16} className="text-blue-400" /> New Consultation</h3>
            <Field label="Diagnosis"><input required className={inputCls} style={inputStyle} value={visitForm.diagnosis} onChange={(e) => setVisitForm((f) => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Viral fever, dehydration" /></Field>
            <Field label="Prescription"><input className={inputCls} style={inputStyle} value={visitForm.prescription} onChange={(e) => setVisitForm((f) => ({ ...f, prescription: e.target.value }))} placeholder="e.g. Paracetamol 500mg, twice daily, 5 days" /></Field>
            <Field label="Next Follow-up Date"><input type="date" className={inputCls} style={inputStyle} value={visitForm.followUp} onChange={(e) => setVisitForm((f) => ({ ...f, followUp: e.target.value }))} /></Field>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:brightness-110 transition px-4 py-2.5 rounded-lg font-semibold text-sm">Save Record</button>
              <button type="button" onClick={() => setShowAddVisit(false)} className="px-4 py-2.5 rounded-lg text-sm text-blue-200/60 hover:text-white">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="border border-white/10 rounded-2xl p-6" style={panelStyle}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><CalendarClock size={16} className="text-blue-400" /> Visit History</h3>
        {patient.visits.length === 0 ? (
          <p className="text-sm text-blue-200/40">No visits recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {patient.visits.map((v, i) => (
              <div key={i} className="border-l-2 border-blue-500/40 pl-4 pb-1 relative">
                <div className="absolute top-1 w-2 h-2 rounded-full bg-blue-400" style={{ left: "-5px" }} />
                <div className="text-xs text-blue-300/60 mb-1">{v.date} · {v.hospital}</div>
                <div className="text-sm font-semibold">{v.diagnosis}</div>
                {v.prescription && (
                  <div className="text-xs text-blue-100/70 mt-1 flex items-center gap-1.5"><Pill size={12} /> {v.prescription}</div>
                )}
                {v.followUp && (
                  <div className="text-xs text-violet-300/80 mt-1 flex items-center gap-1.5"><CalendarClock size={12} /> Follow-up: {v.followUp}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, warn }) {
  return (
    <div className={`bg-white/5 rounded-lg px-3 py-2 ${warn ? "border border-amber-500/30" : ""}`}>
      <div className="text-xs uppercase text-blue-200/40 mb-0.5">{label}</div>
      <div className={`font-medium ${warn ? "text-amber-300" : "text-white"}`}>{value}</div>
    </div>
  );
}

// ---------- Emergency Tab ----------
function EmergencyTab({ patients }) {
  const [selectedId, setSelectedId] = useState("");
  const patient = patients.find((p) => p.id === selectedId);
  const hasAllergy = patient && patient.allergies && patient.allergies !== "None known";

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <AlertTriangle size={13} /> No login required — for first responders
        </div>
        <h2 className="text-xl font-bold">Emergency Mode</h2>
        <p className="text-sm text-blue-200/60 mt-1">Scan a patient's QR to instantly see life-critical info.</p>
      </div>

      <div className="border border-white/10 rounded-2xl p-6 mb-6" style={panelStyle}>
        <select className={inputCls + " text-center"} style={inputStyle} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">— Simulate scanning a patient QR —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}
        </select>
      </div>

      {patient && (
        <div className="border-2 border-red-500/30 rounded-2xl p-6" style={panelStyle}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-bold">{patient.name}</h3>
              <div className="text-xs text-blue-300/60">{patient.age} yrs · {patient.gender}</div>
            </div>
            <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
              <div className="text-2xl font-black text-red-300">{patient.bloodGroup}</div>
              <div className="text-[10px] text-red-300/70 uppercase">Blood Group</div>
            </div>
          </div>

          {hasAllergy && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-300 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase text-amber-300/80 font-semibold">Allergy Alert</div>
                <div className="text-sm text-amber-100 font-medium">{patient.allergies}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <InfoRow label="Chronic Conditions" value={patient.chronic || "None"} />
            <InfoRow label="Language" value={patient.language} />
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-blue-200/40 mb-0.5">Emergency Contact</div>
              <div className="font-semibold">{patient.emergencyName || "—"}</div>
            </div>
            {patient.emergencyPhone && (
              <a href={`tel:${patient.emergencyPhone}`} className="flex items-center gap-2 bg-emerald-600 hover:brightness-110 transition px-4 py-2 rounded-lg text-sm font-semibold">
                <Phone size={14} /> {patient.emergencyPhone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
