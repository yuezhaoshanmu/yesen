'use client';

import { useEffect, useRef } from 'react';

/** Animation is an explanatory model, not fabricated live project telemetry. */
export default function SystemDataFlow({ architecture = false }: { architecture?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let visible = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { node.dataset.flowActive = String(visible && !document.hidden && !reduced.matches && (architecture || !document.querySelector('dialog[open]'))); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(node);
    const dialogObserver = new MutationObserver(update);
    dialogObserver.observe(document.body, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true });
    document.addEventListener('visibilitychange', update); reduced.addEventListener('change', update);
    return () => { observer.disconnect(); dialogObserver.disconnect(); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', update); };
  }, [architecture]);
  const nodes = architecture
    ? [['Browser', '浏览器 · 提交留言'], ['Next.js', '页面与服务端'], ['API', '验证 / 限流 / 权限'], ['Supabase', 'PostgreSQL · 持久化'], ['Realtime', '数据库变更订阅'], ['Connected Clients', '已连接的访客']]
    : [['Frontend', '界面与交互'], ['Backend', '业务与接口'], ['Database', '数据与状态'], ['Deployment', '部署与访问']];
  return <div ref={root} className={`system-data-flow ${architecture ? 'architecture-data-flow' : 'project-data-flow'}`} data-flow-active="false">
    <div className="data-flow-heading"><span>{architecture ? '一次留言，如何抵达另一块屏幕' : '从界面到部署，连接完整产品'}</span><small>{architecture ? 'REQUEST / RESPONSE / EVENT' : 'FULL STACK · 工程链路示意'}</small></div>
    <ol>{nodes.map(([name, label], index) => <li key={name}><span className="flow-node" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><span>{label}</span></li>)}</ol>
    <div className="flow-route" aria-hidden="true"><i className="flow-request" /><i className="flow-response" /></div>
    {architecture && <p className="flow-explanation">请求经 API 校验后写入数据库，响应返回浏览器；数据库变更通过 Realtime 推送到已连接访客。光点为通信过程示意。</p>}
  </div>;
}
