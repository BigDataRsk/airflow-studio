
import React, { useState } from 'react';
import { ProjectConfig, ALLOWED_SILOTS, PipelineStep, Task, AppView } from './types';
import { generateMetaYaml, generateDagFile, generateTreatmentFile } from './utils/generator';
import { InputField } from './components/InputField';
import { EnvironmentBuilder } from './components/EnvironmentBuilder';
import { TaskBuilder } from './components/TaskBuilder';
import { PoolSelector } from './components/PoolSelector';
import { IOBuilder } from './components/IOBuilder';
import { GraphPreview } from './components/GraphPreview';
import { FileExplorer } from './components/FileExplorer';
import { Accordion } from './components/Accordion';
import { TaskEditorPopover } from './components/TaskEditorPopover';
import { DeploymentManager } from './components/DeploymentManager';
import { 
  FolderGit2, User, Workflow, Sparkles, PlusCircle, ArrowLeft, Layers, Server, Layout, X, GitBranch, ArrowRight, Check, Command, Database, Rocket, Terminal, Loader2, Edit, FileCode, BookOpen
} from 'lucide-react';

type SectionId = 'identity' | 'pool' | 'io' | 'pipeline' | 'env';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('HOME');
  
  // File Picker State
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'input' | 'output' | 'project_selection' | 'dag_modification'>('input');
  const [validatingProject, setValidatingProject] = useState(false);

  // Guided Flow State
  const [openSection, setOpenSection] = useState<SectionId | null>('identity');
  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(new Set());

  // Task Editing State (Global Popover)
  const [editingTaskState, setEditingTaskState] = useState<{
      stepIdx: number; 
      taskIdx: number;
      anchorRect: DOMRect;
  } | null>(null);

  // Config State
  const [config, setConfig] = useState<ProjectConfig>({
    nomprojet: 'my-new-project',
    coderobin: 'robi',
    git_remote: 'git@github.com:org/repo.git',
    persoid: 'jovyan',
    lddata: 'eidp_p630',
    use_conda: false,
    condaenv: 'airflow-ml-3.11',
    stage: 'LIL',
    use_vertica: true,
    silot: ALLOWED_SILOTS[0],
    datalab_out: '',
    datalab_in: '',
    use_nas: false,
    use_gpu: false,
    cron: '',
    bundle_base: '',
    prepare_tests: false,
    pipeline: [
        { id: 's1', tasks: [{ id: 't1', name: 'extract_data', imports: 'import pandas as pd', code: '# extraction logic', priority: 'low', pool_slots: 1, type: 'python' }] }
    ],
    pool_type: 'eidp_p630_std_pool'
  });

  const [activeTab, setActiveTab] = useState<'meta' | 'dag' | 'treatment' | 'graph'>('graph');

  const handleChange = (key: keyof ProjectConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const openFilePicker = (mode: 'input' | 'output') => {
      setPickerMode(mode);
      setShowFilePicker(true);
  };

  const handleOpenDeployment = () => {
      setPickerMode('project_selection');
      setShowFilePicker(true);
  };

  const handleOpenModifier = () => {
      setPickerMode('dag_modification');
      setShowFilePicker(true);
  };

  const handleFileSelection = (path: string) => {
      if (pickerMode === 'input') {
          handleChange('datalab_in', path);
          setShowFilePicker(false);
      } else if (pickerMode === 'output') {
          handleChange('datalab_out', path);
          setShowFilePicker(false);
      } else if (pickerMode === 'project_selection') {
          // Simulate .git/config validation
          setValidatingProject(true);
          setTimeout(() => {
              setValidatingProject(false);
              const isValid = true; 
              if (isValid) {
                  handleChange('nomprojet', path);
                  setShowFilePicker(false);
                  setCurrentView('DEPLOYMENT');
              } else {
                  alert('Invalid Project: .git/config not found in this directory.');
              }
          }, 1500);
      } else if (pickerMode === 'dag_modification') {
          // Simulate structure validation (dag.py, treatment.py)
          setValidatingProject(true);
          setTimeout(() => {
              setValidatingProject(false);
              const isValid = true;
              if (isValid) {
                  // MOCK LOAD EXISTING DATA
                  setConfig(prev => ({
                      ...prev,
                      nomprojet: path,
                      coderobin: path.substring(0, 4).toLowerCase(),
                      pipeline: [
                          { id: 's1', tasks: [
                              { id: 't1', name: 'extract_clients', imports: 'import pandas as pd', code: '# extraction code', priority: 'high', pool_slots: 2, type: 'python' },
                              { id: 't2', name: 'extract_orders', imports: 'import pandas as pd', code: '# extraction code', priority: 'mid', pool_slots: 2, type: 'python' }
                          ]},
                          { id: 's2', tasks: [
                              { id: 't3', name: 'join_data', imports: 'import pandas as pd', code: '# transformation code', priority: 'high', pool_slots: 4, type: 'python' }
                          ]},
                          { id: 's3', tasks: [
                              { id: 't4', name: 'push_vertica', imports: 'import verticapy as vp', code: '# loading code', priority: 'low', pool_slots: 1, type: 'python' }
                          ]}
                      ]
                  }));
                  
                  setShowFilePicker(false);
                  setCurrentView('MODIFIER');
                  setOpenSection('pipeline'); // Open logic pipeline by default
              } else {
                  alert('Invalid DAG Project: Missing dag.py or src/treatment.py');
              }
          }, 1500);
      }
  };

  const handleSectionComplete = (id: SectionId, nextId: SectionId | null) => {
    setCompletedSections(prev => new Set(prev).add(id));
    setOpenSection(nextId);
  };

  const toggleSection = (id: SectionId) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (!editingTaskState) return;
    const { stepIdx, taskIdx } = editingTaskState;
    const newPipeline = [...config.pipeline];
    newPipeline[stepIdx].tasks[taskIdx] = updatedTask;
    handleChange('pipeline', newPipeline);
  };

  const currentEditingTask = editingTaskState 
    ? config.pipeline[editingTaskState.stepIdx]?.tasks[editingTaskState.taskIdx] 
    : null;

  const CodeBlock = ({ content }: { content: string }) => (
    <div className="font-mono text-[11px] leading-relaxed text-slate-600 p-6 bg-slate-50/30">
        {content.split('\n').map((line, i) => (
            <div key={i} className="flex hover:bg-indigo-50/50 transition-colors">
                <span className="w-8 text-right mr-4 text-slate-300 select-none border-r border-slate-100 pr-3">{i+1}</span>
                <span className="whitespace-pre-wrap break-all">{line}</span>
            </div>
        ))}
    </div>
  );

  const isModifier = currentView === 'MODIFIER';
  const themeColor = isModifier ? 'amber' : 'indigo';
  const ThemeIcon = isModifier ? Edit : PlusCircle;

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white ${currentView === 'HOME' ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'}`}>
        
        {/* --- GLOBAL MODALS --- */}
        {showFilePicker && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-8 animate-in fade-in duration-200">
                <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl relative">
                    {validatingProject && (
                        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur flex flex-col items-center justify-center text-slate-800">
                            <Loader2 className={`w-10 h-10 animate-spin mb-4 ${pickerMode === 'dag_modification' ? 'text-amber-600' : 'text-indigo-600'}`} />
                            <h3 className="text-lg font-bold">
                                {pickerMode === 'dag_modification' ? 'Parsing Project Structure...' : 'Validating Git Configuration...'}
                            </h3>
                            <p className="text-slate-500 text-sm">Checking workspace compatibility</p>
                        </div>
                    )}
                    <button onClick={() => setShowFilePicker(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-slate-100 z-50">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                    <FileExplorer 
                        onSelect={handleFileSelection} 
                        onBack={() => setShowFilePicker(false)} 
                    />
                </div>
            </div>
        )}

        <TaskEditorPopover 
            isOpen={!!editingTaskState}
            task={currentEditingTask}
            anchorRect={editingTaskState?.anchorRect || null}
            onClose={() => setEditingTaskState(null)}
            onSave={handleSaveTask}
        />

        {/* --- VIEW 1: HOME PAGE --- */}
        {currentView === 'HOME' && (
            <div className="relative min-h-screen flex flex-col p-8 overflow-y-auto z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
                <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                {/* Header */}
                <div className="relative z-10 flex flex-col items-center mb-16 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-xs font-medium mb-6 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Next-Gen Workflow Builder</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform -rotate-6">
                            <Command className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
                            Airflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Studio</span>
                        </h1>
                    </div>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-center">
                        Design, configure, and deploy production-ready DAGs in seconds.
                    </p>
                </div>

                {/* Sections Container */}
                <div className="relative z-10 max-w-6xl mx-auto w-full space-y-16 pb-20">
                    
                    {/* SECTION 1: OPERATION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <Layout className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Operation</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CARD: NEW PROJECT */}
                            <button 
                                onClick={() => setCurrentView('GENERATOR')} 
                                className="group relative flex flex-col items-start text-left p-8 rounded-[24px] bg-[#1e293b]/80 border border-slate-700/50 hover:bg-[#1e293b] hover:border-indigo-500/50 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.01] hover:shadow-indigo-500/10 cursor-pointer h-full"
                            >
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">New Project</h2>
                                <p className="text-slate-400 text-sm">Scaffold a new DAG from scratch with strict conventions and best practices.</p>
                            </button>

                            {/* CARD: DAG MODIFIER */}
                            <button 
                                onClick={handleOpenModifier} 
                                className="group relative flex flex-col items-start text-left p-8 rounded-[24px] bg-[#1e293b]/80 border border-slate-700/50 hover:bg-[#1e293b] hover:border-amber-500/50 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.01] hover:shadow-amber-500/10 cursor-pointer h-full"
                            >
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Edit className="w-6 h-6 text-amber-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">DAG Modifier</h2>
                                <p className="text-slate-400 text-sm">Import existing projects, visualize pipelines, and deploy updates safely.</p>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 2: DEPLOYMENT */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <Rocket className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Deployment</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {/* CARD: DEPLOYMENT COCKPIT */}
                            <button 
                                onClick={handleOpenDeployment} 
                                className="group relative flex items-center text-left p-8 rounded-[24px] bg-[#1e293b]/80 border border-slate-700/50 hover:bg-[#1e293b] hover:border-emerald-500/50 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.005] hover:shadow-emerald-500/10 cursor-pointer w-full"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mr-6 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
                                    <Terminal className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Deployment Cockpit</h2>
                                    <p className="text-slate-400 text-sm">GitOps assistant for release management. Push branches, run pipelines, and release tags.</p>
                                </div>
                                <ArrowRight className="ml-auto w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* SECTION 3: PRODUCT & DOCUMENTATION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <BookOpen className="w-5 h-5 text-sky-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Product & Documentation</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CARD: OPEN AIRFLOW */}
                            <button 
                                onClick={() => window.open('https://airflow.apache.org', '_blank')} 
                                className="group relative flex items-center p-6 rounded-[24px] bg-[#1e293b]/80 border border-slate-700/50 hover:bg-[#1e293b] hover:border-sky-500/50 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.01] hover:shadow-sky-500/10 cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center mr-4 border border-sky-500/20 group-hover:scale-110 transition-transform shrink-0">
                                    <Workflow className="w-5 h-5 text-sky-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Open Airflow</h2>
                                    <p className="text-slate-400 text-xs mt-1">Monitor jobs & logs</p>
                                </div>
                            </button>

                            {/* CARD: DOCUMENTATION */}
                            <button 
                                onClick={() => window.open('https://airflow.apache.org/docs/', '_blank')} 
                                className="group relative flex items-center p-6 rounded-[24px] bg-[#1e293b]/80 border border-slate-700/50 hover:bg-[#1e293b] hover:border-slate-500/50 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.01] hover:shadow-white/5 cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center mr-4 border border-slate-500/20 group-hover:scale-110 transition-transform shrink-0">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Documentation</h2>
                                    <p className="text-slate-400 text-xs mt-1">Guides & References</p>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* --- VIEW 2 & 3: GENERATOR / MODIFIER --- */}
        {(currentView === 'GENERATOR' || currentView === 'MODIFIER') && (
            <div className="flex flex-col min-h-screen bg-[#F1F5F9]">
                <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 h-16">
                    <div className="max-w-[1800px] mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentView('HOME')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 text-white rounded-lg flex items-center justify-center shadow-md ${isModifier ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' : 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-500/20'}`}>
                                    <ThemeIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-slate-900 text-sm tracking-tight">{config.nomprojet || 'Untitled Project'}</h1>
                                    <span className={`text-[10px] font-medium uppercase tracking-wider block -mt-0.5 ${isModifier ? 'text-amber-600' : 'text-slate-500'}`}>
                                        {isModifier ? 'DAG Modifier' : 'Project Generator'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 pt-24 pb-8 px-6 max-w-[1800px] mx-auto w-full flex gap-8">
                    {/* Left Column (Guided Form) */}
                    <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col gap-6 pb-20">
                        
                        {/* 1. Identity */}
                        <Accordion 
                            title="Project Identity" 
                            icon={<Layout className="w-5 h-5"/>} 
                            isOpen={openSection === 'identity'}
                            onToggle={() => toggleSection('identity')}
                            isCompleted={completedSections.has('identity')}
                            summary={<span className="text-slate-500">{config.nomprojet} • {config.persoid}</span>}
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Project Name" icon={<FolderGit2 className="w-4 h-4"/>} value={config.nomprojet} onChange={(v) => handleChange('nomprojet', v)} required disabled={isModifier} />
                                    <InputField label="Robin Code" icon={<User className="w-4 h-4"/>} value={config.coderobin} onChange={(v) => handleChange('coderobin', v.toLowerCase().slice(0,4))} required disabled={isModifier} />
                                    <InputField label="Owner ID" icon={<User className="w-4 h-4"/>} value={config.persoid} onChange={(v) => handleChange('persoid', v)} required />
                                    <InputField label="Git Remote" icon={<GitBranch className="w-4 h-4"/>} value={config.git_remote} onChange={(v) => handleChange('git_remote', v)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">LD Data Workspace</label>
                                    <div className="relative flex items-center w-full p-1 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                                        <div className="flex items-center justify-center w-10 h-10 ml-1 rounded-lg bg-indigo-50 text-indigo-600">
                                            <Layout className="w-4 h-4" />
                                        </div>
                                        <select 
                                            value={config.lddata}
                                            onChange={(e) => handleChange('lddata', e.target.value)}
                                            className="flex-1 px-3 py-1 bg-transparent text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="eidp_p630">eidp_p630</option>
                                            <option value="eidp_p445">eidp_p445</option>
                                            <option value="marketing_prod">marketing_prod</option>
                                            <option value="risk_scoring">risk_scoring</option>
                                            <option value="finance_ledger">finance_ledger</option>
                                        </select>
                                        <div className="pr-3 pointer-events-none text-slate-400">
                                            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={() => handleSectionComplete('identity', 'pool')} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Accordion>

                        {/* 2. Pool */}
                        <Accordion 
                            title="Compute Pool" 
                            icon={<Layers className="w-5 h-5"/>} 
                            isOpen={openSection === 'pool'}
                            onToggle={() => toggleSection('pool')}
                            isCompleted={completedSections.has('pool')}
                            summary={<span className="text-slate-500">{config.pool_type}</span>}
                        >
                             <div className="space-y-6">
                                 <PoolSelector value={config.pool_type} onChange={(v) => handleChange('pool_type', v)} lddata={config.lddata} />
                                 <div className="flex justify-end">
                                    <button onClick={() => handleSectionComplete('pool', 'pipeline')} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                        </Accordion>

                        {/* 3. Pipeline */}
                        <Accordion 
                            title="Logic Pipeline" 
                            icon={<Workflow className="w-5 h-5"/>} 
                            isOpen={openSection === 'pipeline'}
                            onToggle={() => toggleSection('pipeline')}
                            isCompleted={completedSections.has('pipeline')}
                            summary={<span className="text-slate-500">{config.pipeline.length} Stages • {config.pipeline.reduce((acc,s) => acc + s.tasks.length, 0)} Tasks</span>}
                        >
                            <TaskBuilder 
                                pipeline={config.pipeline} 
                                onChange={(p) => handleChange('pipeline', p)} 
                                onEditTask={(s, t, rect) => setEditingTaskState({ stepIdx: s, taskIdx: t, anchorRect: rect })}
                                onContinue={() => handleSectionComplete('pipeline', 'env')}
                            />
                        </Accordion>

                        {/* 4. Environment */}
                        <Accordion 
                            title="Environment & Automation" 
                            icon={<Server className="w-5 h-5"/>} 
                            isOpen={openSection === 'env'}
                            onToggle={() => toggleSection('env')}
                            isCompleted={completedSections.has('env')}
                            summary={<span className="text-slate-500">{config.stage} • {config.cron || 'Manual'}</span>}
                        >
                            <EnvironmentBuilder 
                                config={config} 
                                onChange={handleChange} 
                                onContinue={() => handleSectionComplete('env', 'io')}
                            />
                        </Accordion>

                        {/* 5. DB Connection / Volume I/O */}
                        <Accordion
                            title="DB Connection / Volume Input Output"
                            icon={<Database className="w-5 h-5"/>}
                            isOpen={openSection === 'io'}
                            onToggle={() => toggleSection('io')}
                            isCompleted={completedSections.has('io')}
                            summary={<span className="text-slate-500">{config.use_vertica ? `Vertica (${config.silot})` : 'No DB'} • {config.datalab_in ? 'In Set' : 'No In'}</span>}
                        >
                            <IOBuilder 
                                config={config}
                                onChange={handleChange}
                                onOpenFilePicker={openFilePicker}
                                onContinue={() => { setCompletedSections(prev => new Set(prev).add('io')); setOpenSection(null); }}
                            />
                        </Accordion>
                        
                        {/* FOOTER: READY TO BUILD */}
                        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                             <div className="bg-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                 <div>
                                     <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                         <Rocket className={`w-5 h-5 ${isModifier ? 'text-amber-400' : 'text-indigo-400'}`} />
                                         {isModifier ? 'Modifications Ready' : 'Ready to Build'}
                                     </h3>
                                     <p className="text-slate-400 text-sm mt-1">{isModifier ? 'Review changes and deploy updates.' : 'Review configuration and proceed to deployment.'}</p>
                                 </div>
                                 <button
                                     onClick={() => setCurrentView('DEPLOYMENT')}
                                     className={`group relative flex items-center gap-3 px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                                         isModifier 
                                         ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' 
                                         : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                     }`}
                                 >
                                     <Rocket className="w-5 h-5" />
                                     <span>{isModifier ? 'Save Changes & Deploy' : 'Proceed to Deployment'}</span>
                                 </button>
                             </div>
                        </div>

                    </div>

                    {/* Right Column (Sticky Preview) */}
                    <div className="hidden lg:block lg:w-1/2 xl:w-5/12 relative">
                         <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-500/5 border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 backdrop-blur">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                                    </div>
                                    <div className="flex p-1 bg-slate-100 rounded-lg">
                                        {['graph', 'dag', 'treatment', 'meta'].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => setActiveTab(t as any)} 
                                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                                    {activeTab === 'graph' && <GraphPreview pipeline={config.pipeline} />}
                                    {activeTab === 'dag' && <div className="h-full overflow-auto custom-scrollbar"><CodeBlock content={generateDagFile(config)} /></div>}
                                    {activeTab === 'treatment' && <div className="h-full overflow-auto custom-scrollbar"><CodeBlock content={generateTreatmentFile(config.pipeline)} /></div>}
                                    {activeTab === 'meta' && <div className="h-full overflow-auto custom-scrollbar"><CodeBlock content={generateMetaYaml(config)} /></div>}
                                </div>
                            </div>
                         </div>
                    </div>
                </main>
            </div>
        )}

        {/* --- VIEW 4: DEPLOYMENT --- */}
        {currentView === 'DEPLOYMENT' && (
            <div className="min-h-screen bg-slate-50 pt-24 px-6">
                <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 h-16">
                    <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentView('HOME')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="font-bold text-slate-900 text-sm">Deployment Cockpit</h1>
                         </div>
                    </div>
                </header>
                <DeploymentManager 
                    config={config} 
                    onBack={() => setCurrentView('HOME')} 
                    mode={pickerMode === 'dag_modification' ? 'update' : 'create'}
                />
            </div>
        )}
    </div>
  );
};

export default App;
