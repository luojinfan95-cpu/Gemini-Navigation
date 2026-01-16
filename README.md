# Gemini Chat History Navigation (UserScript) 🚀

![Version](https://img.shields.io/badge/version-3.5-blue) ![Language](https://img.shields.io/badge/language-JavaScript-yellow) ![Platform](https://img.shields.io/badge/platform-Tampermonkey-green)

一款为 Google Gemini 打造的侧边栏导航增强插件。复刻了 DeepSeek 的对话跳转体验，支持长对话历史的智能概括与快速定位。

> **Project Goal:** Fixing the missing "outline" feature in Gemini to improve productivity during long coding sessions.

## ✨ 功能特性 (Features)

* **🧠 智能概括 (Smart Summarization)**
    * 自动清洗对话开头的废话（如“你好”、“请帮我”），提取核心意图。
    * 支持中英文自适应截取（中文 14 字 / 英文 20 字符）。
* **📍 快速导航 (Quick Navigation)**
    * 点击侧边栏条目，自动平滑滚动（Smooth Scroll）至对应对话位置。
    * 高亮显示当前鼠标悬停的对话层级。
* **🎨 原生级 UI 设计**
    * **完美防重叠**：采用 Flexbox 分层布局，标题吸顶，列表独立滚动。
    * **深色模式适配**：自动检测系统/网页主题，无缝切换深色/浅色外观。
    * **视窗保护**：限制侧边栏最大高度，防止遮挡页面核心内容。
* **🛡️ 安全稳定**
    * 通过原生 DOM 操作绕过 Google 的 `TrustedHTML` 安全策略。
    * 智能检测 URL 变化，支持所有 Gemini 子页面（个人版/企业版）。

## 📸 预览 (Preview)

*(这里可以上传一张你截图的侧边栏效果图，展示悬浮窗的样子)*

## 📥 安装指南 (Installation)

1.  安装浏览器扩展 **Tampermonkey (篡改猴)**。
2.  [点击这里安装脚本](gemini-nav.user.js) (或者下载本仓库的 `gemini-nav.user.js` 文件)。
3.  在浏览器中打开 Google Gemini，侧边栏将自动出现。

> **注意**：首次运行时，如果浏览器右上角出现“开发者模式”提示，请前往 `chrome://extensions` 开启开发者模式以允许脚本注入。

## 🛠️ 技术实现 (Technical Details)

本项目是在 1 小时内完成的快速原型开发，主要攻克了以下技术难点：

### 1. 逆向工程 (Reverse Engineering)
通过 Chrome DevTools 分析，破解了 Google 混淆后的 CSS 类名（如 `.user-query-bubble-with-background`），并利用 `setInterval` 轮询机制解决了 SPA（单页应用）动态加载导致的元素丢失问题。

### 2. 安全策略绕过
Gemini 网页实施了严格的 CSP 策略，禁止直接使用 `innerHTML` 注入未过滤的 HTML。解决方案是完全使用 `document.createElement` 和 `textContent` 构建 DOM 树，确保零安全风险。

### 3. 正则表达式清洗算法
为了实现“伪智能摘要”，编写了多层正则过滤器：
```javascript
// 核心清洗逻辑片段
const stopWords = [
    /^你好[，,。]?/, /^请帮我/, /^Write a/, ...
];
// 循环递归清洗，直到提取出真正的关键词# Gemini Chat History Navigation (UserScript) 🚀

![Version](https://img.shields.io/badge/version-3.5-blue) ![Language](https://img.shields.io/badge/language-JavaScript-yellow) ![Platform](https://img.shields.io/badge/platform-Tampermonkey-green)

一款为 Google Gemini 打造的侧边栏导航增强插件。复刻了 DeepSeek 的对话跳转体验，支持长对话历史的智能概括与快速定位。

> **Project Goal:** Fixing the missing "outline" feature in Gemini to improve productivity during long coding sessions.

## ✨ 功能特性 (Features)

* **🧠 智能概括 (Smart Summarization)**
    * 自动清洗对话开头的废话（如“你好”、“请帮我”），提取核心意图。
    * 支持中英文自适应截取（中文 14 字 / 英文 20 字符）。
* **📍 快速导航 (Quick Navigation)**
    * 点击侧边栏条目，自动平滑滚动（Smooth Scroll）至对应对话位置。
    * 高亮显示当前鼠标悬停的对话层级。
* **🎨 原生级 UI 设计**
    * **完美防重叠**：采用 Flexbox 分层布局，标题吸顶，列表独立滚动。
    * **深色模式适配**：自动检测系统/网页主题，无缝切换深色/浅色外观。
    * **视窗保护**：限制侧边栏最大高度，防止遮挡页面核心内容。
* **🛡️ 安全稳定**
    * 通过原生 DOM 操作绕过 Google 的 `TrustedHTML` 安全策略。
    * 智能检测 URL 变化，支持所有 Gemini 子页面（个人版/企业版）。

## 📸 预览 (Preview)

*(这里可以上传一张你截图的侧边栏效果图，展示悬浮窗的样子)*

## 📥 安装指南 (Installation)

1.  安装浏览器扩展 **Tampermonkey (篡改猴)**。
2.  [点击这里安装脚本](gemini-nav.user.js) (或者下载本仓库的 `gemini-nav.user.js` 文件)。
3.  在浏览器中打开 Google Gemini，侧边栏将自动出现。

> **注意**：首次运行时，如果浏览器右上角出现“开发者模式”提示，请前往 `chrome://extensions` 开启开发者模式以允许脚本注入。

## 🛠️ 技术实现 (Technical Details)

本项目是在 1 小时内完成的快速原型开发，主要攻克了以下技术难点：

### 1. 逆向工程 (Reverse Engineering)
通过 Chrome DevTools 分析，破解了 Google 混淆后的 CSS 类名（如 `.user-query-bubble-with-background`），并利用 `setInterval` 轮询机制解决了 SPA（单页应用）动态加载导致的元素丢失问题。

### 2. 安全策略绕过
Gemini 网页实施了严格的 CSP 策略，禁止直接使用 `innerHTML` 注入未过滤的 HTML。解决方案是完全使用 `document.createElement` 和 `textContent` 构建 DOM 树，确保零安全风险。

### 3. 正则表达式清洗算法
为了实现“伪智能摘要”，编写了多层正则过滤器：
```javascript
// 核心清洗逻辑片段
const stopWords = [
    /^你好[，,。]?/, /^请帮我/, /^Write a/, ...
];
// 循环递归清洗，直到提取出真正的关键词