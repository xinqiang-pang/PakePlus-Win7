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


// PakePlus 打印专属注入脚本
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


