"""
API Handlers for Airflow Studio
Provides REST endpoints for project management, Git operations, and workspace navigation
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

from .core.manager import ProjectManager
from .core.git_service import GitService


class WorkspacesHandler(APIHandler):
    """List available workspaces in /home/jovyan/workspaces"""
    
    @tornado.web.authenticated
    def get(self):
        """GET /airflow-studio/api/workspaces"""
        try:
            base_path = Path.home() / "workspaces"
            if not base_path.exists():
                self.finish(json.dumps([]))
                return
            
            workspaces = [
                d.name for d in base_path.iterdir() 
                if d.is_dir() and not d.name.startswith('.')
            ]
            
            self.finish(json.dumps(workspaces))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e)}))


class ProjectHandler(APIHandler):
    """Handle project CRUD operations"""
    
    @tornado.web.authenticated
    def get(self, project_name: str):
        """GET /airflow-studio/api/project/{name}"""
        try:
            manager = ProjectManager()
            config = manager.load_project(project_name)
            self.finish(json.dumps(config))
        except FileNotFoundError:
            self.set_status(404)
            self.finish(json.dumps({"error": f"Project '{project_name}' not found"}))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e)}))
    
    @tornado.web.authenticated
    def post(self):
        """POST /airflow-studio/api/project - Create/Update project"""
        try:
            config = json.loads(self.request.body)
            manager = ProjectManager()
            result = manager.save_project(config)
            self.finish(json.dumps(result))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e)}))


class GitHandler(APIHandler):
    """Execute Git commands in project workspace"""
    
    @tornado.web.authenticated
    def post(self):
        """POST /airflow-studio/api/git"""
        try:
            data = json.loads(self.request.body)
            command = data.get('command', '')
            cwd = data.get('cwd', '')
            
            if not command or not cwd:
                self.set_status(400)
                self.finish(json.dumps({"error": "Missing 'command' or 'cwd'"}))
                return
            
            git_service = GitService()
            result = git_service.execute(command, cwd)
            self.finish(json.dumps(result))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e), "success": False, "output": ""}))


class CondaHandler(APIHandler):
    """List available Conda environments"""
    
    @tornado.web.authenticated
    def get(self):
        """GET /airflow-studio/api/conda"""
        try:
            conda_dir = Path("/etc/conda/envs/custom")
            if not conda_dir.exists():
                self.finish(json.dumps([]))
                return
            
            envs = [
                d.name for d in conda_dir.iterdir() 
                if d.is_dir()
            ]
            
            self.finish(json.dumps(envs))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"error": str(e)}))


def setup_handlers(web_app):
    """
    Register all API handlers with the Jupyter server
    
    Args:
        web_app: The Tornado web application
    """
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    
    handlers = [
        (url_path_join(base_url, "airflow-studio", "api", "workspaces"), WorkspacesHandler),
        (url_path_join(base_url, "airflow-studio", "api", "project", "(.+)"), ProjectHandler),
        (url_path_join(base_url, "airflow-studio", "api", "project"), ProjectHandler),
        (url_path_join(base_url, "airflow-studio", "api", "git"), GitHandler),
        (url_path_join(base_url, "airflow-studio", "api", "conda"), CondaHandler),
    ]
    
    web_app.add_handlers(host_pattern, handlers)
