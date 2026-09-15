#!/usr/bin/env python3
"""TaxSarthi Repository Synchronization & Automation Script

Performs safe, authenticated git operations strictly against TARGET_REPO within the
isolated automation workspace. Never logs tokens or secret credentials.
"""

import os
import sys
import subprocess
import re
from datetime import datetime


def log(msg, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Sanitize message to guarantee no token leakage
    token = os.environ.get("GITHUB_TOKEN", "")
    sanitized = msg
    if token and len(token) > 4:
        sanitized = sanitized.replace(token, "[REDACTED_TOKEN]")
    print(f"[{timestamp}] [{level}] {sanitized}", flush=True)


def run_cmd(cmd, cwd=None, check=True, mask_output=False):
    token = os.environ.get("GITHUB_TOKEN", "")
    # Mask command for logging
    cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
    if token and len(token) > 4:
        cmd_str = cmd_str.replace(token, "[REDACTED_TOKEN]")
    log(f"Executing: {cmd_str}")

    proc = subprocess.run(
        cmd,
        cwd=cwd,
        shell=isinstance(cmd, str),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout = proc.stdout.strip()
    stderr = proc.stderr.strip()

    if token and len(token) > 4:
        stdout = stdout.replace(token, "[REDACTED_TOKEN]")
        stderr = stderr.replace(token, "[REDACTED_TOKEN]")

    if stdout and not mask_output:
        log(f"STDOUT:\n{stdout}")
    if stderr:
        log(f"STDERR:\n{stderr}", level="WARN" if proc.returncode == 0 else "ERROR")

    if check and proc.returncode != 0:
        log(f"Command failed with exit code {proc.returncode}", level="ERROR")
        sys.exit(proc.returncode)

    return proc.returncode, stdout, stderr


def sanitize_url(url, token=""):
    """Inject token for git remote without exposing it in logs."""
    if not token or not url.startswith("https://"):
        return url
    clean_url = re.sub(r"https://[^@]+@", "https://", url)
    return clean_url.replace("https://", f"https://x-access-token:{token}@")


def main():
    log("Starting TaxSarthi Repository Sync Automation...")

    # Load and validate environment
    target_repo = os.environ.get("TARGET_REPO", "https://github.com/karanb192/itr-wala.git")
    target_branch = os.environ.get("TARGET_BRANCH", "main")
    token = os.environ.get("GITHUB_TOKEN", "")
    user_name = os.environ.get("GIT_USER_NAME", "TaxSarthi Automation")
    user_email = os.environ.get("GIT_USER_EMAIL", "automation@taxsarthi.local")
    dry_run = os.environ.get("DRY_RUN", "true").lower() in ("true", "1", "yes")
    default_ws = "/automation/workspace" if os.path.exists("/automation") else os.path.join(os.getcwd(), "automation", "workspace")
    workspace_dir = os.environ.get("WORKSPACE_DIR", default_ws)

    log(f"Target Repository: {target_repo}")
    log(f"Target Branch: {target_branch}")
    log(f"Workspace: {workspace_dir}")
    log(f"Dry Run Mode: {dry_run}")

    if not os.path.exists(workspace_dir):
        os.makedirs(workspace_dir, exist_ok=True)

    # 1. Safety Checks: Scan workspace for accidentally committed .env or credentials
    log("Performing safety and security audit on workspace files...")
    secret_patterns = [
        r"BEGIN (?:RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY",
        r"ghp_[a-zA-Z0-9]{36}",
        r"github_pat_[a-zA-Z0-9_]{82}",
        r"AKIA[0-9A-Z]{16}"
    ]

    for root, _, files in os.walk(workspace_dir):
        if ".git" in root:
            continue
        for f in files:
            if f.endswith((".env", ".pem", ".key")):
                log(f"CRITICAL SECURITY WARNING: Sensitive file detected in workspace: {f}", level="ERROR")
                sys.exit(1)
            file_path = os.path.join(root, f)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                    for pat in secret_patterns:
                        if re.search(pat, content):
                            log(f"CRITICAL: Potential hardcoded secret found in {file_path}", level="ERROR")
                            sys.exit(1)
            except Exception:
                pass

    log("✅ Security audit passed: No exposed private keys or tokens found.")

    # 2. Configure Git inside workspace
    run_cmd(["git", "config", "--global", "user.name", user_name])
    run_cmd(["git", "config", "--global", "user.email", user_email])
    run_cmd(["git", "config", "--global", "init.defaultBranch", "main"])

    repo_dir = os.path.join(workspace_dir, "repo")
    auth_url = sanitize_url(target_repo, token)

    if not os.path.exists(os.path.join(repo_dir, ".git")):
        log("Cloning target repository into workspace...")
        run_cmd(["git", "clone", auth_url, repo_dir], mask_output=True)
    else:
        log("Existing repository checkout detected in workspace; fetching updates...")
        run_cmd(["git", "fetch", auth_url, target_branch], cwd=repo_dir, mask_output=True)

    # 3. Check for modifications and changes
    code, status, _ = run_cmd(["git", "status", "--porcelain"], cwd=repo_dir)
    if not status:
        log("No changes detected in workspace repository. Working tree clean.")
        return 0

    log("Changes detected in workspace:")
    log(status)

    # 4. Commit changes with semantic message
    commit_msg = f"chore(automation): sync transformed TaxSarthi assets [{datetime.now().strftime('%Y-%m-%d %H:%M')}]"
    run_cmd(["git", "add", "-A"], cwd=repo_dir)
    run_cmd(["git", "commit", "-m", commit_msg], cwd=repo_dir)
    log(f"Committed changes with message: {commit_msg}")

    # 5. Push or Dry Run
    if dry_run:
        log("DRY_RUN is enabled. Skipping 'git push'. Changes committed locally in workspace.")
    else:
        if not token:
            log("ERROR: GITHUB_TOKEN is required to push to TARGET_REPO when DRY_RUN=false", level="ERROR")
            sys.exit(1)
        log(f"Pushing commit to {target_repo} on branch {target_branch}...")
        run_cmd(["git", "push", auth_url, f"HEAD:{target_branch}"], cwd=repo_dir, mask_output=True)
        log("✅ Successfully pushed changes to TARGET_REPO.")

    log("TaxSarthi Automation run completed successfully.")
    return 0


if __name__ == "__main__":
    main()
