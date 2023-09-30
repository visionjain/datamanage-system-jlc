import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const Test = () => {
    const [role, setRole] = useState('');

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

    return (
        <div>
            {role === 'admin' && (
                <div>
                    admin i am admin
                </div>
            )}
            {role === 'user' && (
                <div>
                    hii user i am user
                </div>
            )}
        </div>
    );
}

export default Test;
