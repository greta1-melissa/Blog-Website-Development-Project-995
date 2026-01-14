import React from 'react';
import { Link } from 'react-router-dom';
import { QuestLogin } from '@questlabs/react-sdk';
import { useAuth } from '../contexts/AuthContext';
import questConfig from '../config/questConfig';
import { LOGO_URL as logo } from '../config/assets';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 relative bg-gradient-to-br from-[#7E22CE] via-[#6B21A8] to-[#4C1D95] text-white flex flex-col justify-center p-12 lg:p-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#9333EA] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#A855F7] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto md:mx-0">
          <Link to="/" className="inline-flex items-center space-x-3 mb-12 group">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
              <img src={logo} alt="Bangtan Mom" className="w-8 h-8 rounded-lg object-cover" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-white/90">Bangtan Mom</span>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Join the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-pink-100 to-white"> Magic Shop </span>
          </h1>
          <p className="text-purple-100 text-lg md:text-xl leading-relaxed mb-12 opacity-90 font-light max-w-md">
            "I do believe your galaxy." <br/> Connect with other moms, share your K-Drama obsessions, and find your daily dose of wellness and joy.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-[440px] mx-auto">
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
                Form: { boxShadow: 'none', padding: '0', backgroundColor: 'transparent' },
                Heading: { color: '#111827', fontSize: '32px', fontWeight: '800', textAlign: 'left', marginBottom: '12px' },
                Description: { color: '#6B7280', fontSize: '16px', marginBottom: '40px', textAlign: 'left', lineHeight: '1.5' },
                Label: { color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' },
                Input: { borderColor: '#E5E7EB', borderRadius: '12px', padding: '16px 20px', fontSize: '16px', backgroundColor: '#F9FAFB' },
                PrimaryButton: { backgroundColor: '#7E22CE', color: '#ffffff', borderRadius: '12px', padding: '16px', fontWeight: '600' }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;