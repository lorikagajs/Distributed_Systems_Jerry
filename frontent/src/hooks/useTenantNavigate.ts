import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

export function useTenantNavigate() {
  const { slug } = useTenant();
  const navigate = useNavigate();

  return (path: string) => {
    if (!slug) {
      navigate(path);
      return;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    navigate(`/${slug}${normalized}`);
  };
}

export function useTenantPath() {
  const { slug } = useTenant();

  return (path: string) => {
    if (!slug) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `/${slug}${normalized}`;
  };
}
