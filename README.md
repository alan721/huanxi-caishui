# 欢喜财税官网

> 广州欢喜财税服务有限公司 — 官方网站

---

## 项目结构

```
huanxi-caishui/
├── index.html          # 主页面（全部内容）
├── api/
│   └── contact.js      # 联系表单后端（Vercel Edge Function）
├── public/
│   ├── robots.txt      # 搜索引擎爬虫配置
│   └── sitemap.xml     # 站点地图（SEO）
├── vercel.json         # Vercel 部署配置
├── .gitignore
└── README.md
```

---

## 本地预览

无需安装任何依赖，直接用浏览器打开 `index.html` 即可预览（表单提交功能需部署到 Vercel 后才生效）。

---

## 部署到 GitHub + Vercel

### 第一步：上传到 GitHub

1. 登录 [github.com](https://github.com)，点击右上角 **New repository**
2. 仓库名填 `huanxi-caishui`，选 **Private**（私有），点击 Create
3. 在本地终端执行：

```bash
cd huanxi-caishui
git init
git add .
git commit -m "init: 欢喜财税官网上线"
git branch -M main
git remote add origin https://github.com/你的用户名/huanxi-caishui.git
git push -u origin main
```

### 第二步：部署到 Vercel

1. 登录 [vercel.com](https://vercel.com)，点击 **Add New Project**
2. 选择 **Import Git Repository**，找到 `huanxi-caishui` 仓库
3. Framework Preset 选 **Other**（不是 Next.js / Vite 等）
4. 点击 **Deploy** — 约 30 秒完成部署
5. 部署成功后 Vercel 会给你一个临时域名，如 `huanxi-caishui.vercel.app`

### 第三步：配置环境变量（联系表单邮件功能）

在 Vercel 项目面板 → Settings → Environment Variables，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | 去 resend.com 免费注册获取 |
| `NOTIFY_EMAIL` | `你的邮箱@example.com` | 接收询盘通知的邮箱 |

> **Resend 注册**：访问 [resend.com](https://resend.com) → 免费注册 → 创建 API Key → 粘贴到上面。免费计划每月 3000 封邮件，完全够用。

### 第四步：绑定自定义域名

1. 在 Vercel 项目 → Settings → Domains，点击 **Add Domain**
2. 输入 `www.huanxicaishui.com`（或你购买的域名）
3. 按提示在域名注册商（如阿里云、腾讯云）处添加 DNS 记录：
   - 类型：`CNAME`
   - 名称：`www`
   - 值：`cname.vercel-dns.com`
4. DNS 生效约需 5-30 分钟，Vercel 自动签发 HTTPS 证书

---

## 表单功能说明

- 表单数据 POST 到 `/api/contact`（Vercel Edge Function）
- 服务端校验：姓名、手机号必填，手机号格式验证
- 配置 `RESEND_API_KEY` 后：收到询盘自动发邮件到 `NOTIFY_EMAIL`
- 未配置时：数据打印到 Vercel 函数日志（Dashboard → Functions → Logs）

---

## 上线后 SEO 配置

1. **更新 sitemap.xml**：把 `huanxicaishui.com` 替换为真实域名
2. **更新 robots.txt**：同上
3. **百度站长**：登录 [ziyuan.baidu.com](https://ziyuan.baidu.com) → 添加网站 → 提交 sitemap
4. **Google Search Console**：登录 [search.google.com/search-console](https://search.google.com/search-console) → 添加资产 → 提交 sitemap
5. **ICP 备案**：上线前完成工信部 ICP 备案，把底部的 `粤ICP备XXXXXX号` 替换为真实备案号

---

## 后续维护

- 修改内容 → 编辑 `index.html` → `git add . && git commit -m "更新xx内容" && git push`
- Vercel 会自动检测 GitHub 推送并重新部署（约 30 秒）

---

## 技术栈

- **前端**：纯 HTML / CSS / JavaScript，无框架依赖
- **后端**：Vercel Edge Functions（Node.js 运行时）
- **邮件**：Resend API
- **托管**：Vercel（全球 CDN，自动 HTTPS）
- **版本控制**：GitHub
