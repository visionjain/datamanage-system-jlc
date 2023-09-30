import { useRouter } from 'next/router';
import { useEffect } from 'react';

const LogoutButton = () => {
  const router = useRouter();

  // Function to handle logout
  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');

    // Redirect to the login page or any other desired location
    router.push('/login');
  };

  useEffect(() => {
    // You can add any additional cleanup logic here, if needed.
  }, []);

  return (
    <button onClick={handleLogout} className="logout-button bg-red-600 text-white p-3 rounded-xl ml-6">
      Logout
    </button>
  );
};

export default LogoutButton;
