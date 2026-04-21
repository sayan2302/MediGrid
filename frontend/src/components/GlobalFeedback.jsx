import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { subscribeApiError, subscribeApiLoading, subscribeApiSuccess } from '../api/client';

export default function GlobalFeedback() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubLoading = subscribeApiLoading((count) => {
      setPendingCount(count);
    });

    const unsubSuccess = subscribeApiSuccess((message) => {
      toast.success(message || 'Action completed.');
    });

    const unsubError = subscribeApiError((message) => {
      toast.error(message || 'Something went wrong.');
    });

    return () => {
      unsubLoading();
      unsubSuccess();
      unsubError();
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#211922',
            border: '1px solid #e5e5e0',
            borderRadius: '12px'
          }
        }}
      />

      {pendingCount > 0 ? (
        <div className="global-spinner-overlay" role="status" aria-live="polite">
          <div className="global-spinner-card">
            <span className="global-spinner-ring" />
            <span>Processing request...</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
