'use client';
import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from './config';
import { useRouter } from 'next/navigation';

const Otplogin = () => {
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const auth = getAuth(app);
    const router = useRouter();

    useEffect(() => {
        window.RecaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            'size': 'normal',
            'callback': (response) => {

            },
            'expired-callback': () => {

            }
        })
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
            const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.RecaptchaVerifier);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setAlertMessage('OTP has been sent!');
        } catch (error) {
            setAlertMessage('Failed to send OTP. Please try again.');
            console.log(error);
        }
    };

    const reg = () => {
        router.push('/login');
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

    return (
        <div className="flex flex-col items-center justify-center h-screen">
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
            <div className="flex mb-2">
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
                <div id="recaptcha-container" ></div>
            ) : null}
            <button
                onClick={otpSent ? handleOTPSubmit : handleSendOtp}
                className={`bg-${otpSent ? 'green' : 'blue'}-500 text-white w-[280px] p-2 rounded-md mt-4`}
                style={{ backgroundColor: otpSent ? 'green' : 'blue' }}
            >
                {otpSent ? 'Submit OTP' : 'Send OTP'}
            </button>
            <p className="mt-2 text-center text-sm text-gray-500">
                Already registered?
                <a onClick={reg} className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Login Here</a>
            </p>


        </div>
    );
}

export default Otplogin;