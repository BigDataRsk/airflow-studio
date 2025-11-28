
import { ProjectConfig, PipelineStep, Task } from '../types';
import JSZip from 'jszip';
import saveAs from 'file-saver';

// --- Templates ---

const GITIGNORE_TEMPLATE = `
.DS_Store
__pycache__/
*.pyc
.env
.ipynb_checkpoints/
`;

const PIPELINE_TEMPLATE = `
stages:
  - build
  - deploy

build:
  stage: build
  script: echo "Building..."

deploy:
  stage: deploy
  component: [PLACEHOLDER]
  script: echo "Deploying..."
`;

// --- Logic ---

export const generateMetaYaml = (c: ProjectConfig): string => {
  const lines: string[] = [];
  const folder_value = `${c.nomprojet}/r_${c.coderobin}_${c.nomprojet}`;
  
  lines.push(`folder: ${folder_value}`);
  lines.push(`stage: ${c.stage}`);
  lines.push(`ld_data: ${c.lddata.toUpperCase()}`);
  lines.push(`persoid: ${c.persoid}`);
  
  if (c.git_remote) {
      lines.push(`git_remote: ${c.git_remote}`);
  }

  if (c.use_vertica && c.silot) {
    lines.push(`silot: ${c.silot}`);
  }
  if (c.use_conda && c.condaenv) {
    lines.push(`env_name: ${c.condaenv}`);
  }
  if (c.datalab_in) {
    lines.push(`input_folder: ${c.datalab_in}`);
  }
  if (c.datalab_out) {
    lines.push(`output_folder: ${c.datalab_out}`);
  }
  if (c.use_nas) {
    lines.push("NAS: true");
  }
  if (c.use_gpu) {
    lines.push("GPU: true");
  }
  
  return lines.join("\n") + "\n";
};

export const generateTreatmentFile = (pipeline: PipelineStep[]): string => {
  // Aggregate unique imports
  const allImports = new Set<string>();
  pipeline.forEach(step => {
    step.tasks.forEach(t => {
        t.imports.split('\n').forEach(imp => {
            const trimmed = imp.trim();
            if (trimmed) allImports.add(trimmed);
        });
    });
  });

  let content = "";
  if (allImports.size > 0) {
    content += Array.from(allImports).join('\n') + "\n\n";
  }

  // Add functions
  pipeline.forEach(step => {
    step.tasks.forEach(task => {
        const funcName = task.name.replace(/[^a-zA-Z0-9_]/g, '_');
        content += `def ${funcName}(**context):\n`;
        const indentedCode = task.code
          .split('\n')
          .map(line => line ? `    ${line}` : '')
          .join('\n');
        content += indentedCode || "    pass";
        content += "\n\n";
    });
  });

  return content;
};

const getPriorityWeight = (p: string) => {
  switch(p) {
    case 'high': return 3;
    case 'mid': return 2;
    case 'low': return 1;
    default: return 1;
  }
};

export const generateDagFile = (c: ProjectConfig): string => {
  // Collect all task names for import
  const allTaskNames: string[] = [];
  c.pipeline.forEach(step => {
      step.tasks.forEach(t => {
          allTaskNames.push(t.name.replace(/[^a-zA-Z0-9_]/g, '_'));
      });
  });

  const taskImports = allTaskNames.length > 0 
    ? `from src.treatment import ${allTaskNames.join(', ')}`
    : '';

  let content = `from airflow import DAG
from airflow.operators.dummy import DummyOperator
from airflow.operators.python import PythonOperator
from datetime import datetime
${taskImports}

# --- Configuration ---
custom_env_name = "airflow-env"
schedule_interval = None

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2023, 1, 1),
}

with DAG('dag_${c.nomprojet.replace(/-/g, '_')}',
         default_args=default_args,
         schedule_interval=schedule_interval,
         catchup=False) as dag:

    start = DummyOperator(task_id='start')
    end = DummyOperator(task_id='end')

`;

  // Define Tasks
  c.pipeline.forEach(step => {
    step.tasks.forEach(task => {
        const safeName = task.name.replace(/[^a-zA-Z0-9_]/g, '_');
        content += `    t_${safeName} = PythonOperator(\n`;
        content += `        task_id='${safeName}',\n`;
        content += `        python_callable=${safeName},\n`;
        content += `        priority_weight=${getPriorityWeight(task.priority)},\n`;
        content += `        pool='${c.pool_type || 'default_pool'}',\n`;
        content += `        pool_slots=${task.pool_slots},\n`;
        content += `        dag=dag\n`;
        content += `    )\n\n`;
    });
  });

  // Define Dependency Flow (Parallel support)
  content += `    # Pipeline Flow\n`;
  
  if (c.pipeline.length === 0) {
    content += `    start >> end\n`;
  } else {
    // Helper to get variable names for a step
    const getStepVars = (step: PipelineStep) => {
        if (step.tasks.length === 0) return null;
        if (step.tasks.length === 1) return `t_${step.tasks[0].name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        // List syntax for parallel: [t_1, t_2]
        return `[${step.tasks.map(t => 't_' + t.name.replace(/[^a-zA-Z0-9_]/g, '_')).join(', ')}]`;
    };

    let previousNode = 'start';
    
    c.pipeline.forEach(step => {
        const currentNode = getStepVars(step);
        if (currentNode) {
            content += `    ${previousNode} >> ${currentNode}\n`;
            previousNode = currentNode;
        }
    });

    content += `    ${previousNode} >> end\n`;
  }

  // Replacements
  if (c.use_conda && c.condaenv) {
    content = content.replace(
      /custom_env_name\s*=\s*["'].*?["']/, 
      `custom_env_name = "${c.condaenv}"`
    );
  }

  const cronVal = c.cron ? `"${c.cron}"` : "None";
  content = content.replace(
    /schedule_interval\s*=\s*[^,\n)]+/,
    `schedule_interval = ${cronVal}`
  );

  return content;
};

export const downloadProjectZip = async (c: ProjectConfig) => {
  const zip = new JSZip();
  const root = zip.folder(c.nomprojet);
  
  if (!root) return;

  const rDirName = `r_${c.coderobin}_${c.nomprojet}`;
  const rDir = root.folder(rDirName);

  // 1. Root files
  root.file(".gitignore", GITIGNORE_TEMPLATE);
  
  if (c.use_conda) {
    root.file("airflow-python-311.txt", "# Conda requirements\npandas\nnumpy\n");
  } else if (c.bundle_base) {
    root.file("BUNDLE_AIRFLOW.txt", c.bundle_base + "\n");
  }

  if (c.prepare_tests) {
    root.file("airflow.cfg", "load_examples = False\n");
  }

  // 2. CICD
  const cicd = root.folder(".cicd");
  if (cicd) {
    const pipelineContent = PIPELINE_TEMPLATE.replace("component: [PLACEHOLDER]", `component: ${c.nomprojet}`);
    cicd.file("pipeline.cicd.yaml", pipelineContent);
  }

  // 3. Source & Dag
  if (rDir) {
    const src = rDir.folder("src");
    if (src) {
        src.file("__init__.py", ""); 
        src.file("treatment.py", generateTreatmentFile(c.pipeline));
    }
    
    rDir.file("dag.py", generateDagFile(c));
    
    const recipe = rDir.folder("recipe");
    if (recipe) {
      recipe.file("meta.yaml", generateMetaYaml(c));
    }
  }

  // Generate Zip
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${c.nomprojet}.zip`);
};
