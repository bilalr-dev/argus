import subprocess
from pathlib import Path

def _validate_repo(repo_path: str) -> Path:
    path = Path(repo_path)
    if not path.exists():
        raise ValueError(f"Path does not exist: {repo_path}")
    if not (path / ".git").is_dir():
        raise ValueError(f"Not a git repository (missing .git folder): {repo_path}")
    return path


def _run_git(args: list[str], repo_path: str, timeout: int | None = None) -> str:
    try:
        result = subprocess.run(
            args,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.stdout
    except subprocess.TimeoutExpired as e:
        raise TimeoutError(f"Git command '{' '.join(args)}' timed out after {e.timeout} seconds") from e

def get_diff(repo_path: str, max_lines: int = 10000) -> str:
    _validate_repo(repo_path)
    diff_output = _run_git(["git", "diff", "main...HEAD"], repo_path, timeout=5)
    if diff_output.count("\n") > max_lines:
        raise ValueError(f"Diff exceeds maximum allowed lines ({max_lines})")

    return diff_output

def get_current_branch(repo_path: str) -> str:
    _validate_repo(repo_path)
    stdout = _run_git(["git", "rev-parse", "--abbrev-ref", "HEAD"], repo_path)
    return stdout.strip()

def get_changed_files(repo_path: str) -> list[str]:
    _validate_repo(repo_path)
    stdout = _run_git(["git", "diff", "--name-only", "main...HEAD"], repo_path).strip()
    if not stdout:
        return []
    return stdout.split("\n")
