# shortcut-settings

把 VSCode 的设置项（第一期：仅 `boolean`）“命令化”，从而可以绑定到快捷键，实现一键切换开关。

> 原理：通过 `vscode.workspace.getConfiguration().get()` 读取设置，通过 `update()` 写回设置（默认写入 **User / Global**）。

## Features

- 将任意 **boolean** 类型的 VSCode setting 映射为可绑定快捷键的命令：
  - Toggle（true/false 互切）
  - Set True / Set False（显式设值）
- 支持在扩展配置里维护一个映射清单 `shortcut-settings.mappings`
- 提供 QuickPick：从映射清单里选择并切换
- 提供辅助命令：生成可粘贴到 `keybindings.json` 的片段

## Commands

- `Shortcut Settings: Toggle Setting` (`shortcut-settings.toggle`)
- `Shortcut Settings: Set Setting True` (`shortcut-settings.setTrue`)
- `Shortcut Settings: Set Setting False` (`shortcut-settings.setFalse`)
- `Shortcut Settings: Pick And Toggle` (`shortcut-settings.pickAndToggle`)
- `Shortcut Settings: Copy Keybinding Snippet` (`shortcut-settings.copyKeybindingSnippet`)

## Extension Settings

本扩展贡献了以下设置：

### `shortcut-settings.mappings`

一个数组，用于声明你想要映射到快捷键的 setting。

每一项结构如下：

- `id`：string，唯一标识（自定义）
- `key`：string，VSCode setting key，例如 `editor.minimap.enabled`
- `title`：string，可选，展示名称（用于 QuickPick/状态栏提示）
- `target`：`"user" | "workspace"`，可选，写入目标。默认 `user`

示例：

```jsonc
{
  "shortcut-settings.mappings": [
    {
      "id": "minimap",
      "key": "editor.minimap.enabled",
      "title": "Minimap",
      "target": "user"
    },
    {
      "id": "bracketPairColorization",
      "key": "editor.bracketPairColorization.enabled",
      "title": "Bracket Pair Colorization",
      "target": "user"
    }
  ]
}
```

## Keybindings（快捷键绑定）

### 方式 A：直接绑定通用命令（推荐）

在 `keybindings.json` 中添加：

```jsonc
{
  "key": "ctrl+alt+m",
  "command": "shortcut-settings.toggle",
  "args": {
    "key": "editor.minimap.enabled",
    "target": "user",
    "title": "Minimap"
  }
}
```

同理，你也可以绑定显式设值：

```jsonc
{
  "key": "ctrl+alt+shift+m",
  "command": "shortcut-settings.setFalse",
  "args": {
    "key": "editor.minimap.enabled",
    "target": "user",
    "title": "Minimap"
  }
}
```

### 方式 B：用辅助命令生成片段

1. 打开命令面板，运行：`Shortcut Settings: Copy Keybinding Snippet`
2. 从列表中选择一个 mapping
3. 扩展会将 JSON 片段复制到剪贴板
4. 粘贴到 `keybindings.json`，再手动补上你的 `key`

## Notes / Limitations

- 第一版仅支持 **boolean** 设置项：
  - 如果读取到的当前值不是 boolean（例如 key 写错、或该设置不是 boolean），扩展会提示错误并拒绝写入。
- 默认写入目标为 **User / Global**（即 `target: "user"`）。你也可以在 args 或 mapping 中指定 `"workspace"`。

## Development

- `pnpm install`
- 在 VSCode 中按 `F5` 启动 Extension Development Host

## Release Notes

### 0.0.1

- 初版：boolean setting 的 toggle / setTrue / setFalse
- QuickPick：从 mappings 中选择并切换
- 复制 keybinding snippet
