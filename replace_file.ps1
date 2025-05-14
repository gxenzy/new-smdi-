$source = "client/src/pages/Energy Audit/components/BuildingVisualization/BuildingVisualization.new.tsx"
$destination = "client/src/pages/Energy Audit/components/BuildingVisualization/BuildingVisualization.tsx"

if (Test-Path $source) {
    if (Test-Path $destination) {
        Remove-Item -Force $destination
    }
    Move-Item -Force $source $destination
    Write-Output "File replaced successfully."
} else {
    Write-Output "Source file does not exist."
} 