import React from 'react';
import { Link } from 'react-router-dom';
import { QuestLogin } from '@questlabs/react-sdk';
import { useAuth } from '../contexts/AuthContext';
import questConfig from '../config/questConfig';
import { LOGO_URL as logo } from '../config/assets';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiMusic } = FiIcons;

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Panel - Updated Background Gradient to match Button (#7E22CE) */}
      <div className="w-full md:w-1/2 relative bg-gradient-to-br from-[#7E22CE] via-[#6B21A8] to-[#4C1D95] text-white flex flex-col justify-center p-12 lg:p-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
           {/* Abstract Circle 1 - Made lighter to stand out on new purple */}
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#9333EA] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
           {/* Abstract Circle 2 */}
           <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#A855F7] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
           {/* Abstract Circle 3 */}
           <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-[#D8B4FE] rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
           
           {/* Pattern Overlay */}
           <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-lg mx-auto md:mx-0">
          <Link to="/" className="inline-flex items-center space-x-3 mb-12 group">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
               <img src={logo} alt="Bangtan Mom" className="w-8 h-8 rounded-lg object-cover" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-white/90">Bangtan Mom</span>
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Join the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-pink-100 to-white">
              Magic Shop
            </span>
          </h1>
          
          <p className="text-purple-100 text-lg md:text-xl leading-relaxed mb-12 opacity-90 font-light max-w-md">
            "I do believe your galaxy." <br/>
            Connect with other moms, share your K-Drama obsessions, and find your daily dose of wellness and joy.
          </p>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-purple-100/90">
             <div className="flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm">
                <SafeIcon icon={FiMusic} className="mr-2 text-purple-200" />
                <span>BTS & K-Pop</span>
             </div>
             <div className="flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm">
                <SafeIcon icon={FiHeart} className="mr-2 text-pink-200" />
                <span>Mom Life</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Centered Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white relative">
         <div className="w-full max-w-[440px] mx-auto">
            {/* Mobile Logo for context */}
            <div className="md:hidden text-center mb-8">
               <img src={logo} alt="Logo" className="w-12 h-12 mx-auto rounded-xl mb-3 shadow-lg shadow-purple-200" />
               <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
            </div>

            <div className="bg-white">
                <QuestLogin
                  onSubmit={login}
                  email={true}
                  google={false}
                  accent={questConfig.PRIMARY_COLOR}
                  styleConfig={{
                    Form: {
                        boxShadow: 'none',
                        padding: '0',
                        backgroundColor: 'transparent',
                    },
                    Heading: {
                        color: '#111827',
                        fontSize: '32px',
                        fontWeight: '800',
                        textAlign: 'left',
                        marginBottom: '12px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    Description: {
                        color: '#6B7280',
                        fontSize: '16px',
                        marginBottom: '40px',
                        textAlign: 'left',
                        lineHeight: '1.5'
                    },
                    Label: {
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'block'
                    },
                    Input: {
                        borderColor: '#E5E7EB',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        fontSize: '16px',
                        color: '#111827',
                        backgroundColor: '#F9FAFB',
                        borderWidth: '1px',
                        width: '100%',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                    },
                    PrimaryButton: {
                        backgroundColor: '#7E22CE', // Purple 700 - Matches background start
                        color: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        marginTop: '24px',
                        boxShadow: '0 4px 6px -1px rgba(126, 34, 206, 0.2), 0 2px 4px -1px rgba(126, 34, 206, 0.1)'
                    },
                    OtpInput: {
                        borderRadius: '12px',
                        borderColor: '#E5E7EB',
                        color: '#111827',
                        width: '100%',
                        maxWidth: '60px',
                        height: '60px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        backgroundColor: '#F9FAFB',
                        margin: '0 4px'
                    }
                  }}
                />
            </div>

            <div className="mt-12 text-center pt-8 border-t border-gray-100">
               <p className="text-sm text-gray-500">
                  Are you an administrator? 
                  <Link to="/admin-login" className="text-purple-600 hover:text-purple-800 font-bold ml-1 transition-colors inline-flex items-center">
                     Admin Login <SafeIcon icon={FiIcons.FiArrowRight} className="ml-1 text-xs" />
                  </Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;