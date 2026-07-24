from dotenv import load_dotenv
load_dotenv()
import subprocess
from pathlib import Path

def _validate_repo(repo_path: str) -> Path:
    path = Path(repo_path)
    if not path.exists():
        raise ValueError(f"Path does not exist: {repo_path}")

    if (path / ".git").is_dir():
        return path

    result = subprocess.run(
        ["git", "rev-parse", "--is-inside-work-tree"],
        cwd=str(path),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise ValueError(f"Not a valid git repository: {repo_path}")
    return path

def _run_git(args: list[str], repo_path: str, timeout: int | None = None) -> str:
    try:
        result = subprocess.run(
            args,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=timeout,
        )

        if isinstance(result.returncode, int) and result.returncode != 0:
            raise RuntimeError(f"Git command failed: {result.stderr.strip()}")
        return result.stdout
    except subprocess.TimeoutExpired as e:
        raise TimeoutError(
            f"Git command '{' '.join(args)}' timed out after {e.timeout} seconds"
        ) from e

def get_diff(repo_path: str, max_lines: int = 10000, base_ref: str = "main") -> str:
    _validate_repo(repo_path)
    diff_output = _run_git(["git", "diff", f"{base_ref}...HEAD"], repo_path, timeout=5)
    if diff_output.count("\n") > max_lines:
        raise ValueError(f"Diff exceeds maximum allowed lines ({max_lines})")
    return diff_output

def get_current_branch(repo_path: str) -> str:
    _validate_repo(repo_path)
    stdout = _run_git(["git", "rev-parse", "--abbrev-ref", "HEAD"], repo_path)
    return stdout.strip()


def get_changed_files(repo_path: str, base_ref: str = "main") -> list[str]:
    _validate_repo(repo_path)
    stdout = _run_git(
        ["git", "diff", "--name-only", f"{base_ref}...HEAD"], repo_path
    ).strip()
    if not stdout:
        return []
    return stdout.split("\n")
