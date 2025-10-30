'use client';
// import { useEffect } from 'react';

export default function AppleLoginButton() {
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && window?.AppleID) {
  //     window.AppleID.auth.init({
  //       clientId: 'com.cheerchampion.web', // your Service ID
  //       scope: 'name email',
  //       redirectURI: 'https://cheerchampion.com/apple-callback', // dummy; popup ignores it
  //       usePopup: true,
  //     });
  //   }
  // }, []);

  // const handleAppleLogin = async () => {
  //   try {
  //     const response: any = await window.AppleID.auth.signIn();
  //     const id_token = response?.authorization?.id_token;

  //     const result = await fetch('/api/auth/apple', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ token: id_token }),
  //     });
  //     const data = await result.json();

  //     if (data.token) {
  //       await loginWithTokenHandler(data.token, id_token);
  //     }
  //   } catch (err) {
  //     console.error('Apple Login Failed:', err);
  //   }
  // };

  return (
    <button 
    // onClick={handleAppleLogin} 
    className="btn bg-black text-white px-4 py-2 rounded">
      Sign in with Apple
    </button>
  );
}
