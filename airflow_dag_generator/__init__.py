"""
Airflow DAG Generator - JupyterLab Extension
Backend server extension for managing Airflow projects
"""

from .handlers import setup_handlers


def _jupyter_server_extension_points():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [{"module": "airflow_dag_generator"}]


def _load_jupyter_server_extension(server_app):
    """
    Called when the extension is loaded.
    
    Args:
        server_app (NotebookWebApplication): handle to the Tornado server instance
    """
    setup_handlers(server_app.web_app)
    server_app.log.info("Airflow DAG Generator extension loaded successfully!")
