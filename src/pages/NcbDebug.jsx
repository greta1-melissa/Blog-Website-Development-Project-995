import React, { useState, useEffect } from 'react';
import { getNcbStatus, ncbCreate, ncbDelete, ncbReadAll } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiXCircle, FiRefreshCw, FiServer, FiGlobe, FiKey, FiDatabase, FiEdit3, FiAlertTriangle, FiTv } = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [writeTestStatus, setWriteTestStatus] = useState(null); // 'testing', 'success', 'error'
  const [writeError, setWriteError] = useState('');
  
  // Specific check for K-Drama table
  const [kdramaStatus, setKdramaStatus] = useState({ checked: false, exists: false, count: 0, error: '' });

  const checkStatus = async () => {
    setLoading(true);
    const result = await getNcbStatus();
    setStatus(result);

    // Check K-Drama Table specifically
    try {
        const dramas = await ncbReadAll('kdrama_recommendations', { page: 1, limit: 1 });
        if (Array.isArray(dramas)) {
            setKdramaStatus({ checked: true, exists: true, count: dramas.length, error: '' });
        } else {
            setKdramaStatus({ checked: true, exists: false, count: 0, error: 'Table not found or invalid response' });
        }
    } catch (e) {
        setKdramaStatus({ checked: true, exists: false, count: 0, error: e.message });
    }

    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const runWriteTest = async () => {
    setWriteTestStatus('testing');
    setWriteError('');
    try {
      // 1. Create a dummy post
      const testPayload = {
        title: "Debug Test Post",
        content: "This is a temporary post to test write permissions.",
        category: "Debug",
        author: "Admin Debugger",
        date: new Date().toISOString().split('T')[0]
      };
      
      const result = await ncbCreate('posts', testPayload);
      
      // 2. Flexible ID extraction
      let createdId = null;
      if (result) {
         if (result.id) createdId = result.id;
         else if (result.data && result.data.id) createdId = result.data.id;
         else if (Array.isArray(result.data) && result.data.length > 0 && result.data[0]?.id) createdId = result.data[0].id;
         else if (result._id) createdId = result._id;
      }

      if (!createdId) {
        const responseSnippet = JSON.stringify(result || {}).substring(0, 200);
        throw new Error(`Write Failed: Could not read ID from NCB response. Response start: ${responseSnippet}...`);
      }

      // 3. Delete it immediately
      await ncbDelete('posts', createdId);
      setWriteTestStatus('success');
    } catch (err) {
      console.error("Write Test Failed:", err);
      setWriteTestStatus('error');
      setWriteError(err.message || "An unknown error occurred during the write test.");
    }
  };

  const StatusItem = ({ label, value, isBool = false, icon: Icon }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center text-gray-600 font-medium">
        {Icon && <SafeIcon icon={Icon} className="mr-2 text-gray-400" />}
        {label}
      </div>
      <div className="flex items-center">
        {isBool ? (
          value ? (
            <span className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-full">
              <SafeIcon icon={FiCheckCircle} className="mr-1" /> Configured
            </span>
          ) : (
            <span className="flex items-center text-red-500 font-bold text-sm bg-red-50 px-2 py-1 rounded-full">
              <SafeIcon icon={FiXCircle} className="mr-1" /> Missing
            </span>
          )
        ) : (
          <span className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded text-right truncate max-w-[150px]">
            {value}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center text-white">
            <SafeIcon icon={FiServer} className="text-2xl mr-3" />
            <div>
              <h1 className="text-xl font-bold">NCB Connection Debug</h1>
              <p className="text-purple-100 text-xs">Environment & Connectivity Check</p>
            </div>
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
            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
              <SafeIcon icon={FiRefreshCw} className="animate-spin text-3xl mb-3 text-purple-400" />
              Checking connection...
            </div>
          ) : status ? (
            <div className="space-y-8">
              {/* Configuration Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Configuration</h3>
                <div className="bg-white border border-gray-200 rounded-lg px-4">
                  <StatusItem label="API URL" value={status.url} icon={FiGlobe} />
                  <StatusItem label="Instance ID" value={status.maskedInstance} icon={FiDatabase} />
                  <StatusItem label="API Key" value={status.maskedKey} icon={FiKey} />
                </div>
              </div>

              {/* K-Drama Table Check - NEW */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Table Status: K-Dramas</h3>
                <div className={`border rounded-lg px-4 py-3 ${kdramaStatus.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center font-bold text-gray-700">
                            <SafeIcon icon={FiTv} className="mr-2" /> kdrama_recommendations
                        </span>
                        {kdramaStatus.exists ? (
                            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                <SafeIcon icon={FiCheckCircle} className="mr-1" /> Active
                            </span>
                        ) : (
                            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                <SafeIcon icon={FiXCircle} className="mr-1" /> Missing
                            </span>
                        )}
                    </div>
                    {kdramaStatus.exists ? (
                        <p className="text-sm text-green-700">Table found with <strong>{kdramaStatus.count}</strong> records.</p>
                    ) : (
                        <p className="text-sm text-red-700">
                            Table not found. Please create 'kdrama_recommendations' in NCB.
                            {kdramaStatus.error && <span className="block mt-1 text-xs opacity-75">Error: {kdramaStatus.error}</span>}
                        </p>
                    )}
                </div>
              </div>

              {/* Read Connectivity Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Read Connectivity (Posts)</h3>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Read Permission</span>
                    {status.canReadPosts ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="mr-1" /> Working
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiXCircle} className="mr-1" /> Failed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Found <strong>{status.postCount}</strong> posts.
                  </div>
                </div>
              </div>

              {/* Write Connectivity Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Write Connectivity</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Write Permission (Posts)</span>
                    {writeTestStatus === 'success' ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="mr-1" /> Working
                      </span>
                    ) : writeTestStatus === 'error' ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiXCircle} className="mr-1" /> Failed
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiAlertTriangle} className="mr-1" /> Not Tested
                      </span>
                    )}
                  </div>
                  
                  {writeTestStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex flex-col items-start">
                        <div className="flex items-center mb-1">
                            <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-2" /> 
                            <strong className="text-red-700 text-sm">Write Failed</strong>
                        </div>
                        <div className="text-xs text-red-600 font-mono break-all w-full bg-white/50 p-2 rounded mt-1">
                            {writeError}
                        </div>
                    </div>
                  )}

                  <button 
                    onClick={runWriteTest} 
                    disabled={writeTestStatus === 'testing'}
                    className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                      writeTestStatus === 'testing' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                    }`}
                  >
                    {writeTestStatus === 'testing' ? (
                      <>
                        <SafeIcon icon={FiRefreshCw} className="animate-spin mr-2" /> Testing Write Permissions...
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiEdit3} className="mr-2" /> Test Write Permission
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 py-8">Failed to load status.</div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500 flex items-center justify-between border-t border-gray-100">
            <span>Admin Diagnostics Tool</span>
            <span className="text-purple-600 font-medium">Bangtan Mom Blog</span>
        </div>
      </div>
    </div>
  );
};

export default NcbDebug;