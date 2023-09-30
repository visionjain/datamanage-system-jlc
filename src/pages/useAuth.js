import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token'); // You can also use cookies for this

    if (!token) {
      // Redirect unauthenticated users to the login page
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Disable ESLint rule for this specific line

  // Return authentication status or user information if needed
  const isAuthenticated = !!localStorage.getItem('token');
  const userId = localStorage.getItem('userid'); // Assuming you store user ID in localStorage

  return { isAuthenticated, userId };
};6

export default useAuth;
