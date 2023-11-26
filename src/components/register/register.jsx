import Image from "next/image";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import jlc from '../../../public/logojlc.png'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const Register = () => {
    const [userid, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [userPhoneNumber, setUserPhoneNumber] = useState('');

    const router = useRouter(); // Initialize the Next.js router
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, you can access user.phoneNumber
                const phoneNumber = user.phoneNumber;
                const withoutCountryCode = phoneNumber.substring(3); // Remove the first three characters (+91)
                setUserPhoneNumber(withoutCountryCode);
            } else {
                // User is signed out
                setUserPhoneNumber('');
            }
        });

        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const token = localStorage.getItem('token'); // You can also use cookies for this
        if (token) {
            // Redirect authenticated users to a protected page (e.g., /selector)
            router.push('/selector');
        }
    }, [router]); // Include 'router' in the dependency array



    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('/api/register', {
                userid: userPhoneNumber,
                password,
            });

            if (response.status === 201) {
                setUsername('');
                setPassword('');
                setSuccessMessage('Registration successful');
                // Save the JWT token in local storage (you can also use cookies)
                localStorage.setItem('token', response.data.token);
            } else {
                // Handle unexpected response status
                setError('Error Occured');
            }

        } catch (err) {
            if (err.response && err.response.status === 500) {
                setError('User already exists! Please Login');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                // Handle other registration errors, if any
                setError(err.response ? err.response.data.error : 'Registration successful');
                router.push('/login');
            }

            // Set a timeout to clear the error message after 2 seconds
            setTimeout(() => {
                setError('');
            }, 2000);
        }
    };

    const reg = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/phoneverify');
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div>
            <div>
                <Image
                    src={jlc}
                    width={150}
                    height={200}
                    className='absolute md:ml-10 md:w-40 w-24 ml-36'
                    alt="Logo"
                />
            </div>
            <main className="w-full h-screen flex flex-col items-center justify-center px-4">
                <div className="max-w-sm w-full text-gray-600 space-y-8">
                    <div className="text-center">
                        <Image
                            src="/loginicon.png"
                            width={150}
                            height={150}
                            className='mx-auto'
                            alt="Logo"
                        />
                        <div className="mt-5 space-y-2">
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Register for your account</h3>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="font-medium">Phone Number</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    name='userid'
                                    placeholder='Type your username'
                                    required
                                    value={userPhoneNumber} // Use the user's phone number as the username
                                    readOnly
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                                <button onClick={handleLogout} className="text-sm bg-green-500 text-black font-semibold rounded-xl w-30 mt-2 ml-1 h-10">Change Number</button>
                            </div>
                        </div>
                        <div>
                            <label className="font-medium">Password</label>
                            <input
                                type="password"
                                name='password'
                                placeholder='Type your password'
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 cursor-pointer"
                            type="submit"
                        >
                            Register
                        </button>
                        <p className="mt-2 text-center text-sm text-gray-500">
                            Already registered?
                            <a onClick={reg} className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Login Here</a>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Register