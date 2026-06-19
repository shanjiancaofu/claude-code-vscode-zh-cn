# 截图与 GIF 制作规范

媒体文件统一放入 `media/`，避免出现账户、邮箱、Token、仓库地址、真实项目代码和完整本地路径。

## 约定文件

```text
media/hero.png                 README 首图，建议 1280×640
media/before-after.png         汉化前后对比图
media/apply-patch.gif          Apply Patch 完整流程，建议 10–20 秒
media/status.png               Check Status 结果
media/restore.gif              Restore 流程
media/social-preview.png       GitHub Social Preview
```

## 建议录制流程

1. 使用无隐私信息的空白示例项目；
2. 展示英文 Claude Code 界面；
3. 打开命令面板并执行 `Apply Patch`；
4. 展示目标路径、替换数量和确认弹窗；
5. Reload Window 后展示中文界面；
6. 展示 `Check Status` 和 `Restore Original Files`。

## GIF 建议

- 宽度控制在 1000–1200 px；
- 帧率 10–15 FPS；
- 尽量低于 10 MB；
- 删除等待、输入密码和无关操作；
- 对用户名、路径和代码区域进行裁剪或打码。

媒体准备完成后，将 README 中“效果预览”的占位提示替换为：

```markdown
![汉化前后对比](./media/before-after.png)

![应用补丁演示](./media/apply-patch.gif)
```
