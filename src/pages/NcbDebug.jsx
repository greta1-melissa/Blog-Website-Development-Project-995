import React, { useState, useEffect } from 'react';
import { getNcbStatus } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiXCircle, FiRefreshCw, FiServer } = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    const result = await getNcbStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const StatusItem = ({ label, value, isBool = false }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <div className="flex items-center">
        {isBool ? (
          value ? (
            <span className="flex items-center text-green-600 font-bold">
              <SafeIcon icon={FiCheckCircle} className="mr-2" /> Present
            </span>
          ) : (
            <span className="flex items-center text-red-500 font-bold">
              <SafeIcon icon={FiXCircle} className="mr-2" /> Missing
            </span>
          )
        ) : (
          <span className="text-gray-900 font-bold">{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <SafeIcon icon={FiServer} className="text-2xl mr-3" />
            <h1 className="text-xl font-bold">NCB Connection Debug</h1>
          </div>
          <button 
            onClick={checkStatus} 
            disabled={loading}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiRefreshCw} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="p-6">
          {loading && !status ? (
            <div className="text-center py-8 text-gray-500">
              Checking connection...
            </div>
          ) : status ? (
            <div className="space-y-2">
              <StatusItem label="VITE_NCB_URL" value={status.hasUrl} isBool />
              <StatusItem label="VITE_NCB_INSTANCE" value={status.hasInstance} isBool />
              <StatusItem label="VITE_NCB_API_KEY" value={status.hasApiKey} isBool />
              
              <div className="my-4 border-t border-gray-200"></div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-medium">Read Permission</span>
                {status.canReadPosts ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    Working
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    Failed
                  </span>
                )}
              </div>
              
              <StatusItem label="Fetched Posts Count" value={status.postCount} />

              {status.message && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
                  Status: {status.message}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-red-500">Failed to load status.</div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center">
          This page is for admin diagnostics only. Do not share screenshots containing sensitive data.
        </div>
      </div>
    </div>
  );
};

export default NcbDebug;