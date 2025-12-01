"""
Code Generators for meta.yaml, dag.py, and treatment.py
"""

from typing import List
from .models import ProjectConfig, PipelineStep, Task


class MetaYamlGenerator:
    """Generate meta.yaml configuration file"""
    
    def generate(self, config: ProjectConfig) -> str:
        """
        Generate meta.yaml content
        
        Args:
            config: Validated project configuration
            
        Returns:
            YAML string
        """
        lines = []
        
        # Core identifiers
        folder_value = f"{config.nomprojet}/r_{config.coderobin}_{config.nomprojet}"
        lines.append(f"folder: {folder_value}")
        lines.append(f"stage: {config.stage}")
        lines.append(f"ld_data: {config.lddata.upper()}")
        lines.append(f"persoid: {config.persoid}")
        
        # Pools
        if config.pools:
            lines.append("pools:")
            for pool in config.pools:
                lines.append(f"  - {pool}")
        
        # Database
        if config.use_vertica and config.silot:
            lines.append(f"silot: {config.silot}")
        
        # Conda environment
        if config.use_conda and config.condaenv:
            lines.append(f"env_name: {config.condaenv}")
        
        # I/O Paths (absolute)
        if config.use_input and config.datalab_in:
            path = config.datalab_in if config.datalab_in.startswith('/') else f"/home/jovyan/workspaces/{config.datalab_in}"
            lines.append(f"input_folder: {path}")
        
        if config.use_output and config.datalab_out:
            path = config.datalab_out if config.datalab_out.startswith('/') else f"/home/jovyan/workspaces/{config.datalab_out}"
            lines.append(f"output_folder: {path}")
        
        # Infrastructure flags
        if config.use_nas:
            lines.append("NAS: true")
        
        if config.use_gpu:
            lines.append("GPU: true")
        
        return "\n".join(lines) + "\n"


class TreatmentGenerator:
    """Generate treatment.py with task functions"""
    
    def generate(self, pipeline: List[PipelineStep]) -> str:
        """
        Generate treatment.py content
        
        Args:
            pipeline: List of pipeline steps with tasks
            
        Returns:
            Python code string
        """
        # Collect unique imports
        all_imports = set()
        for step in pipeline:
            for task in step.tasks:
                if task.imports:
                    for imp in task.imports.split('\n'):
                        imp = imp.strip()
                        if imp:
                            all_imports.add(imp)
        
        # Start with imports
        content = ""
        if all_imports:
            content += "\n".join(sorted(all_imports)) + "\n\n"
        
        # Generate function definitions
        for step in pipeline:
            for task in step.tasks:
                func_name = self._sanitize_name(task.name)
                content += f"def {func_name}(**context):\n"
                content += '    """\n'
                content += f"    Task: {task.name}\n"
                content += f"    Priority: {task.priority}\n"
                content += f"    Pool Slots: {task.pool_slots}\n"
                content += '    """\n'
                
                # Indent code
                if task.code.strip():
                    for line in task.code.split('\n'):
                        content += f"    {line}\n" if line else "\n"
                else:
                    content += "    pass\n"
                
                content += "\n\n"
        
        return content
    
    @staticmethod
    def _sanitize_name(name: str) -> str:
        """Convert task name to valid Python identifier"""
        import re
        return re.sub(r'[^a-zA-Z0-9_]', '_', name)


class DagGenerator:
    """Generate Airflow DAG file"""
    
    def generate(self, config: ProjectConfig) -> str:
        """
        Generate dag.py content
        
        Args:
            config: Project configuration
            
        Returns:
            Python DAG code
        """
        # Collect all task function names
        all_task_names = []
        for step in config.pipeline:
            for task in step.tasks:
                all_task_names.append(self._sanitize_name(task.name))
        
        task_imports = f"from src.treatment import {', '.join(all_task_names)}" if all_task_names else ""
        
        # Header
        content = f"""from airflow import DAG
from airflow.operators.dummy import DummyOperator
from airflow.operators.python import PythonOperator
from datetime import datetime
{task_imports}

# --- Configuration ---
custom_env_name = "{config.condaenv if config.use_conda else 'airflow-env'}"
schedule_interval = {f'"{config.cron}"' if config.cron else 'None'}

default_args = {{
    'owner': '{config.persoid}',
    'start_date': datetime(2023, 1, 1),
}}

with DAG('dag_{config.nomprojet.replace('-', '_')}',
         default_args=default_args,
         schedule_interval=schedule_interval,
         catchup=False) as dag:

    start = DummyOperator(task_id='start')
    end = DummyOperator(task_id='end')

"""
        
        # Define tasks
        for step in config.pipeline:
            for task in step.tasks:
                safe_name = self._sanitize_name(task.name)
                task_pool = task.selected_pool or (config.pools[0] if config.pools else 'default_pool')
                
                content += f"    t_{safe_name} = PythonOperator(\n"
                content += f"        task_id='{safe_name}',\n"
                content += f"        python_callable={safe_name},\n"
                content += f"        priority_weight={self._get_priority_weight(task.priority)},\n"
                content += f"        pool='{task_pool}',\n"
                content += f"        pool_slots={task.pool_slots},\n"
                content += f"        dag=dag\n"
                content += f"    )\n\n"
        
        # Define dependencies
        content += "    # Pipeline Flow\n"
        
        if not config.pipeline:
            content += "    start >> end\n"
        else:
            previous_node = "start"
            
            for step in config.pipeline:
                current_nodes = [f"t_{self._sanitize_name(t.name)}" for t in step.tasks]
                
                if len(current_nodes) == 1:
                    content += f"    {previous_node} >> {current_nodes[0]}\n"
                    previous_node = current_nodes[0]
                else:
                    # Parallel tasks
                    content += f"    {previous_node} >> [{', '.join(current_nodes)}]\n"
                    previous_node = f"[{', '.join(current_nodes)}]"
            
            content += f"    {previous_node} >> end\n"
        
        return content
    
    @staticmethod
    def _sanitize_name(name: str) -> str:
        """Convert task name to valid Python identifier"""
        import re
        return re.sub(r'[^a-zA-Z0-9_]', '_', name)
    
    @staticmethod
    def _get_priority_weight(priority: str) -> int:
        """Map priority level to numeric weight"""
        return {'high': 3, 'mid': 2, 'low': 1}.get(priority, 1)
