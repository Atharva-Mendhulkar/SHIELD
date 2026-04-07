import { useState, useEffect } from 'react';
import axios from 'axios';
import { BankingApp } from '../components/BankingApp';

const BACKEND_URL = 'http://localhost:8000';

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[700px] w-[340px] shadow-xl">
    <div className="w-[148px] h-[18px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-20"></div>
    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
    <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-slate-950">
      {children}
    </div>
  </div>
);

export const BankingAppPage = () => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const userId = 1;

  // Poll for account status (frozen) every 2 seconds
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/score/${sessionId}`);
        if (res.data.action === 'BLOCK_AND_FREEZE') {
          setIsFrozen(true);
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleTransactionStart = async () => {
    // Start session if not already started
    if (!sessionId) {
      try {
        const res = await axios.post(`${BACKEND_URL}/session/start`, {
          user_id: userId,
          session_type: 'legitimate'
        });
        setSessionId(res.data.session_id);
      } catch (e) {
        console.error("Failed to start session", e);
      }
    }
  };

  const handleLogout = () => {
    setSessionId(null);
    setIsFrozen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-100">INDRA BANK</h1>
        <p className="text-slate-500 text-sm">Secure Mobile Banking Experience</p>
      </div>
      
      <PhoneFrame>
        <BankingApp 
          onTransactionStart={handleTransactionStart}
          isAccountFrozen={isFrozen}
          onLogout={handleLogout}
        />
      </PhoneFrame>
    </div>
  );
};

export default BankingAppPage;
