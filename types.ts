
export interface Task {
  id: string;
  name: string;
  imports: string;
  code: string;
  priority: 'high' | 'mid' | 'low';
  pool_slots: number;
  type: 'python' | 'bash' | 'dummy';
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
  datalab_out: string;
  datalab_in: string;
  use_nas: boolean;
  use_gpu: boolean;
  cron: string;
  bundle_base: string;
  prepare_tests: boolean;
  pipeline: PipelineStep[];
  pool_type: string;
}

export enum SilotType {
  BANK = 'BANK',
  OTHR = 'OTHR',
  ACM = 'ACM'
}

export const ALLOWED_SILOTS = [SilotType.BANK, SilotType.OTHR, SilotType.ACM];

export type DeploymentPhase = 'LOCAL_PUSH' | 'MR_VALIDATION' | 'TAGGING' | 'DEPLOY_CI' | 'SUCCESS';

export type AppView = 'HOME' | 'EXPLORER' | 'GENERATOR' | 'DEPLOYMENT' | 'MODIFIER';
