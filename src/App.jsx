import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuestProvider } from '@questlabs/react-sdk';
import { BlogProvider } from './contexts/BlogContext';
import { AuthProvider } from './contexts/AuthContext';
import { ForumProvider } from './contexts/ForumContext';
import questConfig from './config/questConfig';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import CreatePost from './pages/CreatePost';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Onboarding from './pages/Onboarding';
import Admin from './pages/Admin';
import Forums from './pages/Forums';
import ForumCategory from './pages/ForumCategory';
import ForumThread from './pages/ForumThread';
import NewThread from './pages/NewThread';
import ProductRecommendations from './pages/ProductRecommendations';
import NcbDebug from './pages/NcbDebug';
import KdramaRecommendations from './pages/KdramaRecommendations';

// Legal Pages
import SafeSpacePromise from './pages/SafeSpacePromise';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <Router>
        <AuthProvider>
          <BlogProvider>
            <ForumProvider>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    
                    <Route path="/" element={<Home />} />
                    <Route path="/post/:id" element={<BlogPost />} />
                    <Route path="/create" element={<CreatePost />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/products" element={<ProductRecommendations />} />
                    <Route path="/kdrama-recommendations" element={<KdramaRecommendations />} />
                    
                    {/* Legal Routes */}
                    <Route path="/safe-space-promise" element={<SafeSpacePromise />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-and-conditions" element={<TermsConditions />} />

                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <Admin />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route path="/forums" element={<Forums />} />
                    <Route path="/forums/category/:categoryId" element={<ForumCategory />} />
                    <Route path="/forums/thread/:threadId" element={<ForumThread />} />
                    <Route path="/forums/new-thread" element={<NewThread />} />

                    {/* Admin Debug Route */}
                    <Route 
                      path="/debug/ncb" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <NcbDebug />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ForumProvider>
          </BlogProvider>
        </AuthProvider>
      </Router>
    </QuestProvider>
  );
}

export default App;