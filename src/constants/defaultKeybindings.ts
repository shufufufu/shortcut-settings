/**
 * 常用的 VSCode/Kwaipilot 默认快捷键黑名单
 * 用于检测快捷键冲突
 * 
 * 格式: 规范化的快捷键 -> 命令描述
 */
export const DEFAULT_KEYBINDINGS: Record<string, string> = {
	// === File Operations ===
	'cmd+n': '新建文件',
	'ctrl+n': '新建文件',
	'cmd+o': '打开文件',
	'ctrl+o': '打开文件',
	'cmd+s': '保存文件',
	'ctrl+s': '保存文件',
	'cmd+shift+s': '另存为',
	'ctrl+shift+s': '另存为',
	'cmd+w': '关闭编辑器',
	'ctrl+w': '关闭编辑器',
	'cmd+shift+w': '关闭窗口',
	'ctrl+shift+w': '关闭窗口',
	
	// === Edit Operations ===
	'cmd+z': '撤销',
	'ctrl+z': '撤销',
	'cmd+shift+z': '重做',
	'ctrl+shift+z': '重做',
	'ctrl+y': '重做',
	'cmd+x': '剪切',
	'ctrl+x': '剪切',
	'cmd+c': '复制',
	'ctrl+c': '复制',
	'cmd+v': '粘贴',
	'ctrl+v': '粘贴',
	'cmd+a': '全选',
	'ctrl+a': '全选',
	'cmd+f': '查找',
	'ctrl+f': '查找',
	'cmd+h': '替换/隐藏窗口',
	'ctrl+h': '替换',
	'cmd+shift+f': '在文件中查找',
	'ctrl+shift+f': '在文件中查找',
	'cmd+shift+h': '在文件中替换',
	'ctrl+shift+h': '在文件中替换',
	
	// === Navigation ===
	'cmd+p': '快速打开文件',
	'ctrl+p': '快速打开文件',
	'cmd+shift+p': '显示命令面板',
	'ctrl+shift+p': '显示命令面板',
	'f1': '显示命令面板',
	'cmd+shift+o': '跳转到符号',
	'ctrl+shift+o': '跳转到符号',
	'cmd+t': '跳转到工作区符号',
	'ctrl+t': '跳转到工作区符号',
	'cmd+g': '跳转到行',
	'ctrl+g': '跳转到行',
	'cmd+shift+e': '显示资源管理器',
	'ctrl+shift+e': '显示资源管理器',
	'cmd+shift+g': '显示源代码管理',
	'ctrl+shift+g': '显示源代码管理',
	'cmd+shift+d': '显示调试',
	'ctrl+shift+d': '显示调试',
	'cmd+shift+x': '显示扩展',
	'ctrl+shift+x': '显示扩展',
	
	// === Editor ===
	'cmd+shift+k': '删除行',
	'ctrl+shift+k': '删除行',
	'cmd+shift+enter': '在上方插入行',
	'ctrl+shift+enter': '在上方插入行',
	'cmd+enter': '在下方插入行',
	'ctrl+enter': '在下方插入行',
	'alt+up': '向上移动行',
	'alt+down': '向下移动行',
	'shift+alt+up': '向上复制行',
	'shift+alt+down': '向下复制行',
	'cmd+/': '切换行注释',
	'ctrl+/': '切换行注释',
	'cmd+shift+/': '切换块注释',
	'ctrl+shift+/': '切换块注释',
	'cmd+]': '增加缩进',
	'ctrl+]': '增加缩进',
	'cmd+[': '减少缩进',
	'ctrl+[': '减少缩进',
	
	// === Multi-cursor ===
	'cmd+d': '添加选区到下一个匹配项',
	'ctrl+d': '添加选区到下一个匹配项',
	'cmd+shift+l': '选择所有匹配项',
	'ctrl+shift+l': '选择所有匹配项',
	'cmd+alt+up': '在上方添加光标',
	'ctrl+alt+up': '在上方添加光标',
	'cmd+alt+down': '在下方添加光标',
	'ctrl+alt+down': '在下方添加光标',
	
	// === Terminal ===
	'ctrl+`': '切换终端',
	'cmd+shift+`': '新建终端',
	'ctrl+shift+`': '新建终端',
	
	// === View ===
	'cmd+b': '切换侧边栏',
	'ctrl+b': '切换侧边栏',
	'cmd+shift+v': '预览 Markdown',
	'ctrl+shift+v': '预览 Markdown',
	'cmd+=': '放大',
	'ctrl+=': '放大',
	'cmd+-': '缩小',
	'ctrl+-': '缩小',
	'cmd+0': '重置缩放',
	'ctrl+0': '重置缩放',
	
	// === Split Editor ===
	'cmd+\\': '拆分编辑器',
	'ctrl+\\': '拆分编辑器',
	'cmd+1': '聚焦第一个编辑器组',
	'ctrl+1': '聚焦第一个编辑器组',
	'cmd+2': '聚焦第二个编辑器组',
	'ctrl+2': '聚焦第二个编辑器组',
	'cmd+3': '聚焦第三个编辑器组',
	'ctrl+3': '聚焦第三个编辑器组',
	
	// === Debug ===
	'f5': '开始调试',
	'shift+f5': '停止调试',
	'f9': '切换断点',
	'f10': '单步跳过',
	'f11': '单步进入',
	'shift+f11': '单步跳出',
	
	// === Git ===
	'cmd+shift+g g': '源代码管理',
	'ctrl+shift+g g': '源代码管理',
	
	// === Quick Fix ===
	'cmd+.': '快速修复',
	'ctrl+.': '快速修复',
	
	// === Rename ===
	'f2': '重命名符号',
	
	// === Go to Definition ===
	'f12': '转到定义',
	'cmd+f12': '转到实现',
	'ctrl+f12': '转到实现',
	'shift+f12': '查看引用',
	
	// === Common System Shortcuts ===
	'cmd+q': '退出应用',
	'alt+f4': '退出应用',
	'cmd+r': '刷新',
	'ctrl+r': '刷新',
	'cmd+shift+r': '硬刷新',
	'ctrl+shift+r': '硬刷新',
	'cmd+m': '最小化窗口',
	'cmd+shift+m': '显示问题面板',
	'ctrl+shift+m': '显示问题面板',
	
	// === Formatting ===
	'shift+alt+f': '格式化文档',
	
	// === Tab Navigation (macOS) ===
	'cmd+alt+left': '上一个编辑器',
	'cmd+alt+right': '下一个编辑器',
	'ctrl+tab': '打开下一个',
	'ctrl+shift+tab': '打开上一个',
	
	// === Folding ===
	'cmd+alt+[': '折叠区域',
	'ctrl+shift+[': '折叠区域',
	'cmd+alt+]': '展开区域',
	'ctrl+shift+]': '展开区域',
	'cmd+k cmd+0': '折叠所有',
	'ctrl+k ctrl+0': '折叠所有',
	'cmd+k cmd+j': '展开所有',
	'ctrl+k ctrl+j': '展开所有',
	
	// === Other Common ===
	'cmd+k cmd+w': '关闭所有编辑器',
	'ctrl+k ctrl+w': '关闭所有编辑器',
	'cmd+k v': 'Markdown 侧边预览',
	'ctrl+k v': 'Markdown 侧边预览',
	'cmd+k cmd+f': '格式化选区',
	'ctrl+k ctrl+f': '格式化选区',
	'esc': '取消/关闭',
	'enter': '确认',
	'tab': '缩进/下一个',
	'shift+tab': '反向缩进/上一个',
};
