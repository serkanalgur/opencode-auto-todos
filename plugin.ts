import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface AutoTodo {
  content: string
  priority?: "high" | "medium" | "low"
  /** Optional prefix to match existing todos and avoid duplicates */
  match?: string
}

interface AutoTodosConfig {
  /** List of todos to automatically add */
  todos: AutoTodo[]
  /** 
   * If true, add todos to EVERY todowrite call.
   * If false (default), only add when the todo list is first created (empty or new).
   */
  always?: boolean
  /** 
   * If true, skip adding a todo if one with matching content already exists.
   * Default: true
   */
  deduplicate?: boolean
}

const CONFIG_FILE = "auto-todos.json"
const CONFIG_DIRS = [".opencode", "."]

function loadConfig(projectDir: string): AutoTodosConfig | null {
  for (const dir of CONFIG_DIRS) {
    const configPath = join(projectDir, dir, CONFIG_FILE)
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, "utf-8")
        return JSON.parse(raw) as AutoTodosConfig
      } catch (e) {
        console.error(`[auto-todos] Failed to parse ${configPath}:`, e)
      }
    }
  }
  return null
}

export default (async ({ directory }) => {
  const config = loadConfig(directory)

  if (!config || !config.todos || config.todos.length === 0) {
    // No config found or empty todos - register nothing
    return {}
  }

  const deduplicate = config.deduplicate !== false // default true
  const always = config.always === true

  return {
    "tool.execute.before": async (input, output) => {
      // Only intercept todowrite calls
      if (input.tool !== "todowrite") return
      if (!output.args?.todos || !Array.isArray(output.args.todos)) return

      const existingTodos = output.args.todos as Array<{ content: string; [key: string]: any }>

      // If not "always" mode, only add when list is empty (first creation)
      if (!always && existingTodos.length > 0) return

      for (const autoTodo of config.todos) {
        // Check for duplicates
        if (deduplicate) {
          const matchStr = autoTodo.match || autoTodo.content.toLowerCase()
          const alreadyExists = existingTodos.some(
            (t) => t.content?.toLowerCase().includes(matchStr)
          )
          if (alreadyExists) continue
        }

        existingTodos.push({
          content: autoTodo.content,
          status: "pending",
          priority: autoTodo.priority || "medium",
        })
      }
    },
  }
}) satisfies Plugin
