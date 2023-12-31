import React, { useState, useEffect } from 'react';
import Image from "next/image";
import jlc from "../../../public/logojlc.png";
import { useRouter } from 'next/router';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from 'axios';
import Link from 'next/link';
import LoadingBar from 'react-top-loading-bar'


const Login = () => {
    const router = useRouter();
    const [error, setError] = useState(''); // State variable to track error message
    const [showPassword, setShowPassword] = useState(false);
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // If a token is found, the user is already logged in, so redirect to the "selector" page
            router.push('/selector');
        }
    }, [router]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('/api/login', {
                userid: event.target.userid.value,
                password: event.target.password.value,
            });

            if (response.status === 200) {
                // Save the JWT token in local storage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userid', event.target.userid.value);

                // Redirect to the protected page
                router.push('/selector');
            } else {
                // Handle other status codes
                console.error('Login error:', response.data.error);
                setError('Invalid credentials'); // Set error message
            }
        } catch (error) {
            // Handle network or server error
            console.error('Error:', error);
            setError('Invalid credentials'); // Set error message
        }
    };

    const reg = () => {
        router.push('/phoneverify');
    }

    return (
        <div>
            <LoadingBar
                color='#FF0000'
                height='5px'
                progress={100}
                onLoaderFinished={() => setProgress(0)}
            />
            <div>
                <Image
                    src={jlc}
                    width={150}
                    height={200}
                    className='absolute md:ml-10 mt-2 md:w-40 w-24 ml-36'
                    alt="Logo"
                />
            </div>
            <main className="w-full h-screen flex flex-col items-center justify-center px-4">
                <div className="max-w-sm w-full text-gray-600 space-y-8">
                    <div className="text-center">
                        <Image
                            src="/loginicon.png"
                            width={200}
                            height={200}
                            className='mx-auto'
                            alt="Logo"
                        />

                        <div className="mt-5 space-y-2">
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Log in to your account</h3>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit} action="" method="post"
                    >
                        <div>
                            <label className="font-medium">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name='userid'
                                placeholder='Type your username'
                                required
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    placeholder='Type your password'
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                                {/* Eye button to toggle password visibility */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-0 right-0 mt-3 mr-3 focus:outline-none"
                                >


                                    <svg
                                        className="w-8 h-8 mt-1 text-gray-500 hover:text-indigo-600 cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {showPassword ? (
                                            <FaRegEye />
                                        ) : (
                                            <FaRegEyeSlash />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {error && ( // Conditional rendering of error message
                            <div className="text-red-500">{error}</div>
                        )}

                        <button
                            className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 cursor-pointer"
                            type='submit'
                        >
                            Log In
                        </button>
                        <p className="mt-2 text-center text-sm text-gray-500">
                            Not yet Registered?
                            <a onClick={reg} className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Register Here</a>
                        </p>
                    </form>
                </div>
            </main>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Login;
