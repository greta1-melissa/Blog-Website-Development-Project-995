import React from 'react';
import { QuestLogin } from '@questlabs/react-sdk';
import { useAuth } from '../contexts/AuthContext';
import questConfig from '../config/questConfig';
import { LOGO_URL as logo } from '../config/assets';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-purple-600 p-12 flex flex-col justify-center">
        <div className="flex items-center mb-8">
          <img src={logo} alt="Bangtan Mom" className="w-12 h-12 rounded-xl shadow-lg object-cover" />
          <h1 className="text-3xl font-bold text-white ml-4">Bangtan Mom</h1>
        </div>
        <h2 className="text-4xl font-bold text-white mb-6">Welcome Back!</h2>
        <p className="text-purple-100 text-lg">
          Join our community of moms sharing experiences, wellness tips, and love for BTS and K-culture.
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <style jsx>{`
            .quest-login-container input[type="text"],
            .quest-login-container input[type="email"],
            .quest-login-container input[type="password"] {
              max-width: 100% !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .quest-login-container .verification-input,
            .quest-login-container .code-input {
              max-width: 300px !important;
              width: 300px !important;
              margin: 0 auto !important;
            }
            .quest-login-container .input-group {
              max-width: 300px !important;
              margin: 0 auto !important;
            }
            .quest-login-container form {
              max-width: 300px !important;
              margin: 0 auto !important;
            }
            .quest-login-container .form-field {
              max-width: 300px !important;
              width: 100% !important;
            }
          `}</style>
          <div className="quest-login-container">
            <QuestLogin
              onSubmit={login}
              email={true}
              google={false}
              accent={questConfig.PRIMARY_COLOR}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;