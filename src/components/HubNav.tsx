import { NavLink } from 'react-router-dom';

export type HubAppMeta = {
  path: string;
  label: string;
  title: string;
  desc: string;
  icon: string;
  theme: string;
};

export const APPS: HubAppMeta[] = [
  {
    path: '/diagrams',
    label: '图谱',
    title: '西游图谱',
    desc: '56 章势力关系与流程图谱，可缩放拖拽',
    icon: '◈',
    theme: '#c3a343',
  },
  {
    path: '/qa',
    label: '启示录',
    title: '西游·启示录',
    desc: '326 条权谋问答，按标签检索',
    icon: '☯',
    theme: '#7c9cff',
  },
  {
    path: '/dee',
    label: '探案',
    title: '狄仁杰探案',
    desc: '38 起古风案件，阅卷 · 勘查 · 断案',
    icon: '⚖',
    theme: '#c9a227',
  },
  {
    path: '/crossword',
    label: '填词',
    title: '成语填词',
    desc: '973 条成语交叉填字，浏览器本地出题',
    icon: '🀄',
    theme: '#8b5cf6',
  },
];

export function HubNav() {
  return (
    <nav className="hub-nav">
      <NavLink to="/" end className="hub-brand">
        互动站合集
      </NavLink>
      {APPS.map((app) => (
        <NavLink
          key={app.path}
          to={app.path}
          className={({ isActive }) => (isActive ? 'hub-link active' : 'hub-link')}
        >
          {app.label}
        </NavLink>
      ))}
    </nav>
  );
}