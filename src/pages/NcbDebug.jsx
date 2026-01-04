import React, { useState, useEffect } from 'react';
import { getNcbStatus, ncbCreate, ncbDelete, ncbReadAll } from '../services/nocodebackendClient';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiRefreshCw, FiServer, FiGlobe, 
  FiDatabase, FiTrash2, FiPlus, FiEdit 
} = FiIcons;

const NcbDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [createPostResult, setCreatePostResult] = useState(null);
  const [createKdramaResult, setCreateKdramaResult] = useState(null);
  const [cleanupResult, setCleanupResult] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const result = await getNcbStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

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
      try { json = JSON.parse(text); } catch (e) { json = text; }
      return { success: res.ok, status: res.status, body: json };
    } catch (e) {
      return { success: false, status: 'NET_ERR', body: e.message };
    }
  };

  const runCreatePostTest = async () => {
    setCreatePostResult({ loading: true });
    const instance = status?.instance || '';
    const url = `/api/ncb/create/posts?Instance=${instance}`;
    
    // STANDARDIZED: Schema expects 'readtime'
    const payload = {
      title: "Debug Post",
      content: "Debug content",
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

  const runCreateKdramaTest = async () => {
    setCreateKdramaResult({ loading: true });
    const instance = status?.instance || '';
    const url = `/api/ncb/create/kdrama_recommendations?Instance=${instance}`;
    
    // STANDARDIZED: tags must be string
    const payload = {
      title: "Debug K-Drama",
      slug: `debug-kdrama-${Date.now()}`,
      tags: "Debug,Test", 
      synopsis_short: "Synopsis",
      image_url: "",
      image: ""
    };
    
    const result = await runRawTest(url, 'POST', payload);
    setCreateKdramaResult({ ...result, payloadUsed: payload });
  };

  const runCleanupTest = async () => {
    setCleanupResult({ loading: true });
    try {
      let deletedCount = 0;
      const cleanTable = async (table, filterFn) => {
        const records = await ncbReadAll(table, { limit: 100 });
        if (!Array.isArray(records)) return;
        const targets = records.filter(filterFn);
        for (const target of targets) {
          const success = await ncbDelete(table, target.id);
          if (success) deletedCount++;
        }
      };
      await cleanTable('posts', r => r.title === "Debug Post");
      await cleanTable('kdrama_recommendations', r => r.slug && r.slug.startsWith('debug-kdrama-'));
      setCleanupResult({ success: true, status: 200, body: { message: `Deleted ${deletedCount} records.` } });
    } catch (e) {
      setCleanupResult({ success: false, status: 'ERR', body: e.message });
    }
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
        <h1 className="text-2xl font-bold mb-6 flex items-center"><SafeIcon icon={FiServer} className="mr-2"/> NCB Schema Validator</h1>
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-bold">Test Create Post (readtime)</h4>
              <button onClick={runCreatePostTest} className="bg-purple-600 text-white px-4 py-1 rounded">Run</button>
            </div>
            <ResultBox result={createPostResult} />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-bold">Test Create K-Drama (tags as string)</h4>
              <button onClick={runCreateKdramaTest} className="bg-purple-600 text-white px-4 py-1 rounded">Run</button>
            </div>
            <ResultBox result={createKdramaResult} />
          </div>
          <button onClick={runCleanupTest} className="text-red-600 text-sm font-bold flex items-center"><SafeIcon icon={FiTrash2} className="mr-1"/> Cleanup Debug Records</button>
          <ResultBox result={cleanupResult} />
        </div>
      </div>
    </div>
  );
};

export default NcbDebug;