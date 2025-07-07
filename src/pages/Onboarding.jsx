import React, { useState } from 'react';
import { OnBoarding } from '@questlabs/react-sdk';
import { useNavigate } from 'react-router-dom';
import questConfig from '../config/questConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart } = FiIcons;

const Onboarding = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const getAnswers = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-purple-600 p-12 flex flex-col justify-center">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <SafeIcon icon={FiHeart} className="text-2xl text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white ml-4">Bangtan Mom</h1>
        </div>
        <h2 className="text-4xl font-bold text-white mb-6">Let's Get Started!</h2>
        <p className="text-purple-100 text-lg">
          Help us personalize your experience by answering a few quick questions.
        </p>
      </div>
      
      <div className="w-full md:w-1/2 p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <OnBoarding
            userId={userId}
            token={token}
            questId={questConfig.QUEST_ONBOARDING_QUESTID}
            answer={answers}
            setAnswer={setAnswers}
            getAnswers={getAnswers}
            accent={questConfig.PRIMARY_COLOR}
            singleChoose="modal1"
            multiChoice="modal2"
          >
            <OnBoarding.Header />
            <OnBoarding.Content />
            <OnBoarding.Footer />
          </OnBoarding>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;