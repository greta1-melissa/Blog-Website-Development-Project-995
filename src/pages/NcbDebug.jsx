import React, { useState, useEffect } from 'react';
import { getNcbStatus, ncbCreate, ncbDelete, ncbReadAll } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiXCircle, FiRefreshCw, FiServer, FiGlobe, FiDatabase, FiAlertTriangle, FiCloudLightning } = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [writeTestStatus, setWriteTestStatus] = useState(null);
  const [writeError, setWriteError] = useState('');
  const [proxyTestResult, setProxyTestResult] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setWriteTestStatus(null);
    setProxyTestResult(null);
    const result = await getNcbStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const runProxyTest = async () => {
    setProxyTestResult({ status: 'loading', message: 'Testing proxy via /api/ncb...' });
    try {
      // Direct call to read 1 record from 'kdrama_recommendations'
      const data = await ncbReadAll('kdrama_recommendations', { limit: 1 });
      if (Array.isArray(data)) {
        setProxyTestResult({ status: 'success', message: `Success! Read ${data.length} records. Proxy is working.` });
      } else {
        throw new Error('Response was not an array');
      }
    } catch (e) {
      setProxyTestResult({ status: 'error', message: `Proxy Test Failed: ${e.message}` });
    }
  };

  const runWriteTest = async () => {
    setWriteTestStatus('testing');
    setWriteError('');
    try {
      const timestamp = Date.now();

      // 1. Test Posts Table
      // Ensure all potential required fields (like slug, dates) are present
      const postPayload = {
        title: "Debug Post",
        slug: `debug-post-${timestamp}`,
        content: "Debug content",
        status: "draft",
        image_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Testing Posts Create with:', postPayload);
      const createdPost = await ncbCreate('posts', postPayload);

      if (!createdPost) throw new Error("Posts: No response from create");
      const postId = createdPost.id || createdPost._id;
      if (!postId) throw new Error(`Posts: Created item has no ID. Response: ${JSON.stringify(createdPost)}`);
      
      console.log('Posts Create Success, ID:', postId);
      await ncbDelete('posts', postId);
      console.log('Posts Delete Success');

      // 2. Test Kdrama Table
      // Ensure unique slug and required fields
      const kdramaPayload = {
        title: "Debug Drama",
        slug: `debug-drama-${timestamp}`,
        synopsis_short: "Debug synopsis",
        image_url: "",
        tags: ["Debug"], 
        is_featured_on_home: false,
        display_order: 9999,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Testing Kdrama Create with:', kdramaPayload);
      const createdDrama = await ncbCreate('kdrama_recommendations', kdramaPayload);

      if (!createdDrama) throw new Error("Kdrama: No response from create");
      const dramaId = createdDrama.id || createdDrama._id;
      if (!dramaId) throw new Error(`Kdrama: Created item has no ID. Response: ${JSON.stringify(createdDrama)}`);

      console.log('Kdrama Create Success, ID:', dramaId);
      await ncbDelete('kdrama_recommendations', dramaId);
      console.log('Kdrama Delete Success');

      setWriteTestStatus('success');
    } catch (err) {
      console.error('Write Test Failed:', err);
      setWriteTestStatus('error');
      setWriteError(err.message);
    }
  };

  const StatusItem = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center text-gray-600 font-medium">
        {Icon && <SafeIcon icon={Icon} className="mr-2 text-gray-400" />}
        {label}
      </div>
      <div className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
        {value}
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
              <h1 className="text-xl font-bold">NCB Proxy Debug</h1>
              <p className="text-purple-100 text-xs">Secure Connection Check</p>
            </div>
          </div>
          <button onClick={checkStatus} disabled={loading} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
            <SafeIcon icon={FiRefreshCw} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="p-6">
          {status ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Proxy Configuration</h3>
                <div className="bg-white border border-gray-200 rounded-lg px-4">
                  <StatusItem label="Client URL" value={status.baseUrl} icon={FiGlobe} />
                  <StatusItem label="Instance ID" value={status.instance || 'Missing'} icon={FiDatabase} />
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-600 font-medium flex items-center"><SafeIcon icon={FiCheckCircle} className="mr-2 text-green-500"/> Connection</span>
                    <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Connection Tests</h3>
                
                {/* Proxy Read Test */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium flex items-center">
                      <SafeIcon icon={FiCloudLightning} className="mr-2 text-blue-500" />
                      Proxy Read (K-Dramas)
                    </span>
                    <button onClick={runProxyTest} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200">
                      Run Test
                    </button>
                  </div>
                  {proxyTestResult && (
                    <div className={`mt-2 text-sm p-3 rounded-lg ${proxyTestResult.status === 'success' ? 'bg-green-50 text-green-800' : proxyTestResult.status === 'loading' ? 'bg-gray-50 text-gray-600' : 'bg-red-50 text-red-800'}`}>
                      {proxyTestResult.message}
                    </div>
                  )}
                </div>

                {/* Write Test */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium flex items-center">
                      <SafeIcon icon={FiDatabase} className="mr-2 text-purple-500" />
                      Proxy Write (Create/Delete)
                    </span>
                    <button onClick={runWriteTest} disabled={writeTestStatus === 'testing'} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200">
                      {writeTestStatus === 'testing' ? 'Testing...' : 'Run Test'}
                    </button>
                  </div>
                  {writeTestStatus && (
                    <div className={`mt-2 text-sm p-3 rounded-lg ${writeTestStatus === 'success' ? 'bg-green-50 text-green-800' : writeTestStatus === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                      {writeTestStatus === 'success' ? 'Write test passed (Posts & Kdramas Created/Deleted).' : writeError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">Failed to load status.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NcbDebug;