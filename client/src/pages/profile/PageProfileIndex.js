import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { fetchJson, getApiErrorMessage } from '../../utils/api';

function PageProfileIndex() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const resolveFirstProfile = async () => {
      try {
        const profiles = await fetchJson('/api/worker-profiles');

        if (!Array.isArray(profiles) || profiles.length === 0) {
          throw new Error('لا يوجد أي ملف مهني متاح حالياً.');
        }

        navigate(`/profile/${profiles[0].id}`, { replace: true });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(err));
      }
    };

    resolveFirstProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <CircularProgress sx={{ color: '#556b2f' }} />
    </Box>
  );
}

export default PageProfileIndex;
