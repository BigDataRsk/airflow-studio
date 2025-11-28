
export interface Task {
  id: string;
  name: string;
  imports: string;
  code: string;
  priority: 'high' | 'mid' | 'low';
  pool_slots: number;
  type: 'python' | 'bash' | 'dummy';
  selected_pool?: string; // Which pool this task runs in
}

export interface PipelineStep {
  id: string;
  tasks: Task[];
}

export interface ProjectConfig {
  nomprojet: string;
  coderobin: string;
  git_remote: string;
  persoid: string;
  lddata: string;
  use_conda: boolean;
  condaenv: string;
  stage: 'LIL' | 'SXB';
  use_vertica: boolean;
  silot: string;
  
  // IO Toggles & Paths
  use_input: boolean;
  datalab_in: string;
  use_output: boolean;
  datalab_out: string;

  use_nas: boolean;
  use_gpu: boolean;
  cron: string;
  bundle_base: string;
  prepare_tests: boolean;
  pipeline: PipelineStep[];
  pools: string[]; // Multi-select
}

export const SILOTS_LIL = ['BANK', 'EIT', 'OTHER'];
export const SILOTS_SXB = ['ACM', 'OTHER', 'BANK'];

export type DeploymentPhase = 'LOCAL_PUSH' | 'MR_VALIDATION' | 'TAGGING' | 'DEPLOY_CI' | 'SUCCESS';

export type AppView = 'HOME' | 'EXPLORER' | 'GENERATOR' | 'DEPLOYMENT' | 'MODIFIER';
