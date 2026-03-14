param(
  [ValidateSet('phase1', 'phase2')]
  [string]$Phase = 'phase1',
  [switch]$Live
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
  $python = 'python'
}

$args = @("$projectRoot\test\qa_gate.py", '--phase', $Phase)
if ($Live) {
  $args += '--live'
}

& $python @args
exit $LASTEXITCODE
