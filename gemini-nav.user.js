// ==UserScript==
// @name         Gemini 聊天历史侧边导航 (v4.0 自由视窗版)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  完美适配 Gemini：支持拖拽移动、自由缩放尺寸、智能概括。
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
        '.user-query-bubble-with-background',
        '.query-text',
        '[data-test-id="user-query"]'
    ];
    const CHECK_INTERVAL = 1000;

    // === 2. 智能概括算法 ===
    function smartSummarize(text) {
        if (!text) return "";
        let clean = text.replace(/\s+/g, ' ').trim();
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
        const maxLen = /[\u4e00-\u9fa5]/.test(clean) ? 14 : 20;
        return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
    }

    // === 3. 创建可拖拽、可缩放的悬浮窗 ===
    function createNavPanel() {
        let navPanel = document.getElementById('gemini-final-nav');
        if (navPanel) return navPanel;

        navPanel = document.createElement('div');
        navPanel.id = 'gemini-final-nav';
        
        // 核心样式升级：resize 和 拖拽支持
        navPanel.style.cssText = `
            position: fixed; right: 24px; top: 100px; 
            width: 210px; height: 380px; /* 初始尺寸 */
            min-width: 150px; min-height: 150px; /* 最小限制 */
            display: flex; flex-direction: column;
            background: #ffffff; color: #1f1f1f;
            border: 1px solid #dadce0; border-radius: 12px;
            z-index: 2147483647;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            font-family: "Google Sans", Roboto, sans-serif;
            transition: opacity 0.3s;
            resize: both; /* 【关键】开启自由缩放 */
            overflow: hidden; /* 配合 resize 使用 */
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

    // === 4. 实现拖拽逻辑 (Drag Logic) ===
    function makeDraggable(panel, header) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.onmousedown = function(e) {
            e.preventDefault(); // 防止选中文字
            isDragging = true;
            
            // 获取当前位置和鼠标起始点
            const rect = panel.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            
            // 【关键】将定位方式从 right 切换为 left，否则拖拽计算会乱
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = rect.left + 'px';
            panel.style.top = rect.top + 'px';
            
            initialLeft = rect.left;
            initialTop = rect.top;

            // 改变鼠标样式
            header.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none'; // 防止拖拽时选中页面文字
        };

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            panel.style.left = (initialLeft + dx) + 'px';
            panel.style.top = (initialTop + dy) + 'px';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                document.body.style.userSelect = '';
            }
        });
    }

    // === 5. 核心更新逻辑 ===
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

        // 此时不清空 navPanel 本身，只清空内部容器，或者重新构建
        // 为了简单起见，我们只更新列表部分，保留 Header 以免打断拖拽事件绑定
        
        let listContainer = document.getElementById('gemini-nav-list');
        if(!listContainer) {
            navPanel.replaceChildren(); // 第一次初始化

            // A. 顶部标题 (拖拽手柄)
            const header = document.createElement('div');
            header.textContent = 'GEMINI NAV (::)'; // 加个把手符号
            header.style.cssText = `
                padding: 12px 0 8px 0; text-align: center; font-weight: 800; font-size: 11px;
                letter-spacing: 1px; opacity: 0.6; border-bottom: 1px solid rgba(128,128,128,0.2);
                background: inherit; flex-shrink: 0; 
                cursor: grab; /* 【关键】显示抓手光标 */
                user-select: none;
            `;
            // 绑定拖拽
            makeDraggable(navPanel, header);
            navPanel.appendChild(header);

            // B. 列表容器
            listContainer = document.createElement('div');
            listContainer.id = 'gemini-nav-list';
            listContainer.style.cssText = 'flex: 1; overflow-y: auto; padding: 8px; scrollbar-width: thin;';
            navPanel.appendChild(listContainer);
        }

        // 更新列表内容
        listContainer.replaceChildren();
        
        if (currentCount === 0) {
            const tip = document.createElement('div');
            tip.textContent = '等待对话...';
            tip.style.cssText = 'padding:15px; text-align:center; font-size:12px; opacity:0.6;';
            listContainer.appendChild(tip);
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
                
                // 悬停高亮逻辑...
                item.onmouseenter = () => {
                   item.style.background = document.body.classList.contains('dark-theme') ? '#303134' : '#e8f0fe';
                };
                item.onmouseleave = () => item.style.background = 'rgba(128, 128, 128, 0.05)';
                
                item.onclick = (e) => {
                    e.stopPropagation();
                    msg.scrollIntoView({behavior: "smooth", block: "center"});
                };
                listContainer.appendChild(item);
            });
            listContainer.scrollTop = listContainer.scrollHeight;
        }
    }

    // 启动
    setInterval(updateNav, CHECK_INTERVAL);
    setTimeout(updateNav, 1000);
})();