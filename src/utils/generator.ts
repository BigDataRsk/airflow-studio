
import { ProjectConfig, PipelineStep, Task } from '../types';

// --- Logic ---

export const generateMetaYaml = (c: ProjectConfig): string => {
  const lines: string[] = [];
  const folder_value = `${c.nomprojet}/r_${c.coderobin}_${c.nomprojet}`;
  
  lines.push(`folder: ${folder_value}`);
  lines.push(`stage: ${c.stage}`);
  lines.push(`ld_data: ${c.lddata.toUpperCase()}`);
  lines.push(`persoid: ${c.persoid}`);
  
  // Pools list
  if (c.pools && c.pools.length > 0) {
      lines.push('pools:');
      c.pools.forEach(p => lines.push(`  - ${p}`));
  }

  if (c.use_vertica && c.silot) {
    lines.push(`silot: ${c.silot}`);
  }
  if (c.use_conda && c.condaenv) {
    lines.push(`env_name: ${c.condaenv}`);
  }
  
  // Absolute Paths
  if (c.use_input && c.datalab_in) {
    const path = c.datalab_in.startsWith('/') ? c.datalab_in : `/home/jovyan/workspaces/${c.datalab_in}`;
    lines.push(`input_folder: ${path}`);
  }
  if (c.use_output && c.datalab_out) {
    const path = c.datalab_out.startsWith('/') ? c.datalab_out : `/home/jovyan/workspaces/${c.datalab_out}`;
    lines.push(`output_folder: ${path}`);
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
        if (t.imports) {
            t.imports.split('\n').forEach(imp => {
                const trimmed = imp.trim();
                if (trimmed) allImports.add(trimmed);
            });
        }
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
        // Use selected pool or fallback to first available pool or default
        const taskPool = task.selected_pool || c.pools[0] || 'default_pool';

        content += `    t_${safeName} = PythonOperator(\n`;
        content += `        task_id='${safeName}',\n`;
        content += `        python_callable=${safeName},\n`;
        content += `        priority_weight=${getPriorityWeight(task.priority)},\n`;
        content += `        pool='${taskPool}',\n`;
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
