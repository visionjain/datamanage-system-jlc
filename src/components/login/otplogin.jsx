import React, { useState, useEffect, useRef } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from '../../pages/config';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import jlc from '../../../public/logojlc.png'
const Otplogin = () => {
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const auth = getAuth(app);
    const router = useRouter();
    const recaptchaVerifierRef = useRef(null); // Use useRef to store the recaptchaVerifier

    useEffect(() => {
        // Initialize recaptchaVerifier when the component mounts
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
            'size': 'normal',
            'callback': (response) => {

            },
            'expired-callback': () => {

            }
        });
    }, [auth]);

    const handlePhoneNumberChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue.startsWith('+91')) {
            setPhoneNumber(inputValue);
        } else {
            setPhoneNumber(`+91${inputValue}`);
        }
    };

    const handleOTPChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus on the next input field when a digit is entered
        if (index < 5 && value !== '') {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    const handleSendOtp = async () => {
        try {
            // Check if recaptchaVerifier is available before using it
            if (recaptchaVerifierRef.current) {
                const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
                const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifierRef.current);
                setConfirmationResult(confirmation);
                setOtpSent(true);
                setAlertMessage('OTP has been sent!');
            } else {
                setAlertMessage('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            setAlertMessage('Failed to send OTP. Please try again.');
            console.log(error);
        }
    };

    const handleOTPSubmit = async () => {
        try {
            const enteredOtp = otp.join('');
            await confirmationResult.confirm(enteredOtp);
            setOtp(['', '', '', '', '', '']); // Reset the OTP input boxes
            router.push('/register');
        } catch (error) {
            setAlertMessage('Invalid OTP. Please try again.');
            console.log(error);
        }
    };

    const reg = () => {
        router.push('/login');
    }
    return (
        <div>
            <div className='bg-[#F4F4F4] text-black print:hidden md:h-[22vh] h-[40vh] border-b border-gray-400 shadow-lg'>
                <div className='md:flex'>
                    <div className='md:w-1/6'>
                        <Image
                            src={jlc}
                            width={150}
                            height={200}
                            className='absolute md:ml-6 md:w-52 w-24 ml-36 top-2'
                            alt="Logo"
                        />
                    </div>
                    <div className='md:w-5/6 md:flex'>
                        <div className='w-4/6 text-center md:ml-40 ml-16 pt-5'>
                            <div className='md:text-5xl text-lg font-bold font-serif md:pt-0 pt-20'>
                                JAI LIME & CHEMICAL
                            </div>
                            <div>
                                H-1, 503, Road No 15, Bhamashah Ind. Area, Kaladwas, Udaipur
                            </div>
                            <div>
                                Mo. : 99508 35585, 85296 22695
                            </div>
                            <div>
                                GST No. 08ADVPJ9429L1ZL &nbsp; &nbsp; Email: jailime79@gmail.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center md:mt-20 mt-10 md:h-[400px] h-[270px]">
                <h1 className="text-2xl font-semibold mb-4">Please verify your phone number</h1>
                {alertMessage && (
                    <div className="bg-green-200 border border-green-500 text-green-800 px-4 py-3 rounded mb-4">
                        {alertMessage}
                        <span className="float-right cursor-pointer" onClick={() => setAlertMessage('')}>
                        </span>
                    </div>
                )}
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder='Enter Phone Number'
                    className='border border-gray-500 p-2 w-72 rounded-md mb-4'
                />
                <div className="flex">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-input-${index}`}
                            type='text'
                            value={digit}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            placeholder='0'
                            maxLength="1"
                            className='border border-gray-500 p-2 w-10 rounded-md mx-1 text-center'
                        />
                    ))}
                </div>
                {!otpSent ? (
                    <div id="recaptcha-container" className='mt-4'></div>
                ) : null}
                <button
                    onClick={otpSent ? handleOTPSubmit : handleSendOtp}
                    className={`bg-${otpSent ? 'green' : 'blue'}-500 text-white w-[280px] p-2 rounded-md mt-2`}
                    style={{ backgroundColor: otpSent ? 'green' : 'blue' }}
                >
                    {otpSent ? 'Submit OTP' : 'Send OTP'}
                </button>
                <p className="mt-2 text-center text-sm text-gray-500">
                            Already registered?
                            <a onClick={reg} className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Login Here</a>
                        </p>
            </div>
            <div className="mt-10 py-4 border-t md:text-center text-center">
                <p>© 2023  Jai Lime & Chemical. All rights reserved.</p>
            </div>
        </div>
    );
}

export default Otplogin;