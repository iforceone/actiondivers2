const PRODUCTION_HOSTNAME = 'actiondivers2.davebze.workers.dev';
const PREVIEW_HOST_SUFFIX = '-actiondivers2.davebze.workers.dev';

export const isAdminPreviewEnabled = () => {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return hostname !== PRODUCTION_HOSTNAME && hostname.endsWith(PREVIEW_HOST_SUFFIX);
};
