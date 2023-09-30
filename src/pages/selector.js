import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/Customers/useAuth';
import LogoutButton from "../components/Customers/LogoutButton";
import jwt from 'jsonwebtoken';

const Selector = () => {
    const { user } = useAuth();
    const [role, setRole] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Get the user's role from the JWT token in local storage
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwt.decode(token);
            if (decodedToken) {
                setRole(decodedToken.role);
            }
        }
    }, []);

    // Redirect user to "/customers" if they have the "user" role
    useEffect(() => {
        if (role === 'user') {
            router.push('/customers');
        }
    }, [role, router]);

    const handleCustomerClick = () => {
        router.push('/customers');
    };

    const handleLabourClick = () => {
        router.push('/labours');
    };

    return (
        <div>
            {role === 'admin' && (
                <div>
                    <div className="flex flex-col items-center justify-center h-screen">
                        <h1 className="text-3xl font-bold mb-6">Select Dashboard</h1>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold p-10 px-20 rounded mb-4"
                            onClick={handleCustomerClick}
                        >
                            Customers
                        </button>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white text-2xl font-bold p-10 px-24 rounded mt-4"
                            onClick={handleLabourClick}
                        >
                            Labours
                        </button>
                        <div className="pt-10">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
            {/* Remove the user role section since they are redirected */}
        </div>
    );
}

export default Selector;
