import Otplogin from '@/components/login/otplogin'
import React, { useState, useEffect, use } from 'react';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import { app } from './config';
import { useRouter } from 'next/navigation';

const Phoneverify = () => {
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if(user) {
                router.push('/register');
            }
        });
    },[auth, router]);
  return (
    <div>
      <Otplogin/>
    </div>
  )
}

export default Phoneverify
