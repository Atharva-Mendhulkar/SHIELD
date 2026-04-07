import React, { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { ShieldBadge } from './components/ShieldBadge';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TransferScreen } from './screens/TransferScreen';
import { OTPScreen } from './screens/OTPScreen';
import { FreezeModal } from './screens/FreezeModal';
import { motion, AnimatePresence } from 'framer-motion';

interface BankingAppProps {
  onTransactionStart?: () => void;
  isAccountFrozen?: boolean;
  onLogout?: () => void;
}

export const BankingAppContainer: React.FC<BankingAppProps> = ({
  onTransactionStart,
  isAccountFrozen = false,
  onLogout
}) => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'dashboard' | 'transfer' | 'otp'>('login');
  const [showFreeze, setShowFreeze] = useState(false);

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleStartTransfer = () => {
    setCurrentScreen('transfer');
  };

  const handleConfirmTransfer = () => {
    onTransactionStart?.();
    setCurrentScreen('otp');
  };

  const handleOTPComplete = () => {
    if (isAccountFrozen) {
      setShowFreeze(true);
    }
  };

  if (isAccountFrozen && showFreeze) {
    return <FreezeModal onLogout={onLogout} />;
  }

  return (
    <PhoneFrame>
      <div className="relative h-full flex flex-col">
        <ShieldBadge status={isAccountFrozen ? 'blocked' : 'active'} />

        <AnimatePresence mode="wait">
          {currentScreen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LoginScreen onLogin={handleLogin} />
            </motion.div>
          )}

          {currentScreen === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DashboardScreen onTransfer={handleStartTransfer} />
            </motion.div>
          )}

          {currentScreen === 'transfer' && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TransferScreen
                onBack={() => setCurrentScreen('dashboard')}
                onConfirm={handleConfirmTransfer}
              />
            </motion.div>
          )}

          {currentScreen === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onAnimationComplete={handleOTPComplete}
            >
              <OTPScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
};

export default BankingAppContainer;
