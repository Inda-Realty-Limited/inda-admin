import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { Overview } from './pages/Overview';
import { Properties } from './pages/Properties';
import { Agents } from './pages/Agents';
import { Marketing } from './pages/Marketing';
import { Settings } from './pages/Settings';
import { AgentDetail } from './pages/AgentDetail';
import { Login } from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { index: true, Component: Overview },
      { path: 'properties', Component: Properties },
      { path: 'agents', Component: Agents },
      { path: 'agents/:id', Component: AgentDetail },
      { path: 'marketing', Component: Marketing },
      { path: 'settings', Component: Settings },
    ],
  },
]);
