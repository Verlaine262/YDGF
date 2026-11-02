# 维护与部署

## 目录职责

| 路径 | 职责 |
| --- | --- |
| index.html | 页面入口、脚本与样式加载顺序 |
| assets/app.js | 基础页面与原稿展示 |
| assets/studio.js、workspace.js | 本机工具与学习工作台 |
| assets/community.js | 帖子、评论、筛选、创作、删除与站务标志 |
| assets/community-feed.js | 社区布局增强、侧栏面板、演示聊天与通话 |
| assets/community-feed.css | 社区三栏样式及演示界面 |
| assets/official-schedule.js | 固定课程表展示 |
| assets/letters.js、letter-journal.js、memory-vortex.js | 原页、逐条来信与回忆动画 |
| assets/site-story.js、tech-support.js | 关于网站与技术支持 |
| originals/ | 保留的原始文件 |
| data/ | 官方课表及专题数据 |
| .github/workflows/pages.yml | GitHub Pages 发布工作流 |

样式存在多个历史层，修改前检查 index.html 的加载顺序和选择器优先级。社区规则应限制在社区范围，避免覆盖其他页面。不要运行旧开发目录的 build.cjs 覆盖当前站点。

## 修改后的检查

- 检查改动脚本的语法，例如 node --check assets/community.js。
- 用 HTTP 服务预览桌面、390px 与 320px 宽度，检查溢出、登录入口和导航。
- 检查浅色、深色及系统减少动态效果设置。
- 社区修改需实际检查搜索、发帖、编辑、删除确认与取消、站务标志及演示状态。
- 确认普通帖子不能仅通过昵称得到认证，原始帖子没有删除入口。
- 检查控制台异常、资源 404 和原始文件保留情况。

开发工作区另有验证脚本，它们不属于此发布仓库的运行依赖；不要假定克隆仓库后存在 work/ 目录。此前 99 项布局与运行检查不是对所有功能的完整端到端测试。

## 发布到 GitHub Pages

1. 将站点文件放在 Verlaine262/YDGF 仓库根目录。
2. 仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 推送到 main，或手动运行 Publish GitHub Pages。
4. 工作流上传仓库根目录作为静态站点，不执行构建。
5. 在 Actions 确认部署成功后，检查线上页面与资源版本。

生产地址：https://verlaine262.github.io/YDGF/ 。修改脚本或样式时同步更新 index.html 中对应资源版本参数；只有文档修改时无需变更资源版本。

## 排查与恢复

- 旧样式：确认 Actions 成功、资源版本已更新，再强制刷新。
- 本机内容不见：检查设备、浏览器和站点地址是否改变，尝试导入已有备份。
- 登录或私信无法联网：当前没有真实账号或私信后端，属于功能范围限制。
- 回退：在 GitHub 中对目标提交执行 revert 并重新部署，保留历史记录；部署回退不会自动恢复浏览器里已删除的数据。

发布目录会被整体托管，不要把密钥、数据库配置、私人备份或本机绝对路径加入仓库。
