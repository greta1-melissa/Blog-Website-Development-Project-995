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
    const [kdramaStatus, setKdramaStatus] = useState({ checked: false, exists: false, count: 0, error: '' });

    const checkStatus = async () => {
        setLoading(true);
        setWriteTestStatus(null);
        setWriteError('');
        
        const result = await getNcbStatus();
        setStatus(result);

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
            const testPayload = {
                title: "NCB Debug Test Post",
                content: "This is a temporary post to test write permissions.",
                category: "Debug",
                status: "draft"
            };
            const createdPost = await ncbCreate('posts', testPayload);
            
            if (!createdPost || !createdPost.id) {
                const responseSnippet = JSON.stringify(createdPost || {}).substring(0, 200);
                throw new Error(`Write Failed: Could not read ID from NCB response. Response: ${responseSnippet}`);
            }
            
            await ncbDelete('posts', createdPost.id);
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
                    <span className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded text-right truncate max-w-[200px] sm:max-w-xs">
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
                    <button onClick={checkStatus} disabled={loading} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-50">
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
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Configuration</h3>
                                <div className="bg-white border border-gray-200 rounded-lg px-4">
                                    <StatusItem label="API URL" value={status.url} icon={FiGlobe} />
                                    <StatusItem label="Instance ID" value={status.maskedInstance} icon={FiDatabase} />
                                    <StatusItem label="API Key" value={status.maskedKey} icon={FiKey} />
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Table Status</h3>
                                <div className="space-y-3">
                                    <div className={`border rounded-lg p-4 ${status.canReadPosts ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex justify-between items-center font-bold text-gray-700">
                                            <span>`posts` table</span>
                                            <span>{status.canReadPosts ? 'Readable' : 'Failed'}</span>
                                        </div>
                                    </div>
                                    <div className={`border rounded-lg p-4 ${kdramaStatus.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                         <div className="flex justify-between items-center font-bold text-gray-700">
                                            <span>`kdrama_recommendations` table</span>
                                            <span>{kdramaStatus.exists ? 'Readable' : 'Failed'}</span>
                                        </div>
                                        {kdramaStatus.error && <p className="text-xs text-red-600 mt-2">{kdramaStatus.error}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Write Test</h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600 font-medium">Write Permission (Posts)</span>
                                        <button onClick={runWriteTest} disabled={writeTestStatus === 'testing'} className="px-3 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                            {writeTestStatus === 'testing' ? 'Testing...' : 'Run Test'}
                                        </button>
                                    </div>
                                    {writeTestStatus && (
                                        <div className={`p-3 rounded-lg border ${
                                            writeTestStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                            writeTestStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                            'bg-blue-50 border-blue-200 text-blue-800'
                                        }`}>
                                            <div className="flex items-start">
                                                <SafeIcon icon={writeTestStatus === 'success' ? FiCheckCircle : FiAlertTriangle} className="mr-2 mt-0.5" />
                                                <div className="text-sm font-mono break-all">
                                                    {writeTestStatus === 'success' ? 'Write test successful. Created and deleted a temporary post.' : writeError}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-500 py-8">Failed to load status.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NcbDebug;