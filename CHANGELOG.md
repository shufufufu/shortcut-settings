# Changelog

All notable changes to the "shortcut-settings" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-01-23

### Added
- **快捷键绑定功能**：可视化录制快捷键并自动写入 `keybindings.json`
  - 支持键盘录制：实时捕获用户按下的组合键（如 `cmd+shift+k`）
  - 冲突检测：
    - 检测用户自定义快捷键冲突（从 keybindings.json）
    - 检测系统默认快捷键冲突（100+ 常用快捷键黑名单）
    - 实时显示冲突警告，标注来源（用户自定义/系统默认）
  - 自动写入文件：成功录制后直接添加到 keybindings.json 并打开文件
  - 支持 JSONC 格式：自动处理注释和尾随逗号
  - 跨平台支持：自动检测 VSCode/Kwaipilot/Cursor 等编辑器的配置路径

- **快捷键删除功能**：`Delete Keybinding` 命令
  - 列出所有 Shortcut Settings 相关的快捷键配置
  - 支持多选批量删除
  - 删除前二次确认，防止误操作
  - 显示详细的快捷键信息（键位、功能、target）

- **Bind Key to Mapping** 命令：为 mapping 绑定快捷键
  - 从映射列表中选择功能
  - 使用可视化录制器录制快捷键
  - 自动生成并写入 keybinding 配置

### Changed
- 所有命令添加中文翻译：`Shortcut Settings: Command Name(中文说明)`
- 优化快捷键规范化逻辑：统一修饰键顺序（cmd → ctrl → shift → alt）
- 改进错误处理和日志输出，便于调试

### Fixed
- 修复 keybindings.json 不存在时的创建逻辑
- 修复跨编辑器（VSCode/Kwaipilot/Cursor）的路径检测问题
- 修复 JSONC 解析错误（支持注释和尾随逗号）

### Technical
- 代码重构：将默认快捷键黑名单提取到 `src/constants/defaultKeybindings.ts`
- 新增服务函数：
  - `insertKeybindingToFile()` - 写入快捷键配置
  - `deleteKeybindingFromFile()` - 删除快捷键配置
  - `listAllKeybindings()` - 列出所有快捷键
  - `checkKeybindingConflict()` - 检测快捷键冲突
- 新增 UI 组件：可视化快捷键录制器（Webview）

## [0.0.1] - Initial Release

### Added
- **Pick Boolean Setting** 命令：从所有已安装扩展（含内置）的 boolean 配置项中直接选择
  - 支持搜索和过滤
  - 实时显示当前值（ON/OFF）
  - 选择后可直接添加到 mappings 或复制 keybinding snippet
  - 添加到 mappings 时可选择 target（user/workspace）
- **Toggle / Set True / Set False** 命令：通过 args 传入 key 实现 boolean setting 的快捷切换
- **Pick And Toggle** 命令：从 `shortcut-settings.mappings` 中选择并切换
- **Copy Keybinding Snippet** 命令：生成可粘贴到 `keybindings.json` 的片段
- **Mappings 管理命令**：`add`、`edit`、`remove`、`list`
- `shortcut-settings.mappings` 配置项：维护常用 boolean settings 的映射清单
- 支持 `target: user | workspace`，控制设置写入位置

### Changed
- 补齐 `activationEvents`，确保扩展在正常环境下能正确激活
- 兼容 VSCode 1.101.2+（原 1.108.1 降级）

### Notes
- 仅支持 **boolean** 类型的 VSCode 设置项
- 非 boolean 类型会提示错误并拒绝写入
