"""
Project Manager - High-level orchestration for project creation and loading
"""

import json
import yaml
from pathlib import Path
from typing import Dict, Any

from .models import ProjectConfig
from .generator import MetaYamlGenerator, DagGenerator, TreatmentGenerator


class ProjectManager:
    """Manages project lifecycle: create, load, save"""
    
    def __init__(self, base_path: Path = None):
        """
        Args:
            base_path: Base directory for projects (defaults to ~/workspaces)
        """
        self.base_path = base_path or Path.home() / "workspaces"
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def get_project_path(self, project_name: str) -> Path:
        """Get absolute path to project directory"""
        return self.base_path / project_name
    
    def load_project(self, project_name: str) -> Dict[str, Any]:
        """
        Load existing project configuration from meta.yaml
        
        Args:
            project_name: Name of the project folder
            
        Returns:
            ProjectConfig as dictionary
            
        Raises:
            FileNotFoundError: If project doesn't exist
        """
        project_path = self.get_project_path(project_name)
        meta_file = project_path / "meta.yaml"
        
        if not meta_file.exists():
            raise FileNotFoundError(f"Project '{project_name}' not found at {project_path}")
        
        with open(meta_file, 'r') as f:
            meta_data = yaml.safe_load(f)
        
        # Reconstruct ProjectConfig from meta.yaml
        # This is a simplified loader; in production, you'd parse the DAG file too
        config = {
            "nomprojet": project_name,
            "coderobin": meta_data.get("folder", "").split("_")[1][:4] if "_" in meta_data.get("folder", "") else "unkn",
            "git_remote": "",  # Not stored in meta.yaml
            "persoid": meta_data.get("persoid", "jovyan"),
            "lddata": meta_data.get("ld_data", "").lower(),
            "use_conda": "env_name" in meta_data,
            "condaenv": meta_data.get("env_name", "airflow-ml-3.11"),
            "stage": meta_data.get("stage", "LIL"),
            "use_vertica": "silot" in meta_data,
            "silot": meta_data.get("silot", "BANK"),
            "use_input": "input_folder" in meta_data,
            "datalab_in": meta_data.get("input_folder", ""),
            "use_output": "output_folder" in meta_data,
            "datalab_out": meta_data.get("output_folder", ""),
            "use_nas": meta_data.get("NAS", False),
            "use_gpu": meta_data.get("GPU", False),
            "cron": "",  # Would need to parse from dag.py
            "bundle_base": "",
            "prepare_tests": False,
            "pipeline": [
                {
                    "id": "s1",
                    "tasks": [
                        {
                            "id": "t1",
                            "name": "extract_data",
                            "imports": "",
                            "code": "# Loaded from treatment.py",
                            "priority": "low",
                            "pool_slots": 1,
                            "type": "python"
                        }
                    ]
                }
            ],
            "pools": meta_data.get("pools", [])
        }
        
        return config
    
    def save_project(self, config_dict: Dict[str, Any]) -> Dict[str, str]:
        """
        Create or update a project with full folder structure
        
        Args:
            config_dict: Project configuration dictionary
            
        Returns:
            Status dictionary with path
        """
        # Validate with Pydantic
        config = ProjectConfig(**config_dict)
        
        # Create project structure
        project_path = self.get_project_path(config.nomprojet)
        project_path.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (project_path / "src").mkdir(exist_ok=True)
        (project_path / "tests").mkdir(exist_ok=True)
        
        # Generate meta.yaml
        meta_generator = MetaYamlGenerator()
        meta_content = meta_generator.generate(config)
        with open(project_path / "meta.yaml", 'w') as f:
            f.write(meta_content)
        
        # Generate dag.py
        dag_generator = DagGenerator()
        dag_content = dag_generator.generate(config)
        with open(project_path / f"dag_{config.nomprojet}.py", 'w') as f:
            f.write(dag_content)
        
        # Generate treatment.py
        treatment_generator = TreatmentGenerator()
        treatment_content = treatment_generator.generate(config.pipeline)
        with open(project_path / "src" / "treatment.py", 'w') as f:
            f.write(treatment_content)
        
        # Create __init__.py
        with open(project_path / "src" / "__init__.py", 'w') as f:
            f.write("")
        
        # Create README
        readme = f"""# {config.nomprojet}

Generated by Airflow Studio

## Project Info
- Owner: {config.persoid}
- Stage: {config.stage}
- LD Data: {config.lddata}

## Deployment
Follow the GitOps workflow in the Deployment Cockpit.
"""
        with open(project_path / "README.md", 'w') as f:
            f.write(readme)
        
        return {
            "status": "created",
            "path": str(project_path)
        }
