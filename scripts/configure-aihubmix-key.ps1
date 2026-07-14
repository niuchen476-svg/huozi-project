Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "Configure AIHubMix Image API Key"
$form.StartPosition = "CenterScreen"
$form.ClientSize = New-Object System.Drawing.Size(520, 205)
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true

$title = New-Object System.Windows.Forms.Label
$title.Text = "Paste your complete AIHubMix API Key"
$title.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 12, [System.Drawing.FontStyle]::Bold)
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 22)
$form.Controls.Add($title)

$hint = New-Object System.Windows.Forms.Label
$hint.Text = "Saved locally to backend/.env. It will not be uploaded to GitHub."
$hint.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 9)
$hint.AutoSize = $true
$hint.Location = New-Object System.Drawing.Point(25, 57)
$form.Controls.Add($hint)

$keyBox = New-Object System.Windows.Forms.TextBox
$keyBox.Location = New-Object System.Drawing.Point(28, 88)
$keyBox.Size = New-Object System.Drawing.Size(462, 28)
$keyBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$keyBox.UseSystemPasswordChar = $true
$form.Controls.Add($keyBox)

$showBox = New-Object System.Windows.Forms.CheckBox
$showBox.Text = "Show key"
$showBox.AutoSize = $true
$showBox.Location = New-Object System.Drawing.Point(28, 124)
$showBox.Add_CheckedChanged({ $keyBox.UseSystemPasswordChar = -not $showBox.Checked })
$form.Controls.Add($showBox)

$saveButton = New-Object System.Windows.Forms.Button
$saveButton.Text = "Save"
$saveButton.Size = New-Object System.Drawing.Size(90, 34)
$saveButton.Location = New-Object System.Drawing.Point(300, 151)
$saveButton.DialogResult = [System.Windows.Forms.DialogResult]::None
$form.Controls.Add($saveButton)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Text = "Cancel"
$cancelButton.Size = New-Object System.Drawing.Size(90, 34)
$cancelButton.Location = New-Object System.Drawing.Point(400, 151)
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.Controls.Add($cancelButton)

$form.CancelButton = $cancelButton

$saveButton.Add_Click({
    $apiKey = $keyBox.Text.Trim()
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        [System.Windows.Forms.MessageBox]::Show("Please paste the complete API Key first.", "Key required", "OK", "Warning") | Out-Null
        return
    }

    $repoRoot = Split-Path -Parent $PSScriptRoot
    $envPath = Join-Path $repoRoot "backend\.env"
    $entries = [ordered]@{
        "AIHUBMIX_API_BASE" = "https://aihubmix.com/v1"
        "AIHUBMIX_API_KEY" = $apiKey
        "AIHUBMIX_IMAGE_MODEL" = "qwen-image-2.0"
        "AIHUBMIX_IMAGE_ENABLED" = "false"
        "AIHUBMIX_IMAGE_DAILY_LIMIT" = "1"
    }

    $content = if (Test-Path -LiteralPath $envPath) {
        [System.IO.File]::ReadAllText($envPath)
    } else {
        ""
    }

    foreach ($name in $entries.Keys) {
        $line = "$name=$($entries[$name])"
        $pattern = "(?m)^" + [regex]::Escape($name) + "=.*$"
        if ([regex]::IsMatch($content, $pattern)) {
            $content = [regex]::Replace($content, $pattern, $line)
        } else {
            if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { $content += "`r`n" }
            $content += "$line`r`n"
        }
    }

    $envDirectory = Split-Path -Parent $envPath
    [System.IO.Directory]::CreateDirectory($envDirectory) | Out-Null
    [System.IO.File]::WriteAllText($envPath, $content, (New-Object System.Text.UTF8Encoding($false)))

    [System.Windows.Forms.MessageBox]::Show("Saved successfully to backend/.env.", "Configuration complete", "OK", "Information") | Out-Null
    $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Close()
})

$form.Add_Shown({ $keyBox.Focus() })
[void]$form.ShowDialog()
