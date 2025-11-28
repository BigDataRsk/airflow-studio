
import React, { useState } from 'react';
import { ProjectConfig, DeploymentPhase } from '../types';
import { 
  GitBranch, CheckCircle2, GitMerge, Tag, 
  Rocket, AlertTriangle, ArrowRight, Loader2, Server, ShieldCheck, Play 
} from 'lucide-react';

interface DeploymentManagerProps {
  config: ProjectConfig;
  onBack: () => void;
  mode: 'create' | 'update';
}

// Interactive Terminal Component
const InteractiveTerminal = ({ commands, onComplete }: { commands: string[], onComplete: () => void }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const runSequence = async () => {
        setIsRunning(true);
        setLines([]);
        
        for (const cmd of commands) {
            // Type command
            const cmdLine = `$ ${cmd}`;
            setLines(prev => [...prev, cmdLine]);
            
            // Random delay for "processing"
            await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
            
            // Add fake output based on command
            let output = '';
            if (cmd.includes('git push')) output = 'Enumerating objects: 15, done.\nWriting objects: 100% (15/15), 2.45 KiB | 2.45 MiB/s, done.\nTotal 15 (delta 2), reused 0 (delta 0)\nTo github.com:org/repo.git';
            else if (cmd.includes('git commit')) output = cmd.includes('fix:') ? '[fix/update 7b1c2d] fix: update dag logic\n 2 files changed, 20 insertions(+)' : '[feature/init 8a2b3c] feat: init dag\n 4 files changed, 125 insertions(+)';
            else if (cmd.includes('git tag')) output = 'Created tag v1.1.0';
            else if (cmd.includes('git checkout')) output = `Switched to branch '${cmd.split(' ').pop()}'`;
            else if (cmd.includes('git init')) output = `Initialized empty Git repository in /home/jovyan/workspaces/.git/`;
            
            if (output) {
                setLines(prev => [...prev, ...output.split('\n')]);
                await new Promise(r => setTimeout(r, 300));
            }
        }

        setIsRunning(false);
        setIsCompleted(true);
        onComplete();
    };

    return (
        <div className="bg-[#0F172A] rounded-xl border border-slate-700 overflow-hidden shadow-2xl my-4 flex flex-col h-[300px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">jovyan@workspace</div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 font-mono text-xs md:text-sm text-slate-300 overflow-y-auto custom-scrollbar flex flex-col">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.startsWith('$') ? 'text-emerald-400 font-bold mt-2' : 'text-slate-400 ml-2'}`}>
                        {line}
                    </div>
                ))}
                
                {!isRunning && !isCompleted && (
                    <div className="flex-1 flex items-center justify-center">
                         <button 
                            onClick={runSequence}
                            className="group flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-900/50"
                         >
                             <Play className="w-4 h-4 fill-white" /> Run Sequence
                         </button>
                    </div>
                )}

                {isRunning && (
                    <div className="mt-2 animate-pulse text-emerald-500">_</div>
                )}
                
                {isCompleted && (
                    <div className="mt-4 text-emerald-500 font-bold">
                        Process completed successfully.
                    </div>
                )}
            </div>
        </div>
    );
};

export const DeploymentManager: React.FC<DeploymentManagerProps> = ({ config, onBack, mode }) => {
  const [phase, setPhase] = useState<DeploymentPhase>('LOCAL_PUSH');
  const [stepComplete, setStepComplete] = useState(false);

  // Derived Values
  const branchName = mode === 'update' 
    ? `fix/${config.persoid}-${config.nomprojet}-update`
    : `feature/${config.persoid}-${config.nomprojet}-init`;
    
  const tagName = mode === 'update' ? `v1.1.0` : `v1.0.0`;
  const commitMsg = mode === 'update' 
    ? `"fix: update dag ${config.nomprojet}"` 
    : `"feat: init dag ${config.nomprojet}"`;

  const projectPath = `/home/jovyan/workspaces/${config.nomprojet}`;

  const PhaseIndicator = ({ p, active, completed, title, icon: Icon }: any) => (
    <div className={`relative z-10 flex flex-col items-center gap-2 w-1/4 ${active ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
            ${completed ? 'bg-emerald-500 border-emerald-500 text-white' : active ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 border-slate-100 text-slate-400'}
        `}>
            {completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${active ? 'text-indigo-900' : 'text-slate-400'}`}>{title}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${mode === 'update' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Rocket className="w-3 h-3" /> Deployment Cockpit {mode === 'update' && '(Update Mode)'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deploy <span className="text-indigo-600">{config.nomprojet}</span></h1>
        <p className="text-slate-500">Follow the GitOps lifecycle to {mode === 'update' ? 'update' : 'push'} your DAG to Airflow.</p>
      </div>

      {/* Timeline */}
      <div className="relative flex justify-between items-start mb-16 px-10">
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
            <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: phase === 'SUCCESS' ? '100%' : phase === 'DEPLOY_CI' ? '75%' : phase === 'TAGGING' ? '50%' : phase === 'MR_VALIDATION' ? '25%' : '0%' }} 
            />
        </div>
        <PhaseIndicator title="Push Branch" active={phase === 'LOCAL_PUSH'} completed={phase !== 'LOCAL_PUSH'} icon={GitBranch} />
        <PhaseIndicator title="Validate MR" active={phase === 'MR_VALIDATION'} completed={phase !== 'LOCAL_PUSH' && phase !== 'MR_VALIDATION'} icon={ShieldCheck} />
        <PhaseIndicator title="Tag Version" active={phase === 'TAGGING'} completed={phase === 'DEPLOY_CI' || phase === 'SUCCESS'} icon={Tag} />
        <PhaseIndicator title="Deploy" active={phase === 'DEPLOY_CI'} completed={phase === 'SUCCESS'} icon={Server} />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px] flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Left: Context & Instructions */}
        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
                {phase === 'LOCAL_PUSH' && "1. Initialize & Push"}
                {phase === 'MR_VALIDATION' && "2. CI Validation"}
                {phase === 'TAGGING' && "3. Release Versioning"}
                {phase === 'DEPLOY_CI' && "4. Deploy to Airflow"}
                {phase === 'SUCCESS' && "Deployment Complete"}
            </h2>
            
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {phase === 'LOCAL_PUSH' && `We need to create a dedicated ${mode === 'update' ? 'fix' : 'feature'} branch, commit the changes, and push them to remote.`}
                {phase === 'MR_VALIDATION' && "Your code is on the server. Now create a Merge Request (MR). The CI pipeline will run 'check_syntax' tasks. Wait for green lights."}
                {phase === 'TAGGING' && "The MR is merged. Now we must freeze this state by creating a Git Tag. This signals the CI to start the deployment process."}
                {phase === 'DEPLOY_CI' && "The Tag triggered the deployment pipeline. It will run 'add_config' and 'deploy_dag'. This usually takes 2-3 minutes."}
                {phase === 'SUCCESS' && "Congratulations! Your DAG is live on the Airflow scheduler."}
            </p>

            {phase !== 'SUCCESS' && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-2">
                        <AlertTriangle className="w-3 h-3" /> Pro Tip
                    </div>
                    <p className="text-xs text-blue-600/80">
                        {phase === 'LOCAL_PUSH' && "Ensure you have write permissions on the remote repository."}
                        {phase === 'MR_VALIDATION' && "Check the 'Pipelines' tab in your Git provider."}
                        {phase === 'TAGGING' && `Semantic versioning (${tagName}) is required for the deploy job to trigger.`}
                        {phase === 'DEPLOY_CI' && "You can monitor the 'deploy_dag' job logs for real-time status."}
                    </p>
                </div>
            )}
        </div>

        {/* Right: Actions & Terminal */}
        <div className="flex-1 p-8 flex flex-col">
            
            {phase === 'LOCAL_PUSH' && (
                <>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-slate-400">User Terminal</label>
                        <InteractiveTerminal 
                            commands={mode === 'update' ? [
                                `cd ${projectPath}`,
                                `git checkout -b ${branchName}`,
                                `git add .`,
                                `git commit -m ${commitMsg}`,
                                `git push -u origin ${branchName}`
                            ] : [
                                `cd ${projectPath}`,
                                `git init`,
                                `git remote add origin ${config.git_remote}`,
                                `git checkout -b ${branchName}`,
                                `git add .`,
                                `git commit -m ${commitMsg}`,
                                `git push -u origin ${branchName}`
                            ]}
                            onComplete={() => setStepComplete(true)}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => { setPhase('MR_VALIDATION'); setStepComplete(false); }} 
                            disabled={!stepComplete}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Push & Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}

            {phase === 'MR_VALIDATION' && (
                <>
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Waiting for Pipeline...</h3>
                            <p className="text-slate-500 text-sm mt-2">Checking syntax and dependencies.</p>
                        </div>
                        <div className="w-full max-w-md bg-slate-50 rounded-lg p-3 border border-slate-200 text-left space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-600">test_flake8</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-600">validate_meta_yaml</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                         <button onClick={() => setPhase('LOCAL_PUSH')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium text-sm">Back</button>
                        <button onClick={() => { setPhase('TAGGING'); setStepComplete(false); }} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                            MR Merged & Pipeline Green <GitMerge className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}

            {phase === 'TAGGING' && (
                <>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-slate-400">User Terminal</label>
                        <InteractiveTerminal 
                            commands={[
                                `git checkout main`,
                                `git pull origin main`,
                                `git tag -a ${tagName} -m "release: ${mode} deployment"`,
                                `git push origin ${tagName}`
                            ]}
                            onComplete={() => setStepComplete(true)} 
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setPhase('MR_VALIDATION')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium text-sm">Back</button>
                        <button 
                            onClick={() => setPhase('DEPLOY_CI')} 
                            disabled={!stepComplete}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            Tag Pushed & Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}

            {phase === 'DEPLOY_CI' && (
                <>
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                            <Server className="w-10 h-10 text-indigo-600 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Deploying to Airflow...</h3>
                            <p className="text-slate-500 text-sm mt-2">Running 'add_config' and 'deploy_dag'</p>
                        </div>
                         <div className="w-full max-w-md bg-slate-50 rounded-lg p-3 border border-slate-200 text-left space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-600">add_config</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Success</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-600">deploy_dag</span>
                                <span className="text-amber-600 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setPhase('TAGGING')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium text-sm">Back</button>
                        <button onClick={() => setPhase('SUCCESS')} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                            Confirm Deployment Success <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}

            {phase === 'SUCCESS' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                        <Rocket className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Deployed Successfully!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        The DAG <strong>dag_{config.nomprojet}</strong> is now active on the {config.stage} environment.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onBack} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
                            Return to Generator
                        </button>
                        <button onClick={() => window.open('https://airflow.apache.org', '_blank')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">
                            Open Airflow UI
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
