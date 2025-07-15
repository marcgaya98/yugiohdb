---
mode: 'agent'
tools: ['git_diff', 'git_diff_unstaged', 'git_diff_staged']
description: 'Analiza los cambios realizados en el código'
---
Muestra y explica las diferencias entre la rama actual y `${input:targetBranch}`. Incluye tanto los cambios no guardados (unstaged) como los cambios preparados para commit (staged).
