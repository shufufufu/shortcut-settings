# Shortcut Settings

**让 VSCode 的任意 boolean 配置项都能绑定快捷键，一键切换开关。**

支持可视化录制快捷键、冲突检测、自动写入配置文件。

---

## ✨ 核心功能

### 1. 可视化绑定快捷键 ⭐ NEW

使用可视化录制器为任意功能绑定快捷键：

1. 打开命令面板，运行：**`Shortcut Settings: Bind Key to Mapping`**
2. 选择你想要绑定的功能（从映射列表）
3. 在录制器中按下你想要的组合键（如 `Cmd+Shift+K`）
4. 实时查看冲突警告（系统默认快捷键 + 用户自定义快捷键）
5. 点击"确认"，自动写入 `keybindings.json` 并打开文件

**特性：**
- 🎹 可视化录制：实时显示按键组合
- ⚠️ 冲突检测：自动检测 100+ 系统默认快捷键和用户自定义快捷键
- 📝 自动写入：一键保存到 keybindings.json
- 🔄 智能规范化：自动统一快捷键格式（如 `shift+cmd+p` → `cmd+shift+p`）
- 🌍 跨编辑器支持：兼容 VSCode/Kwaipilot/Cursor/VSCodium

### 2. 管理已绑定的快捷键 ⭐ NEW

删除不再需要的快捷键配置：

1. 运行：**`Shortcut Settings: Delete Keybinding`**
2. 选择要删除的快捷键（支持多选）
3. 确认删除，自动更新 keybindings.json

### 3. 从系统配置中直接选择

不需要手写配置 key，直接从所有已安装扩展的 boolean 配置项中选择：

1. 打开命令面板，运行：**`Shortcut Settings: Pick Boolean Setting`**
2. 搜索并选择你想要的配置（实时显示当前值 ON/OFF）
3. 选择动作：
   - **Add to mappings** - 添加到常用列表（可选 user/workspace）
   - **Copy keybinding snippet** - 复制快捷键片段到剪贴板

### 4. 快捷键直接切换

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

### 5. 从常用列表快速切换

1. 在 Settings 中配置 `shortcut-settings.mappings`（或通过 Pick Boolean Setting 自动添加）
2. 命令面板运行：**`Shortcut Settings: Pick And Toggle`**
3. 从列表中选择并切换

---

## 📦 可用命令

| 命令 | 说明 |
|------|------|
| `快捷设置: 绑定快捷键 (Bind Key to Mapping)` | 🆕 可视化录制快捷键并绑定到功能 |
| `快捷设置: 删除快捷键 (Delete Keybinding)` | 🆕 删除已绑定的快捷键配置 |
| `快捷设置: 选择布尔设置 (Pick Boolean Setting)` | 从所有配置中选择 boolean 项并操作 |
| `快捷设置: 切换设置 (Toggle Setting)` | 切换指定配置（需传入 args） |
| `快捷设置: 设为 True (Set Setting True)` | 强制设为 true |
| `快捷设置: 设为 False (Set Setting False)` | 强制设为 false |
| `快捷设置: 选择并切换 (Pick And Toggle)` | 从 mappings 列表中选择并切换 |
| `快捷设置: 复制快捷键代码片段 (Copy Keybinding Snippet)` | 复制 keybinding 片段到剪贴板 |
| `快捷设置: 列出映射 (List Mappings)` | 查看所有映射配置 |
| `快捷设置: 添加映射 (Add Mapping)` | 手动添加映射 |
| `快捷设置: 编辑映射 (Edit Mapping)` | 编辑现有映射 |
| `快捷设置: 删除映射 (Remove Mapping)` | 删除映射配置 |

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

使用可视化录制器快速绑定：

1. 运行 `Bind Key to Mapping`
2. 选择 "Minimap" 映射
3. 录制快捷键：按 `F9`
4. 确认，自动写入配置

或手动编辑 `keybindings.json`：

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

### 配置切换
通过 VSCode Extension API 的 `workspace.getConfiguration()` 读取配置，使用 `update()` 方法写回：

- `target: "user"` → 写入全局用户配置
- `target: "workspace"` → 写入工作区配置

### 快捷键绑定
- 直接读写 `keybindings.json` 文件（支持 JSONC 格式）
- 自动检测编辑器类型（VSCode/Kwaipilot/Cursor）并定位正确路径
- 支持注释和尾随逗号的 JSON 格式

**限制：**
- 当前仅支持 **boolean** 类型配置
- 非 boolean 类型会报错并拒绝写入

---

## 📝 快速开始

### 方法 A：可视化绑定（推荐新手） 🆕

1. 打开命令面板（`Cmd/Ctrl+Shift+P`）
2. 运行 `Shortcut Settings: Pick Boolean Setting`
3. 搜索你想要的配置（如输入 `minimap`），选择 `Add to mappings`
4. 运行 `Shortcut Settings: Bind Key to Mapping`
5. 选择刚才添加的配置
6. 在录制器中按下你想要的快捷键
7. 查看冲突警告，确认后自动保存

### 方法 B：命令式切换

1. 打开命令面板（`Cmd/Ctrl+Shift+P`）
2. 运行 `Shortcut Settings: Pick Boolean Setting`
3. 搜索你想要的配置（如输入 `minimap`）
4. 选择 `Add to mappings` → 选择 `User`
5. 再运行 `Pick And Toggle` 就能快速切换

### 方法 C：直接绑定快捷键（推荐熟练用户）

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

**最新版本 0.0.2 主要更新：**
- ✨ 新增可视化快捷键录制器
- ✨ 新增快捷键冲突检测（系统默认 + 用户自定义）
- ✨ 新增快捷键删除功能
- 🌍 支持跨编辑器（VSCode/Kwaipilot/Cursor）
- 🎨 所有命令添加中文翻译

---

## 📜 协议

MIT


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
