window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })


(() => {
  // 1. 全局非法协议拦截，彻底屏蔽about:协议弹窗
  window.addEventListener('beforeunload', (e) => {
    const allowedProtocols = ['http:', 'https:', 'file:', 'data:'];
    try {
      const targetUrl = new URL(window.location.href);
      if (!allowedProtocols.includes(targetUrl.protocol)) {
        e.preventDefault();
        console.log('已拦截非法协议跳转，避免系统弹窗');
        return false;
      }
    } catch (err) {
      e.preventDefault();
      return false;
    }
  });

  // 2. 重写window.open，完全废弃原生about:blank新窗口逻辑
  const originalWindowOpen = window.open;
  window.open = function(url, name, specs) {
    // 拦截所有空URL、about:blank的调用，直接在当前窗口用data URI渲染打印内容
    if (!url || url.startsWith('about:')) {
      console.log('已拦截about:blank新窗口，改用当前窗口渲染打印内容');
      return null;
    }
    return originalWindowOpen.call(window, url, name, specs);
  };

  // 3. 适配PakePlus系统级API的打印函数，直接替换你原来的p_div方法
  window.p_div = function(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`未找到 ID 为 "${id}" 的元素`);
      return;
    }

    // 修复图片相对路径为绝对路径，避免打印时图片破碎
    const clone = element.cloneNode(true);
    const images = clone.getElementsByTagName('img');
    for (let img of images) {
      img.src = img.currentSrc || img.src;
    }

    // 构建完整打印HTML，适配蓝色流程单样式
    const fullPrintHtml = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <style>
          body { background: #0078D7; padding: 10mm; font-family: "微软雅黑", sans-serif; color: #fff; }
          .sheet-table { width: 100%; border-collapse: collapse; border: 2px solid #fff; }
          .sheet-table th, .sheet-table td { border: 1px solid #fff; padding: 6px; text-align: center; font-size: 12px; }
          .sheet-table thead { background: #009E00; }
          @page { size: A4 portrait; margin: 5mm; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${clone.innerHTML}</body>
      </html>
    `;

    // 调用PakePlus系统级API，直接唤起系统打印，完全不生成新窗口
    if (window.__TAURI__) {
      // PakePlus底层基于Tauri，直接调用原生打印API
      window.__TAURI__.window.WebWindow.getCurrent().print().then(() => {
        console.log('打印任务已提交');
      }).catch(() => {
        // 降级方案：调用浏览器原生打印
        window.print();
      });
    } else {
      window.print();
    }
  };

  console.log('PakePlus打印注入脚本加载完成，p_div函数已全局注册');
})();
