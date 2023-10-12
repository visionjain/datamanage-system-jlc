import React, { useState } from 'react';
import Image from "next/image";
import jlc from "../../../public/logojlc.png";
import { useRouter } from 'next/router';
import axios from 'axios';

const Login = () => {
    const router = useRouter();
    const [error, setError] = useState(''); // State variable to track error message

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
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Log in to your account</h3>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit} action="" method="post"
                    >
                        <div>
                            <label className="font-medium">
                                Username
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
                            <input
                                type="password"
                                name='password'
                                placeholder='Type your password'
                                required
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
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
                    </form>
                </div>
            </main>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Login;
