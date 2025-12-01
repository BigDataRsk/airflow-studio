"""
Pydantic Models for strict validation of project configurations
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, validator


class Task(BaseModel):
    """Individual task within a pipeline step"""
    id: str
    name: str
    imports: str = ""
    code: str = "# Add your logic here..."
    priority: Literal['high', 'mid', 'low'] = 'low'
    pool_slots: int = Field(default=1, ge=1, le=5)
    type: Literal['python', 'bash', 'dummy'] = 'python'
    selected_pool: Optional[str] = None


class PipelineStep(BaseModel):
    """Sequential step containing one or more parallel tasks"""
    id: str
    tasks: List[Task] = Field(min_items=1)


class ProjectConfig(BaseModel):
    """Complete project configuration matching TypeScript interface"""
    nomprojet: str = Field(min_length=1)
    coderobin: str = Field(min_length=1, max_length=4)
    git_remote: str
    persoid: str
    lddata: str
    use_conda: bool = False
    condaenv: str = "airflow-ml-3.11"
    stage: Literal['LIL', 'SXB'] = 'LIL'
    use_vertica: bool = False
    silot: str = "BANK"
    
    # I/O Configuration
    use_input: bool = False
    datalab_in: str = ""
    use_output: bool = False
    datalab_out: str = ""
    
    # Infrastructure
    use_nas: bool = False
    use_gpu: bool = False
    
    # Scheduling
    cron: str = ""
    
    # Advanced
    bundle_base: str = ""
    prepare_tests: bool = False
    
    # Pipeline
    pipeline: List[PipelineStep] = Field(min_items=1)
    pools: List[str] = Field(default_factory=list)
    
    @validator('coderobin')
    def coderobin_lowercase(cls, v):
        """Ensure coderobin is lowercase and max 4 chars"""
        return v.lower()[:4]
    
    @validator('nomprojet')
    def nomprojet_safe(cls, v):
        """Ensure project name is filesystem-safe"""
        return v.replace(' ', '_').lower()
    
    class Config:
        schema_extra = {
            "example": {
                "nomprojet": "my_project",
                "coderobin": "robi",
                "git_remote": "git@github.com:org/repo.git",
                "persoid": "jovyan",
                "lddata": "marketing",
                "stage": "LIL",
                "pipeline": [
                    {
                        "id": "s1",
                        "tasks": [
                            {
                                "id": "t1",
                                "name": "extract_data",
                                "imports": "import pandas as pd",
                                "code": "# Logic here",
                                "priority": "low",
                                "pool_slots": 1,
                                "type": "python"
                            }
                        ]
                    }
                ],
                "pools": ["marketing_std_pool"]
            }
        }
