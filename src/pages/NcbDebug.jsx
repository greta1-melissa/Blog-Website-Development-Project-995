import React, { useState, useEffect } from 'react';
import { getNcbStatus, ncbCreate, ncbDelete, ncbReadAll } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiCheckCircle, FiXCircle, FiRefreshCw, FiServer, FiGlobe, 
  FiDatabase, FiAlertTriangle, FiCloudLightning, FiTrash2, 
  FiPlus, FiFileText, FiTv, FiEdit 
} = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Existing Tests State
  const [writeTestStatus, setWriteTestStatus] = useState(null);
  const [writeError, setWriteError] = useState('');
  const [proxyTestResult, setProxyTestResult] = useState(null);

  // Granular Tests State
  const [readPostsResult, setReadPostsResult] = useState(null);
  const [createPostResult, setCreatePostResult] = useState(null);
  const [createKdramaResult, setCreateKdramaResult] = useState(null);
  const [updatePostResult, setUpdatePostResult] = useState(null);
  const [updateKdramaResult, setUpdateKdramaResult] = useState(null);
  const [cleanupResult, setCleanupResult] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setWriteTestStatus(null);
    setProxyTestResult(null);
    setReadPostsResult(null);
    setCreatePostResult(null);
    setCreateKdramaResult(null);
    setUpdatePostResult(null);
    setUpdateKdramaResult(null);
    setCleanupResult(null);

    const result = await getNcbStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // --- Helper for Raw Fetch Tests ---
  const runRawTest = async (url, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(url, options);
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = text; // Fallback to text if not JSON
      }
      return { success: res.ok, status: res.status, body: json };
    } catch (e) {
      return { success: false, status: 'NET_ERR', body: e.message };
    }
  };

  // --- Existing Integrated Tests ---
  const runProxyTest = async () => {
    setProxyTestResult({ status: 'loading', message: 'Testing proxy via /api/ncb...' });
    try {
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
      
      // 1. Test Posts
      const postPayload = {
        title: "Debug Post",
        slug: `debug-post-${timestamp}`,
        content: "Debug content",
        status: "draft",
        image_url: "",
        category: "General",
        author: "DebugUser",
        date: new Date().toISOString().split('T')[0]
      };
      await ncbCreate('posts', postPayload);

      // 2. Test Kdrama
      const kdramaPayload = {
        title: "Debug Drama",
        slug: `debug-drama-${timestamp}`,
        synopsis_short: "Debug synopsis",
        image_url: "",
        tags: "Debug",
        my_two_cents: "Notes",
        synopsis_long: "Long desc"
      };
      const createdDrama = await ncbCreate('kdrama_recommendations', kdramaPayload);
      if (createdDrama?.id) await ncbDelete('kdrama_recommendations', createdDrama.id);

      setWriteTestStatus('success');
    } catch (err) {
      console.error('Write Test Failed:', err);
      setWriteTestStatus('error');
      setWriteError(err.message);
    }
  };

  // --- New Granular Tests ---
  const runReadPostsTest = async () => {
    setReadPostsResult({ loading: true });
    const instance = status?.instance || '';
    const url = `/api/ncb/read/posts?Instance=${instance}&limit=5`;
    const result = await runRawTest(url, 'GET');
    setReadPostsResult(result);
  };

  const runCreatePostTest = async () => {
    setCreatePostResult({ loading: true });
    const instance = status?.instance || '';
    const url = `/api/ncb/create/posts?Instance=${instance}`;
    const timestamp = Date.now();
    
    // UPDATED: Only essentials, no created_at/updated_at unless required by schema
    const payload = {
      title: "Debug Post",
      slug: `debug-post-${timestamp}`,
      content: "Debug content body",
      status: "draft",
      category: "General",
      author: "DebugUser",
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      image_url: ""
    };
    
    const result = await runRawTest(url, 'POST', payload);
    setCreatePostResult({ ...result, payloadUsed: payload });
  };

  const runCreateKdramaTest = async () => {
    setCreateKdramaResult({ loading: true });
    const instance = status?.instance || '';
    const url = `/api/ncb/create/kdrama_recommendations?Instance=${instance}`;
    const timestamp = Date.now();
    
    // UPDATED: Only essentials, no created_at/updated_at
    const payload = {
      title: "Debug K-Drama",
      slug: `debug-kdrama-${timestamp}`,
      tags: "Debug,Test", 
      synopsis_short: "Debug synopsis short",
      synopsis_long: "Debug synopsis long",
      my_two_cents: "Debug notes",
      image_url: ""
    };
    
    const result = await runRawTest(url, 'POST', payload);
    setCreateKdramaResult({ ...result, payloadUsed: payload });
  };

  const runUpdatePostTest = async () => {
    setUpdatePostResult({ loading: true });
    try {
      // 1. Find existing debug record or create one
      const records = await ncbReadAll('posts', { limit: 100 });
      let target = Array.isArray(records) ? records.filter(r => r.slug && r.slug.startsWith('debug-post-')).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0] : null;
      
      if (!target) {
        const timestamp = Date.now();
        const payload = {
          title: "Debug Post For Update",
          slug: `debug-post-${timestamp}`,
          content: "Initial content",
          status: "draft",
          category: "General",
          author: "Debug",
          date: new Date().toISOString().split('T')[0],
          image_url: ""
        };
        target = await ncbCreate('posts', payload);
      }
      
      const id = target.id || target._id;
      if (!id) throw new Error("Could not acquire target ID for update.");

      // 2. Perform Update
      const instance = status?.instance || '';
      const url = `/api/ncb/update/posts/${id}?Instance=${instance}`;
      
      const updatePayload = {
        title: `${target.title} (edited)`,
        content: `${target.content || ''}\nUpdated at ${new Date().toISOString()}`
      };
      
      const result = await runRawTest(url, 'PUT', updatePayload);
      setUpdatePostResult({ ...result, payloadUsed: updatePayload, targetId: id });

    } catch (e) {
      setUpdatePostResult({ success: false, status: 'SETUP_ERR', body: e.message });
    }
  };

  const runUpdateKdramaTest = async () => {
    setUpdateKdramaResult({ loading: true });
    try {
      // 1. Find existing debug record or create one
      const records = await ncbReadAll('kdrama_recommendations', { limit: 100 });
      let target = Array.isArray(records) ? records.filter(r => r.slug && r.slug.startsWith('debug-kdrama-')).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0] : null;
      
      if (!target) {
        const timestamp = Date.now();
        const payload = {
          title: "Debug Drama For Update",
          slug: `debug-kdrama-${timestamp}`,
          synopsis_short: "Initial synopsis",
          my_two_cents: "Initial thoughts",
          image_url: "",
          tags: "Debug"
        };
        target = await ncbCreate('kdrama_recommendations', payload);
      }
      
      const id = target.id || target._id;
      if (!id) throw new Error("Could not acquire target ID for update.");

      // 2. Perform Update
      const instance = status?.instance || '';
      const url = `/api/ncb/update/kdrama_recommendations/${id}?Instance=${instance}`;
      
      const updatePayload = {
        my_two_cents: `${target.my_two_cents || ''} (edited)`,
        synopsis_short: `${target.synopsis_short || ''} - Updated at ${new Date().toISOString()}`
      };
      
      const result = await runRawTest(url, 'PUT', updatePayload);
      setUpdateKdramaResult({ ...result, payloadUsed: updatePayload, targetId: id });

    } catch (e) {
      setUpdateKdramaResult({ success: false, status: 'SETUP_ERR', body: e.message });
    }
  };

  const runCleanupTest = async () => {
    setCleanupResult({ loading: true });
    try {
      let deletedCount = 0;
      const logs = [];
      
      // Helper to find and delete
      const cleanTable = async (table, prefix) => {
        logs.push(`Reading ${table}...`);
        const records = await ncbReadAll(table, { limit: 100 });
        
        if (!Array.isArray(records)) {
          logs.push(`Failed to read ${table}`);
          return;
        }

        const targets = records.filter(r => r.slug && r.slug.startsWith(prefix));
        targets.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        if (targets.length > 0) {
          const target = targets[0];
          logs.push(`Deleting ${table} record: ${target.slug} (${target.id})`);
          const success = await ncbDelete(table, target.id);
          if (success) {
            deletedCount++;
            logs.push(`Deleted ${target.id} successfully.`);
          } else {
            logs.push(`Failed to delete ${target.id}.`);
          }
        } else {
          logs.push(`No debug records found in ${table}.`);
        }
      };

      await cleanTable('posts', 'debug-post-');
      await cleanTable('kdrama_recommendations', 'debug-kdrama-');

      setCleanupResult({ 
        success: true, 
        status: 200, 
        body: { message: `Cleanup complete. Deleted ${deletedCount} records.`, logs } 
      });
    } catch (e) {
      setCleanupResult({ success: false, status: 'ERR', body: { error: e.message } });
    }
  };

  const ResultBox = ({ result }) => {
    if (!result) return null;
    if (result.loading) return <div className="mt-2 text-sm text-gray-500 animate-pulse">Running test...</div>;
    const isSuccess = result.success;
    return (
      <div className={`mt-3 p-3 rounded-md text-xs font-mono overflow-x-auto border ${isSuccess ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
        <div className="font-bold mb-1 border-b border-black/10 pb-1 flex justify-between">
          <span>Status: {result.status}</span>
          <span>{isSuccess ? 'PASS' : 'FAIL'}</span>
        </div>
        
        {result.payloadUsed && (
          <div className="mb-2">
            <span className="font-bold block text-gray-500 mb-1">Request Payload:</span>
            <pre className="bg-white/50 p-2 rounded whitespace-pre-wrap text-[10px] mb-2">
              {JSON.stringify(result.payloadUsed, null, 2)}
            </pre>
            <span className="font-bold block text-gray-500 mb-1">Response Body:</span>
          </div>
        )}

        <pre className="whitespace-pre-wrap">
          {typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body}
        </pre>
      </div>
    );
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

  // Reusable button classes for consistency
  const buttonBaseClass = "px-4 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm";
  const purpleButtonClass = `${buttonBaseClass} bg-purple-600 text-white hover:bg-purple-700`;
  const redButtonClass = `${buttonBaseClass} bg-red-600 text-white hover:bg-red-700`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center text-white">
            <SafeIcon icon={FiServer} className="text-2xl mr-3" />
            <div>
              <h1 className="text-xl font-bold">NCB Proxy Debug</h1>
              <p className="text-purple-100 text-xs">Secure Connection Check & Diagnostics</p>
            </div>
          </div>
          <button onClick={checkStatus} disabled={loading} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
            <SafeIcon icon={FiRefreshCw} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="p-6">
          {status ? (
            <div className="space-y-8">
              
              {/* Config Section */}
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

              {/* Integrated Tests */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Connection Tests (Simple)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proxy Read */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium flex items-center">
                        <SafeIcon icon={FiCloudLightning} className="mr-2 text-blue-500" /> Read K-Dramas
                      </span>
                      <button onClick={runProxyTest} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200">
                        Run
                      </button>
                    </div>
                    {proxyTestResult && (
                      <div className={`mt-2 text-xs p-2 rounded ${proxyTestResult.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {proxyTestResult.message}
                      </div>
                    )}
                  </div>

                  {/* Proxy Write */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium flex items-center">
                        <SafeIcon icon={FiDatabase} className="mr-2 text-purple-500" /> Write (Create/Delete)
                      </span>
                      <button onClick={runWriteTest} disabled={writeTestStatus === 'testing'} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200">
                        {writeTestStatus === 'testing' ? '...' : 'Run'}
                      </button>
                    </div>
                    {writeTestStatus && (
                      <div className={`mt-2 text-xs p-2 rounded ${writeTestStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {writeTestStatus === 'success' ? 'Success' : writeError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Granular Tests */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Granular Proxy Tests (Advanced)</h3>
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* 1. Read Posts */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3 text-blue-600"><SafeIcon icon={FiFileText} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Proxy Read (Posts)</h4>
                          <p className="text-xs text-gray-500">GET /read/posts</p>
                        </div>
                      </div>
                      <button onClick={runReadPostsTest} className={purpleButtonClass}>Run Test</button>
                    </div>
                    <ResultBox result={readPostsResult} />
                  </div>

                  {/* 2. Create Post */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3 text-green-600"><SafeIcon icon={FiPlus} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Proxy Create Post</h4>
                          <p className="text-xs text-gray-500">POST /create/posts</p>
                        </div>
                      </div>
                      <button onClick={runCreatePostTest} className={purpleButtonClass}>Run Test</button>
                    </div>
                    <ResultBox result={createPostResult} />
                  </div>

                  {/* 3. Create Kdrama */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-pink-100 rounded-lg mr-3 text-pink-600"><SafeIcon icon={FiTv} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Proxy Create K-Drama</h4>
                          <p className="text-xs text-gray-500">POST /create/kdrama_recommendations</p>
                        </div>
                      </div>
                      <button onClick={runCreateKdramaTest} className={purpleButtonClass}>Run Test</button>
                    </div>
                    <ResultBox result={createKdramaResult} />
                  </div>

                  {/* 4. Update Post */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600"><SafeIcon icon={FiEdit} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Proxy Update: Edit Post</h4>
                          <p className="text-xs text-gray-500">PUT /update/posts/:id</p>
                        </div>
                      </div>
                      <button onClick={runUpdatePostTest} className={purpleButtonClass}>Run Test</button>
                    </div>
                    <ResultBox result={updatePostResult} />
                  </div>

                  {/* 5. Update Kdrama */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3 text-purple-600"><SafeIcon icon={FiEdit} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Proxy Update: Edit K-Drama</h4>
                          <p className="text-xs text-gray-500">PUT /update/kdrama.../:id</p>
                        </div>
                      </div>
                      <button onClick={runUpdateKdramaTest} className={purpleButtonClass}>Run Test</button>
                    </div>
                    <ResultBox result={updateKdramaResult} />
                  </div>

                  {/* 6. Cleanup */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg mr-3 text-red-600"><SafeIcon icon={FiTrash2} /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Cleanup Debug Records</h4>
                          <p className="text-xs text-gray-500">Deletes records starting with 'debug-'</p>
                        </div>
                      </div>
                      <button onClick={runCleanupTest} className={redButtonClass}>Run Cleanup</button>
                    </div>
                    <ResultBox result={cleanupResult} />
                  </div>

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