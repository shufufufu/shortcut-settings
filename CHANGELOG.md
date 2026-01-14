# Changelog

All notable changes to the "shortcut-settings" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Pick Boolean Setting** 命令：从所有已安装扩展（含内置）的 boolean 配置项中直接选择
  - 支持搜索和过滤
  - 实时显示当前值（ON/OFF）
  - 选择后可直接添加到 mappings 或复制 keybinding snippet
  - 添加到 mappings 时可选择 target（user/workspace）

### Changed
- 补齐 `activationEvents`，确保扩展在正常环境下能正确激活
- 兼容 VSCode 1.101.2+（原 1.108.1 降级）

## [0.0.1] - Initial Release

### Added
- **Toggle / Set True / Set False** 命令：通过 args 传入 key 实现 boolean setting 的快捷切换
- **Pick And Toggle** 命令：从 `shortcut-settings.mappings` 中选择并切换
- **Copy Keybinding Snippet** 命令：生成可粘贴到 `keybindings.json` 的片段
- `shortcut-settings.mappings` 配置项：维护常用 boolean settings 的映射清单
- 支持 `target: user | workspace`，控制设置写入位置

### Notes
- 仅支持 **boolean** 类型的 VSCode 设置项
- 非 boolean 类型会提示错误并拒绝写入

## [0.0.1-2] - Initial Release

### Added
- 代码重构
- 添加 mappings的管理方法 `add`、`edit`、`remove`、`list`