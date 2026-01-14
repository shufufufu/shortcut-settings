# Shortcut Settings

**让 VSCode 的任意 boolean 配置项都能绑定快捷键，一键切换开关。**

---

## ✨ 核心功能

### 1. 从系统配置中直接选择 (推荐)

不需要手写配置 key，直接从所有已安装扩展的 boolean 配置项中选择：

1. 打开命令面板，运行：**`Shortcut Settings: Pick Boolean Setting`**
2. 搜索并选择你想要的配置（实时显示当前值 ON/OFF）
3. 选择动作：
   - **Add to mappings** - 添加到常用列表（可选 user/workspace）
   - **Copy keybinding snippet** - 复制快捷键片段到剪贴板

### 2. 快捷键直接切换

在 `keybindings.json` 中绑定任意 boolean 配置：

```jsonc
{
  "key": "ctrl+alt+m",
  "command": "shortcut-settings.toggle",
  "args": {
    "key": "editor.minimap.enabled",
    "title": "Minimap"
  }
}
```

保存后，按 `Ctrl+Alt+M` 即可一键开关 Minimap。

### 3. 从常用列表快速切换

1. 在 Settings 中配置 `shortcut-settings.mappings`（或通过 Pick Boolean Setting 自动添加）
2. 命令面板运行：**`Shortcut Settings: Pick And Toggle`**
3. 从列表中选择并切换

---

## 📦 可用命令

| 命令 | 说明 |
|------|------|
| `Shortcut Settings: Pick Boolean Setting` | 从所有配置中选择 boolean 项并操作 |
| `Shortcut Settings: Toggle Setting` | 切换指定配置（需传入 args） |
| `Shortcut Settings: Set Setting True` | 强制设为 true |
| `Shortcut Settings: Set Setting False` | 强制设为 false |
| `Shortcut Settings: Pick And Toggle` | 从 mappings 列表中选择并切换 |
| `Shortcut Settings: Copy Keybinding Snippet` | 复制 keybinding 片段到剪贴板 |

---

## ⚙️ 配置说明

### `shortcut-settings.mappings`

维护你常用的 boolean 配置清单，方便快速切换和绑定快捷键。

**结构：**

```typescript
{
  "id": string,           // 唯一标识（会自动从 key 生成）
  "key": string,          // VSCode 配置 key（如 "editor.minimap.enabled"）
  "title"?: string,       // 显示名称（可选）
  "target"?: "user" | "workspace"  // 写入位置（默认 user）
}
```

**示例：**

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
      "id": "breadcrumbs",
      "key": "breadcrumbs.enabled",
      "title": "Breadcrumbs"
    }
  ]
}
```

> **💡 提示**：不需要手写！使用 `Pick Boolean Setting` 命令自动添加。

---

## 🎯 使用场景

### 场景 1：演示/录屏时快速隐藏干扰元素

```jsonc
// 一键隐藏 Minimap
{ "key": "f9", "command": "shortcut-settings.toggle", "args": { "key": "editor.minimap.enabled" } }

// 一键隐藏面包屑导航
{ "key": "f10", "command": "shortcut-settings.toggle", "args": { "key": "breadcrumbs.enabled" } }
```

### 场景 2：切换编辑器辅助功能

```jsonc
// 切换括号对颜色
{ "key": "ctrl+alt+b", "command": "shortcut-settings.toggle", "args": { "key": "editor.bracketPairColorization.enabled" } }

// 切换行号显示
{ "key": "ctrl+alt+l", "command": "shortcut-settings.toggle", "args": { "key": "editor.lineNumbers" } }
```

### 场景 3：工作区专属配置

```jsonc
{
  "key": "ctrl+alt+w",
  "command": "shortcut-settings.toggle",
  "args": {
    "key": "editor.formatOnSave",
    "target": "workspace"  // 仅影响当前工作区
  }
}
```

---

## 🔧 原理说明

通过 VSCode Extension API 的 `workspace.getConfiguration()` 读取配置，使用 `update()` 方法写回：

- `target: "user"` → 写入全局用户配置
- `target: "workspace"` → 写入工作区配置

**限制：**
- 当前仅支持 **boolean** 类型配置
- 非 boolean 类型会报错并拒绝写入

---

## 📝 快速开始

### 方法 A：命令式（推荐新手）

1. 打开命令面板（`Cmd/Ctrl+Shift+P`）
2. 运行 `Shortcut Settings: Pick Boolean Setting`
3. 搜索你想要的配置（如输入 `minimap`）
4. 选择 `Add to mappings` → 选择 `User`
5. 再运行 `Pick And Toggle` 就能快速切换

### 方法 B：直接绑定快捷键（推荐熟练用户）

1. 打开 `keybindings.json`（命令面板搜索 `Open Keyboard Shortcuts (JSON)`）
2. 添加绑定：
   ```jsonc
   {
     "key": "你的快捷键",
     "command": "shortcut-settings.toggle",
     "args": { "key": "配置项的key" }
   }
   ```
3. 保存即生效

---

## 🛠️ 开发与贡献

```bash
# 安装依赖
pnpm install

# 启动开发模式
pnpm run watch

# 打包
pnpm run package
```

在 VSCode 中按 `F5` 启动 Extension Development Host 进行调试。

---

## 📄 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细版本历史。

---

## 📜 协议

MIT
