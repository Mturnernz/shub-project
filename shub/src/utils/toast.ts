import toast from 'react-hot-toast';

export const showToast = {
  success: (msg: string) =>
    toast.success(msg, {
      style: {
        background: '#1C1917',
        color: '#F0EEF5',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: { primary: '#059669', secondary: '#ECFDF5' },
    }),
  error: (msg: string) =>
    toast.error(msg, {
      style: {
        background: '#1C1917',
        color: '#F0EEF5',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' },
    }),
  info: (msg: string) =>
    toast(msg, {
      icon: 'ℹ️',
      style: {
        background: '#1C1917',
        color: '#F0EEF5',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
    }),
};
