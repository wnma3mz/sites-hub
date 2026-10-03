import { Link } from 'react-router-dom';
import { APPS } from '../../components/HubNav';

export default function Home() {
  return (
    <div className="hub-home">
      <h1>互动站合集</h1>
      <p>四个小站合集，点击卡片进入。</p>

      <div className="hub-grid">
        {APPS.map((app) => (
          <Link
            key={app.path}
            to={app.path}
            className="hub-card"
            style={{ borderTop: `2px solid ${app.theme}` }}
          >
            <div className="hub-card-icon" style={{ color: app.theme }}>
              {app.icon}
            </div>
            <h2>{app.title}</h2>
            <p>{app.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}