# 匿名好感收集 MVP(Deno Deploy 版)

两个页面 + Deno 自带 KV,完全免费,国内访问快。

## 最终网址(Deno Deploy 部署后)
- 填表页:`https://crush-collector.deno.dev/`
- 展示页:`https://crush-collector.deno.dev/view`

## 部署步骤

### 1. 代码已推到 GitHub(已完成)
仓库地址:https://github.com/johnson4224/crush-collector

### 2. 登录 Deno Deploy
打开 https://dash.deno.com/account/upgrade
- 用 GitHub 登录(`johnson4224`)
- 不需要绑卡

### 3. 创建项目
- 左侧 "New Playground" 旁的下拉 → 选 **"New Project"**
- 选 **"GitHub"** → 选 `johnson4224/crush-collector` 这个仓库
- 入口文件填:`main.ts`
- 点 **"Deploy Project"**

### 4. 拿到网址
部署完会分配一个子域名,你也可以改成 `crush-collector`:
- 进项目 → "Settings" → "Custom Domain" → 把项目名改成 `crush-collector`
- 最终网址:`https://crush-collector.deno.dev/`

## 关键文件
- `main.ts` — 全部代码(API + 填表页 + 展示页)

## 修改后重新部署
- 在 Deno Deploy Dashboard 点 "Redeploy" 或者 push 到 GitHub 会自动触发
