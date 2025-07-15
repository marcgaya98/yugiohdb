---
mode: 'agent'
tools: ['git_branch', 'git_create_branch', 'git_add', 'git_commit', 'git_status']
description: 'Crea una nueva rama, añade cambios y realiza un commit'
---
Crea una nueva rama llamada `${input:branchName}` a partir de la rama actual, añade todos los archivos modificados al staging y realiza un commit con el mensaje `${input:commitMessage}`. Muestra el estado final del repositorio.
