<#
.SYNOPSIS
  Registers a daily Windows Scheduled Task that runs the production backup
  (npm run backup) from this repo.

.EXAMPLE
  # Run once from the repo root (PowerShell):
  powershell -ExecutionPolicy Bypass -File scripts/setup-backup-task.ps1

  # Custom times (24h) and task name:
  powershell -ExecutionPolicy Bypass -File scripts/setup-backup-task.ps1 -Times "07:00","19:30"

.NOTES
  Remove later with:
  Unregister-ScheduledTask -TaskName "Rac3131 DB Backup" -Confirm:$false
#>
param(
  [string[]]$Times = @("11:00", "22:00"),
  [string]$TaskName = "Rac3131 DB Backup"
)

$ErrorActionPreference = "Stop"

# Repo root = parent of this script's folder.
$RepoRoot = Split-Path -Parent $PSScriptRoot

# Resolve npm.cmd so the task doesn't depend on interactive PATH.
$npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue)
if (-not $npm) { $npm = (Get-Command npm -ErrorAction SilentlyContinue) }
if (-not $npm) { throw "npm not found on PATH. Install Node.js first." }
$npmPath = $npm.Source

$action = New-ScheduledTaskAction -Execute $npmPath -Argument "run backup" -WorkingDirectory $RepoRoot
$triggers = @($Times | ForEach-Object { New-ScheduledTaskTrigger -Daily -At $_ })
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Description "Local backup of the Rotaract 3131 production database + Supabase storage." -Force | Out-Null

Write-Host "Scheduled task '$TaskName' registered - runs daily at $($Times -join ' and ')."
Write-Host "Working directory: $RepoRoot"
Write-Host ""
Write-Host ('Test it now with:  Start-ScheduledTask -TaskName "' + $TaskName + '"')
Write-Host ('Remove it with:    Unregister-ScheduledTask -TaskName "' + $TaskName + '" -Confirm:$false')
