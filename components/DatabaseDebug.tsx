import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const DatabaseDebug = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    tablesExist: boolean;
    user: any;
    error: string | null;
  }>({
    connected: false,
    tablesExist: false,
    user: null,
    error: null
  });

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Check connection
        const { error: connectionError } = await supabase
          .from('user_profiles')
          .select('count', { count: 'exact', head: true });

        if (connectionError) {
          setStatus(prev => ({
            ...prev,
            connected: false,
            tablesExist: false,
            error: `Database Error: ${connectionError.message}`
          }));
          return;
        }

        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        setStatus({
          connected: true,
          tablesExist: !connectionError,
          user: user,
          error: userError ? userError.message : null
        });

      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: `Connection failed: ${error}`
        }));
      }
    };

    checkDatabase();
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: status.error ? 'red' : status.tablesExist ? 'green' : 'orange',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Database Status</strong></div>
      <div>Connected: {status.connected ? '✅' : '❌'}</div>
      <div>Tables: {status.tablesExist ? '✅' : '❌'}</div>
      <div>User: {status.user ? '✅ Logged in' : '❌ Not logged in'}</div>
      {status.error && <div>Error: {status.error}</div>}
      {!status.tablesExist && (
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          Run database setup in Supabase!
        </div>
      )}
    </div>
  );
};
