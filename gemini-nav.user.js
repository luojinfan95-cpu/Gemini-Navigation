// ==UserScript==
// @name         Gemini 聊天历史侧边导航 (最终完美版)
// @namespace    http://tampermonkey.net/
// @version      3.5
// @description  完美适配 Gemini：智能概括、防重叠、支持滚轮、夜间模式适配。
// @author       GeminiUser
// @match        https://gemini.google.com/*
// @match        https://gemini.google.com/app*
// @match        https://gemini.google.com/u/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === 1. 精准定位配置 ===
    const SELECTORS = [
        '.user-query-bubble-with-background', // 目前最准的
        '.query-text',
        '[data-test-id="user-query"]'
    ];
    const CHECK_INTERVAL = 1000;

    // === 2. 智能概括算法 (去除废话) ===
    function smartSummarize(text) {
        if (!text) return "";
        let clean = text.replace(/\s+/g, ' ').trim();

        // 垃圾词库：过滤掉无意义的开头
        const stopWords = [
            /^你好[，,。]?/, /^请问[，,。]?/, /^麻烦[，,。]?/, /^帮我/, /^请帮我/,
            /^我想要/, /^我想/, /^我需要/, /^能否/, /^可以/, /^有没有/, /^如何/, /^怎么/,
            /^这里是/, /^关于/, /^写一个/, /^做一个/, /^解释一下/, /^分析一下/,
            /^hello/i, /^hi/i, /^please/i
        ];

        let hasChanged = true;
        while (hasChanged) {
            hasChanged = false;
            for (let regex of stopWords) {
                if (regex.test(clean)) {
                    clean = clean.replace(regex, '').trim();
                    hasChanged = true;
                }
            }
        }
        clean = clean.replace(/^[，,。：:\?？!！]\s*/, '');

        // 截取逻辑
        const maxLen = /[\u4e00-\u9fa5]/.test(clean) ? 14 : 20;
        return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
    }

    // === 3. 创建悬浮窗 (Flexbox 分层布局) ===
    function createNavPanel() {
        let navPanel = document.getElementById('gemini-final-nav');
        if (navPanel) return navPanel;

        navPanel = document.createElement('div');
        navPanel.id = 'gemini-final-nav';
        navPanel.style.cssText = `
            position: fixed; right: 24px; top: 100px; width: 210px; max-height: 380px;
            display: flex; flex-direction: column; /* 上下分层 */
            background: #ffffff; color: #1f1f1f;
            border: 1px solid #dadce0; border-radius: 12px;
            z-index: 2147483647; /* 强制最高层级 */
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            font-family: "Google Sans", Roboto, sans-serif;
            transition: opacity 0.3s;
        `;

        // 深色模式适配
        if (document.body.classList.contains('dark-theme')) {
            navPanel.style.background = '#1e1f20';
            navPanel.style.color = '#e3e3e3';
            navPanel.style.border = '1px solid #444746';
        }
        document.body.appendChild(navPanel);
        return navPanel;
    }

    // === 4. 核心更新逻辑 ===
    function updateNav() {
        const navPanel = createNavPanel();
        let messages = [];

        for (let sel of SELECTORS) {
            const found = document.querySelectorAll(sel);
            if (found.length > 0) {
                messages = found; break;
            }
        }

        const currentCount = messages.length;
        if (navPanel.getAttribute('data-count') == currentCount) return;
        navPanel.setAttribute('data-count', currentCount);

        navPanel.replaceChildren(); // 安全清空

        // A. 顶部标题 (固定)
        const header = document.createElement('div');
        header.textContent = 'GEMINI NAV';
        header.style.cssText = `
            padding: 12px 0 8px 0; text-align: center; font-weight: 800; font-size: 11px;
            letter-spacing: 1px; opacity: 0.5; border-bottom: 1px solid rgba(0,0,0,0.1);
            background: inherit; flex-shrink: 0; cursor: default;
        `;
        navPanel.appendChild(header);

        // B. 滚动列表 (可变)
        const list = document.createElement('div');
        list.style.cssText = 'flex: 1; overflow-y: auto; padding: 8px; scrollbar-width: thin;';

        if (currentCount === 0) {
            const tip = document.createElement('div');
            tip.textContent = '等待对话...';
            tip.style.cssText = 'padding:15px; text-align:center; font-size:12px; opacity:0.6;';
            list.appendChild(tip);
        } else {
            messages.forEach((msg, index) => {
                const item = document.createElement('div');
                let summary = smartSummarize(msg.textContent || "");
                if (!summary) summary = `对话 ${index + 1}`;

                item.textContent = `${index + 1}. ${summary}`;
                item.style.cssText = `
                    padding: 8px 10px; margin-bottom: 4px; border-radius: 6px; cursor: pointer;
                    font-size: 13px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    background: rgba(128, 128, 128, 0.05); transition: all 0.1s;
                `;

                // 悬停高亮
                item.onmouseenter = () => {
                    item.style.background = '#e8f0fe'; item.style.color = '#1967d2';
                    if(document.body.classList.contains('dark-theme')) {
                        item.style.background = '#303134'; item.style.color = '#a8c7fa';
                    }
                };
                item.onmouseleave = () => {
                    item.style.background = 'rgba(128, 128, 128, 0.05)'; item.style.color = 'inherit';
                };

                // 点击跳转
                item.onclick = (e) => {
                    e.stopPropagation();
                    msg.scrollIntoView({behavior: "smooth", block: "center"});
                };
                list.appendChild(item);
            });
            list.scrollTop = list.scrollHeight; // 自动滚到底部
        }
        navPanel.appendChild(list);
    }

    // 启动
    setInterval(updateNav, CHECK_INTERVAL);
    setTimeout(updateNav, 1000);
})();