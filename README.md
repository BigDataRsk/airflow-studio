
# Airflow Studio - JupyterLab Extension

A modern, offline-capable JupyterLab extension to scaffold, visualize, and deploy Airflow DAGs directly from your cluster workspace.

![Airflow Studio](https://img.shields.io/badge/JupyterLab-Extension-orange?logo=jupyter)
![Security](https://img.shields.io/badge/Security-Offline_Compliant-green)

## Features

*   **Visual DAG Builder**: Drag-and-drop interface for creating pipeline steps and parallel tasks.
*   **GitOps Workflow**: Built-in "Deployment Cockpit" to handle branching, commits, tags, and merges.
*   **Cluster Integration**: Reads directly from `/home/jovyan/workspaces` to manage projects.
*   **Strict Validation**: Ensures `meta.yaml` and `dag.py` compliance.
*   **Offline Mode**: Zero external dependencies at runtime. No CDNs, no API calls.

---

## Prerequisites

*   **Python**: >= 3.8
*   **Node.js**: >= 18.x
*   **JupyterLab**: >= 4.0

## Installation

### Method 1: Installing from Source (Developer)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/airflow-dag-generator.git
    cd airflow-dag-generator
    ```

2.  **Install dependencies**:
    ```bash
    # Python dependencies
    pip install jupyterlab packaging

    # Node dependencies (using yarn or npm)
    jlpm install
    ```

3.  **Build the extension**:
    ```bash
    jlpm run build
    ```

4.  **Install the extension into JupyterLab**:
    ```bash
    jupyter labextension install .
    ```

5.  **Start JupyterLab**:
    ```bash
    jupyter lab
    ```

### Method 2: Offline / Cluster Installation (Production)

For air-gapped clusters, you need to bundle the extension as a Python wheel or a pre-built labextension.

#### 1. Build the Wheel (on an internet-connected machine)

```bash
# Clean previous builds
jlpm clean:lib

# Build the production assets
jlpm build:prod

# Create the python package
python setup.py sdist bdist_wheel
```

This will generate a `.whl` file in the `dist/` folder (e.g., `airflow_dag_generator-1.0.0-py3-none-any.whl`).

#### 2. Install on Cluster

Transfer the `.whl` file to your cluster via your secure gateway.

```bash
# Install the wheel
pip install airflow_dag_generator-1.0.0-py3-none-any.whl

# Enable the extension
jupyter server extension enable airflow_dag_generator
```

---

## Architecture

This extension uses the **Federated Extensions** model of JupyterLab 4.

*   **Frontend**: React 18 application wrapped in a Lumino `ReactWidget`.
*   **Styling**: Tailwind CSS (compiled locally via `postcss` during build, no CDN).
*   **Services**: Uses `@jupyterlab/services` to interact with the real file system contents of the server.

## Security & CVE Compliance

*   **No External Calls**: All AI features (Gemini) are disabled in the source code for the offline build.
*   **Pinned Dependencies**: `package.json` uses strict versions to avoid drifting into vulnerable packages.
*   **Sanitization**: `jszip` is pinned to `^3.10.1` to prevent directory traversal attacks.

## Development

To develop with hot-reloading:

```bash
# Watch mode for TypeScript
jlpm watch

# In another terminal, watch JupyterLab
jupyter lab --watch
```
