// Instala los git hooks de Husky solo si el proyecto corre dentro de un
// repositorio git (evita fallar el `npm install` en entornos sin .git,
// como contenedores de CI o de build).
import { existsSync } from 'node:fs'

if (existsSync('.git')) {
  const { execSync } = await import('node:child_process')
  execSync('husky', { stdio: 'inherit' })
}
