# 参与贡献

感谢你帮助改进 Claude Code 中文补丁。

## 报告遗漏翻译

请优先使用“遗漏英文”Issue 模板，并提供：

- Claude Code 扩展版本；
- 英文原文；
- 建议译文；
- 文案所在界面；
- 已去除隐私信息的截图。

翻译表位于 `translations/zh-CN.json`：

- `ui`：Webview 固定 UI 文案；
- `host`：扩展主程序和命令文案；
- `rawFragments`：包含动态变量的模板片段；
- `package`：`package.json` 设置和命令描述。

不要提交 Claude Code 插件源码、修改后的插件文件或 `.vsix`。

## 开发流程

```bash
npm install
npm run check
npm run dry-run
npm run package
```

提交 PR 前请确保：

1. TypeScript 编译通过；
2. 所有测试通过；
3. dry-run 不写入任何插件文件；
4. 新功能包含相应测试；
5. README 或 CHANGELOG 已按需更新；
6. 不包含账户、Token、日志、备份或私有开发文档。

## Commit 建议

[type]: description

```text
[feature]: add ...
[fix]: handle ...
[docs]: update ...
[translation]: add ...
[test]: cover ...
```
