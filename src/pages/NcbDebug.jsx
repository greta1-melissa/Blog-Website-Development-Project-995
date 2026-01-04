import React, { useState, useEffect } from 'react';
import { getNcbStatus } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiRefreshCw, FiServer, FiTrash2 } = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createPostResult, setCreatePostResult] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const result = await getNcbStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const runRawTest = async (url, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(url, options);
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = text;
      }
      return { success: res.ok, status: res.status, body: json };
    } catch (e) {
      return { success: false, status: 'NET_ERR', body: e.message };
    }
  };

  const runCreatePostTest = async () => {
    setCreatePostResult({ loading: true });
    
    // CLEANED: We no longer append ?Instance=... from the frontend.
    // The proxy handles this injection server-side.
    const url = `/api/ncb/create/posts`;
    
    const payload = {
      title: "Debug Post",
      content: "Testing server-side instance injection",
      category: "General",
      image: "",
      author: "DebugUser",
      date: new Date().toISOString().split('T')[0],
      readtime: "2 min read",
      ishandpicked: 0
    };

    const result = await runRawTest(url, 'POST', payload);
    setCreatePostResult({ ...result, payloadUsed: payload });
  };

  const ResultBox = ({ result }) => {
    if (!result) return null;
    if (result.loading) return <div className="mt-2 text-sm text-gray-500">Running...</div>;
    return (
      <div className={`mt-3 p-3 rounded-md text-xs font-mono border ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
        <div>Status: {result.status}</div>
        {result.payloadUsed && <pre className="mt-2 bg-white/50 p-1">{JSON.stringify(result.payloadUsed, null, 2)}</pre>}
        <pre className="mt-2">{typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <SafeIcon icon={FiServer} className="mr-2" /> NCB Proxy Validator
        </h1>
        
        <div className="space-y-6">
          <div className="p-4 border border-purple-100 rounded-lg bg-purple-50/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Test Proxy Write</h4>
                <p className="text-sm text-gray-600">Verifying server-side Instance injection for 'create'</p>
              </div>
              <button 
                onClick={runCreatePostTest} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Run Write Test
              </button>
            </div>
            <ResultBox result={createPostResult} />
          </div>

          <div className="p-4 border border-gray-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">Connection Status</h4>
                <p className="text-sm text-gray-600">Checking read access via proxy</p>
              </div>
              <button onClick={checkStatus} className="text-purple-600 p-2 hover:bg-purple-50 rounded-full">
                <SafeIcon icon={FiRefreshCw} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            {status && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${status.canReadPosts ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NcbDebug;