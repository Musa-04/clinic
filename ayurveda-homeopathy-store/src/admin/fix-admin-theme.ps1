# Finish the light "material" theme migration for the admin panel.
# Converts leftover dark-theme utility tokens to light-theme equivalents
# across the four admin content files. White text on colored buttons is
# preserved. Placeholders are handled in a final pass to avoid cascade bugs.

$ErrorActionPreference = "Stop"

$files = @(
  "AdminOrders.jsx",
  "AdminInsights.jsx",
  "AdminProducts.jsx",
  "AdminManagement.jsx"
)

# A line matching this has an intentionally dark/colored background, so its
# white text must stay white (e.g. emerald buttons, gradient logo).
$coloredBg = "(bg-(emerald|rose|sky|amber|indigo|teal|red|blue|green|violet|purple|pink|orange|lime|cyan)-(300|400|500|600|700|800))|(from-(emerald|teal|rose|sky|amber|indigo|red|blue|green)-(400|500|600|700))"

# Ordered find -> replace pairs (dark -> light).
$pairs = @(
  @{ F = "bg-neutral-950/80"; R = "bg-stone-100" }
  @{ F = "bg-neutral-950/70"; R = "bg-stone-100" }
  @{ F = "bg-neutral-950/60"; R = "bg-stone-100" }
  @{ F = "bg-neutral-950/55"; R = "bg-stone-100" }
  @{ F = "bg-neutral-950";    R = "bg-stone-100" }
  @{ F = "bg-neutral-900/80"; R = "bg-white" }
  @{ F = "bg-neutral-900";    R = "bg-white" }
  @{ F = "bg-black/20";       R = "bg-stone-200" }
  @{ F = "bg-white/2.5";      R = "bg-stone-100" }
  @{ F = "bg-white/10";       R = "bg-stone-200" }
  @{ F = "bg-white/7";        R = "bg-stone-100" }
  @{ F = "bg-white/6";        R = "bg-stone-100" }
  @{ F = "bg-white/5";        R = "bg-stone-100" }
  @{ F = "bg-white/4";        R = "bg-stone-100" }
  @{ F = "bg-white/3";        R = "bg-stone-100" }
  @{ F = "bg-white/2";        R = "bg-stone-100" }
  @{ F = "border-white/15";   R = "border-stone-300" }
  @{ F = "border-white/10";   R = "border-stone-300" }
  @{ F = "border-white/8";    R = "border-stone-300" }
  @{ F = "border-white/7";    R = "border-stone-200" }
  @{ F = "border-white/6";    R = "border-stone-200" }
  @{ F = "border-white/5";    R = "border-stone-200" }
  @{ F = "divide-white/10";   R = "divide-stone-200" }
  @{ F = "divide-white/6";    R = "divide-stone-200" }
  @{ F = "divide-white/5";    R = "divide-stone-200" }
  @{ F = "divide-white/4.5";  R = "divide-stone-200" }
  @{ F = "text-stone-100";    R = "text-stone-800" }
  @{ F = "text-stone-200";    R = "text-stone-700" }
  @{ F = "text-stone-300";    R = "text-stone-600" }
  @{ F = "text-stone-400";    R = "text-stone-500" }
  @{ F = "text-emerald-100";  R = "text-emerald-700" }
  @{ F = "text-emerald-200";  R = "text-emerald-700" }
  @{ F = "text-emerald-300";  R = "text-emerald-700" }
  @{ F = "text-emerald-400";  R = "text-emerald-600" }
  @{ F = "text-amber-100";    R = "text-amber-700" }
  @{ F = "text-amber-200";    R = "text-amber-700" }
  @{ F = "text-amber-300";    R = "text-amber-700" }
  @{ F = "text-sky-100";      R = "text-sky-700" }
  @{ F = "text-sky-200";      R = "text-sky-700" }
  @{ F = "text-sky-300";      R = "text-sky-700" }
  @{ F = "text-indigo-200";   R = "text-indigo-700" }
  @{ F = "text-rose-100";     R = "text-rose-700" }
  @{ F = "text-rose-200";     R = "text-rose-700" }
  @{ F = "text-rose-300";     R = "text-rose-700" }
  # text-white handled specially (protected on colored-bg lines)
  @{ F = "text-white";        R = "text-stone-900" }
)

# Longer finds first so e.g. bg-white/2.5 is handled before bg-white/2.
$sorted = $pairs | Sort-Object { $_.F.Length } -Descending

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (-not (Test-Path $path)) { $path = $file }
  $raw = Get-Content -LiteralPath $path -Raw
  $lines = $raw -split "\r?\n"

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    foreach ($p in $sorted) {
      if ($p.F -eq "text-white") {
        if ($line -notmatch $coloredBg) {
          $line = $line.Replace($p.F, $p.R)
        }
      } else {
        $line = $line.Replace($p.F, $p.R)
      }
    }
    $lines[$i] = $line
  }

  # Final pass: placeholders (avoids being re-touched by text-stone-N rules).
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $lines[$i] = $lines[$i].
      Replace("placeholder:text-stone-600", "placeholder:text-stone-400").
      Replace("placeholder:text-stone-500", "placeholder:text-stone-400")
  }

  $out = ($lines -join "`n")
  Set-Content -LiteralPath $path -Value $out -NoNewline
  Write-Output ("updated: " + $file)
}
