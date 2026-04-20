import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <main className="ml-[220px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
