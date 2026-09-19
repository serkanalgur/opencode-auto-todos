# opencode-auto-todos

An [OpenCode](https://opencode.ai) plugin that automatically appends custom todos to every task list. Define your standard workflow items once, and they'll be added to every `todowrite` call automatically.

## Use Cases

- **Version bump reminder** — Never forget to bump versions before merging
- **GitHub workflow** — Always create branch, commit, and open PR
- **Code review checklist** — Add standard review items to every feature
- **Deployment steps** — Ensure deploy-related tasks are always tracked

## Installation

### Option 1: Local plugin (recommended)

Copy `plugin.ts` into your project:

```bash
# From the repo root
cp plugin.ts /path/to/your/project/.opencode/plugin/auto-todos.ts
```

### Option 2: Reference from external path

In your `opencode.json`:

```json
{
  "plugin": ["/absolute/path/to/opencode-auto-todos/plugin.ts"]
}
```

### Option 3: npm (if published)

```json
{
  "plugin": ["opencode-auto-todos"]
}
```

## Configuration

Create an `auto-todos.json` file in your project root or inside `.opencode/`:

```json
{
  "todos": [
    {
      "content": "Version bump - update version in package.json",
      "priority": "medium",
      "match": "version bump"
    },
    {
      "content": "Create branch, commit changes, open PR",
      "priority": "medium",
      "match": "github"
    }
  ],
  "always": false,
  "deduplicate": true
}
```

### Config Options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `todos` | `AutoTodo[]` | **required** | List of todos to automatically add |
| `always` | `boolean` | `false` | If `true`, add todos to every `todowrite` call. If `false`, only when the list is first created (empty). |
| `deduplicate` | `boolean` | `true` | Skip adding a todo if a similar one already exists in the list. |

### AutoTodo Shape

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | **yes** | The todo text to display |
| `priority` | `"high" \| "medium" \| "low"` | no | Priority level (default: `"medium"`) |
| `match` | `string` | no | Substring to match against existing todos for deduplication. If omitted, `content` is used. |

## How It Works

1. The plugin hooks into OpenCode's `tool.execute.before` event for the `todowrite` tool
2. Before any todo list is written, it checks the config file
3. It appends your configured todos to the list (unless they already exist)
4. The model then sees the complete list including your standard items

## Example: Version Bump + GitHub Workflow

```json
{
  "todos": [
    {
      "content": "Version bump - update version in package.json or version file",
      "priority": "medium",
      "match": "version bump"
    },
    {
      "content": "GitHub workflow - create branch, commit changes, open PR",
      "priority": "medium",
      "match": "github workflow"
    }
  ]
}
```

With this config, every time you start a new feature, the agent's todo list will automatically include:

```
✓ [your feature-specific todos]
☐ Version bump - update version in package.json or version file
☐ GitHub workflow - create branch, commit changes, open PR
```

## Restart Required

After adding or modifying the plugin or config, **restart OpenCode** for changes to take effect. OpenCode loads plugins and config once at startup.

## License

MIT
