
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  PlusCircle, 
  Search, 
  LogOut, 
  FileText, 
  FlaskConical,
  Microscope,
  Stethoscope,
  TrendingUp,
  BrainCircuit,
  Printer,
  ChevronRight
} from 'lucide-react';
import { useLabData } from './store';
import { Patient, Exam, ResultWithDetails, Gender } from './types';
import { analyzeResult } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Login Component ---
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@lab.com' && pass === 'admin123') {
      onLogin();
    } else {
      alert("Credenciales incorrectas (Use admin@lab.com / admin123)");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">LabControl Pro</h2>
          <p className="text-center text-slate-500 mb-8">Sistema de Gestión de Laboratorio</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Corporativo</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="usuario@laboratorio.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              Iniciar Sesión <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-sm text-slate-500">
          Personal autorizado únicamente.
        </div>
      </div>
    </div>
  );
};

// --- Modal Component ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App Content ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'results'>('dashboard');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResultWithDetails | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { patients, exams, addPatient, addResult, getResultsWithDetails } = useLabData();

  if (!isLoggedIn) return <LoginView onLogin={() => setIsLoggedIn(true)} />;

  const resultsWithDetails = getResultsWithDetails();
  
  const filteredPatients = patients.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Pacientes Totales', value: patients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Resultados Registrados', value: resultsWithDetails.length, icon: ClipboardList, color: 'bg-emerald-500' },
    { label: 'Ingresos Estimados', value: `$${resultsWithDetails.reduce((acc, curr) => {
        const ex = exams.find(e => e.id === curr.examen_id);
        return acc + (ex?.precio || 0);
    }, 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'Catálogo Exámenes', value: exams.length, icon: FlaskConical, color: 'bg-purple-500' },
  ];

  const handleAddPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPatient({
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      fecha_nacimiento: formData.get('fecha_nacimiento') as string,
      genero: formData.get('genero') as Gender,
      telefono: formData.get('telefono') as string,
    });
    setIsPatientModalOpen(false);
  };

  const handleAddResult = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addResult({
      paciente_id: parseInt(formData.get('paciente_id') as string),
      examen_id: parseInt(formData.get('examen_id') as string),
      valor_resultado: parseFloat(formData.get('valor_resultado') as string),
      observaciones: formData.get('observaciones') as string,
    });
    setIsResultModalOpen(false);
  };

  const openReport = async (res: ResultWithDetails) => {
    setSelectedResult(res);
    setAiInterpretation(null);
    setIsReportModalOpen(true);
    
    setIsAiLoading(true);
    const interpret = await analyzeResult(
      `${res.paciente_nombre} ${res.paciente_apellido}`,
      res.examen_nombre,
      res.valor_resultado,
      res.rango_referencia,
      res.unidad_medida,
      res.observaciones
    );
    setAiInterpretation(interpret || 'No se pudo generar interpretación.');
    setIsAiLoading(false);
  };

  const isOutOfRange = (val: number, range: string) => {
    const [min, max] = range.split('-').map(parseFloat);
    if (!isNaN(min) && !isNaN(max)) {
        return val < min || val > max;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">LabControl</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'patients' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-5 h-5" /> Pacientes
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'results' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ClipboardList className="w-5 h-5" /> Resultados
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab === 'dashboard' ? 'Panel de Control' : activeTab === 'patients' ? 'Gestión de Pacientes' : 'Registro de Resultados'}</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <Microscope className="w-4 h-4" /> Lab. Central S.A.
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${s.color} p-3 rounded-xl text-white`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                    <h4 className="text-2xl font-bold text-slate-800 mt-1">{s.value}</h4>
                  </div>
                ))}
              </div>

              {/* Chart & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Frecuencia de Exámenes por Tipo</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={exams.map(e => ({ name: e.nombre_examen, value: resultsWithDetails.filter(r => r.examen_id === e.id).length }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {exams.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Acciones Rápidas</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsPatientModalOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-all border border-slate-100 font-semibold group"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" /> Nuevo Paciente
                      </div>
                      <PlusCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => setIsResultModalOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-xl transition-all border border-slate-100 font-semibold group"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-5 h-5" /> Registrar Resultado
                      </div>
                      <PlusCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">AI Lab Assistant</span>
                    </div>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      Utilice nuestra IA para interpretar rangos complejos y generar reportes automáticamente para sus pacientes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
               <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar paciente por nombre..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setIsPatientModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Agregar Paciente
                  </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Género</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nacimiento</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-indigo-600">#{p.id.toString().padStart(3, '0')}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">{p.nombre} {p.apellido}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.genero === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {p.genero === 'M' ? 'Masculino' : 'Femenino'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.fecha_nacimiento).toLocaleDateString('es-ES')}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{p.telefono}</td>
                          <td className="px-6 py-4 text-sm">
                             <button className="text-indigo-600 hover:text-indigo-800 font-bold transition-all underline decoration-2 underline-offset-4">Ver Historial</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Historial de Laboratorio</h3>
                  <button 
                    onClick={() => setIsResultModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Registrar Examen
                  </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Examen</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Referencia</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Informe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultsWithDetails.map(r => {
                        const outRange = isOutOfRange(r.valor_resultado, r.rango_referencia);
                        return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{new Date(r.fecha_registro).toLocaleDateString('es-ES')}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-bold">{r.paciente_nombre} {r.paciente_apellido}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{r.examen_nombre}</td>
                          <td className={`px-6 py-4 text-sm font-bold ${outRange ? 'text-red-600' : 'text-slate-800'}`}>
                            {r.valor_resultado} {r.unidad_medida}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 italic">{r.rango_referencia}</td>
                          <td className="px-6 py-4 text-sm">
                            {outRange ? (
                                <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase">
                                    <TrendingUp className="w-3 h-3 rotate-45" /> Anormal
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
                                    <Stethoscope className="w-3 h-3" /> Normal
                                </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                             <button 
                                onClick={() => openReport(r)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Ver Reporte PDF/AI"
                             >
                                <FileText className="w-5 h-5" />
                             </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title="Nuevo Paciente">
        <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                    <input name="nombre" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Apellido</label>
                    <input name="apellido" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Nacimiento</label>
                <input name="fecha_nacimiento" type="date" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Género</label>
                <select name="genero" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                <input name="telefono" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="555-1234" />
            </div>
            <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">Guardar Paciente</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title="Registrar Resultado">
        <form onSubmit={handleAddResult} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Paciente</label>
                <select name="paciente_id" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {patients.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Examen</label>
                <select name="examen_id" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {exams.map(e => <option key={e.id} value={e.id}>{e.nombre_examen} ({e.unidad_medida})</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Valor Obtenido</label>
                <input name="valor_resultado" type="number" step="0.01" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Ingrese el valor numérico" />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones</label>
                <textarea name="observaciones" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={3}></textarea>
            </div>
            <div className="pt-4">
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all">Guardar Resultado</button>
            </div>
        </form>
      </Modal>

      {/* Lab Report Modal / Print View */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Informe de Laboratorio">
        {selectedResult && (
            <div className="space-y-6">
                <div id="printable-area" className="p-8 border-2 border-slate-100 rounded-xl bg-white">
                    <div className="flex justify-between items-start mb-8 border-b-4 border-indigo-600 pb-6">
                        <div>
                            <h2 className="text-3xl font-black text-indigo-700 uppercase tracking-tighter">LabControl Pro</h2>
                            <p className="text-sm font-bold text-slate-500">LABORATORIO CLÍNICO DE ALTA ESPECIALIDAD</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400">FECHA DE REPORTE</p>
                            <p className="font-bold text-slate-700">{new Date(selectedResult.fecha_registro).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-black text-indigo-600 uppercase mb-2">Datos del Paciente</h4>
                            <p className="text-xl font-bold text-slate-800">{selectedResult.paciente_nombre} {selectedResult.paciente_apellido}</p>
                            <p className="text-sm text-slate-500">ID: #{selectedResult.paciente_id.toString().padStart(4, '0')}</p>
                        </div>
                        <div className="text-right">
                             <h4 className="text-xs font-black text-indigo-600 uppercase mb-2">Examen Realizado</h4>
                             <p className="text-xl font-bold text-slate-800">{selectedResult.examen_nombre}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-500">ANALITO / PARÁMETRO</span>
                            <span className="text-sm font-bold text-slate-500">RESULTADO</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                            <span className="text-lg font-bold text-slate-700">{selectedResult.examen_nombre}</span>
                            <div className="text-right">
                                <span className={`text-3xl font-black ${isOutOfRange(selectedResult.valor_resultado, selectedResult.rango_referencia) ? 'text-red-600' : 'text-slate-900'}`}>
                                    {selectedResult.valor_resultado}
                                </span>
                                <span className="ml-2 text-slate-500 font-bold">{selectedResult.unidad_medida}</span>
                            </div>
                        </div>
                        <div className="flex justify-between mt-4">
                             <div className="text-xs font-bold text-slate-400">RANGOS DE REFERENCIA BIOLÓGICA: <span className="text-slate-600 ml-1">{selectedResult.rango_referencia} {selectedResult.unidad_medida}</span></div>
                             {isOutOfRange(selectedResult.valor_resultado, selectedResult.rango_referencia) && (
                                <span className="text-red-500 text-xs font-black uppercase">Fuerza de Rango</span>
                             )}
                        </div>
                    </div>

                    {selectedResult.observaciones && (
                        <div className="mb-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-1">Observaciones del Técnico</h4>
                            <p className="text-sm text-slate-600 italic">"{selectedResult.observaciones}"</p>
                        </div>
                    )}

                    {/* AI Interpretation Section */}
                    <div className="mt-10 border-t border-slate-200 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            <h4 className="text-sm font-black text-indigo-600 uppercase">Interpretación Médica Asistida (IA)</h4>
                        </div>
                        {isAiLoading ? (
                            <div className="flex items-center gap-3 text-slate-400 text-sm italic">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                                Generando análisis experto...
                            </div>
                        ) : (
                            <div className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                {aiInterpretation}
                            </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-4 italic">
                            * Este reporte es un análisis clínico preliminar. Los resultados deben ser interpretados por su médico tratante en conjunto con su historia clínica completa.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 no-print">
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all"
                    >
                        <Printer className="w-5 h-5" /> Imprimir Reporte
                    </button>
                    <button 
                        onClick={() => alert("Función de exportación PDF nativa activada mediante impresión del sistema.")}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        <FileText className="w-5 h-5" /> Exportar Digital
                    </button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}
