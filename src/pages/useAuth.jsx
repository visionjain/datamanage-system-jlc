import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token'); // You can also use cookies for this

    if (!token) {
      // Redirect unauthenticated users to the login page
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Disable ESLint rule for this specific line

  return {};
};
