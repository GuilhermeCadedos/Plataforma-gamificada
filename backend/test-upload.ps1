$b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
[IO.File]::WriteAllBytes('C:\Users\llccc\Desktop\Plataforma gamificada\backend\test-upload.png',[Convert]::FromBase64String($b64))

$login = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body (@{email='cadcadedos@gmail.com'; senha='silvane80'} | ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing
Write-Host "TOKEN: $($login.token)"

$resp = Invoke-WebRequest -Uri 'http://localhost:3001/api/profile/upload-picture' -Method Post -Headers @{ Authorization = 'Bearer ' + $login.token } -Form @{ profilePicture = Get-Item 'C:\Users\llccc\Desktop\Plataforma gamificada\backend\test-upload.png' } -UseBasicParsing
Write-Host "STATUS: $($resp.StatusCode)"
Write-Host "CONTENT:" 
Write-Host $resp.Content
