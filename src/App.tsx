import { lazy, Suspense, type ReactNode } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { HubNav } from './components/HubNav';

import Home from './apps/home/Home';

const DiagramsApp = lazy(() => import('./apps/diagrams/DiagramsApp'));
const QaApp = lazy(() => import('./apps/qa/QaApp'));
const DeeApp = lazy(() => import('./apps/dee/DeepApp').then((m) => ({ default: m.App })));
const CrosswordApp = lazy(() => import('./apps/crossword/CrosswordApp'));

function Page({ children }: { children: ReactNode }) {
  return <div className="hub-page">{children}</div>;
}

export default function App() {
  return (
    <HashRouter>
      <HubNav />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/diagrams"
            element={
              <Page>
                <DiagramsApp />
              </Page>
            }
          />
          <Route
            path="/qa"
            element={
              <Page>
                <QaApp />
              </Page>
            }
          />
          <Route
            path="/dee"
            element={
              <Page>
                <DeeApp />
              </Page>
            }
          />
          <Route
            path="/crossword"
            element={
              <Page>
                <CrosswordApp />
              </Page>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}