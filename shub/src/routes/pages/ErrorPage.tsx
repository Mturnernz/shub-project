import React, { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError();

  const isChunkError =
    error instanceof Error &&
    (error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('Loading chunk'));

  useEffect(() => {
    if (isChunkError) {
      // A new deployment changed the chunk hashes — force a hard reload so the
      // browser fetches the fresh index.html and the correct new chunks.
      window.location.reload();
    }
  }, [isChunkError]);

  if (isChunkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading update…</p>
        </div>
      </div>
    );
  }

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong';

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="bg-trust-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-trust-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
