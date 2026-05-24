import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

export function useTenantNavigate() {
  const { slug } = useTenant();
  const navigate = useNavigate();

  return (path: string, options?: NavigateOptions) => {
    if (!slug) {
      navigate(path, options);
      return;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    navigate(`/${slug}${normalized}`, options);
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
