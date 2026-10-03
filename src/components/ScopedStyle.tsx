import { useEffect } from 'react';

/**
 * 各 app 的样式都是全局 CSS（body / :root / .header 等），
 * 直接静态 import 会互相污染。这里把 CSS 以字符串形式注入 <style>，
 * 路由切换时随组件卸载一并移除，实现完全隔离。
 */
export function ScopedStyle({ css }: { css: string }) {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [css]);

  return null;
}