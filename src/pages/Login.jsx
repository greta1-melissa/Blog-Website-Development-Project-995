import React from 'react';
import { Link } from 'react-router-dom';
import { QuestLogin } from '@questlabs/react-sdk';
import { useAuth } from '../contexts/AuthContext';
import questConfig from '../config/questConfig';
import { LOGO_URL as logo } from '../config/assets';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-purple-600 p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <img src={logo} alt="Bangtan Mom" className="w-12 h-12 rounded-xl shadow-lg object-cover" />
            <h1 className="text-3xl font-bold text-white ml-4">Bangtan Mom</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Welcome Back!</h2>
          <p className="text-purple-100 text-lg leading-relaxed">
            Join our community of moms sharing experiences, wellness tips, and love for BTS and K-culture.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <QuestLogin
            onSubmit={login}
            email={true}
            google={false}
            accent={questConfig.PRIMARY_COLOR}
            styleConfig={{
              Form: {
                boxShadow: 'none',
                padding: '0',
                backgroundColor: 'transparent'
              },
              Heading: {
                color: '#111827',
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '12px'
              },
              Description: {
                color: '#6B7280',
                fontSize: '16px',
                marginBottom: '32px'
              },
              Label: {
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              },
              Input: {
                borderColor: '#E5E7EB',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '16px',
                color: '#111827',
                backgroundColor: '#F9FAFB',
                borderWidth: '1px'
              },
              PrimaryButton: {
                backgroundColor: '#9333EA', // Purple 600
                color: '#ffffff',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                marginTop: '24px',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
              },
              OtpInput: {
                borderRadius: '12px',
                borderColor: '#E5E7EB',
                color: '#111827',
                width: '48px',
                height: '48px',
                fontSize: '20px'
              }
            }}
          />
          
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Admin access? <Link to="/admin-login" className="text-purple-600 hover:text-purple-700 font-semibold ml-1">Click here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;