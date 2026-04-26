import React from 'react';
import WithdrawModal from './WithdrawModal';
import DepositModal from './DepositModal';
import TransferModal from './TransferModal';
import BuyPackageModal from './BuyPackageModal';
import IncomeToWalletModal from './IncomeToWalletModal';

// 🟢 FIX 1: Props se 'user' aur 'setUser' hata diya gaya hai
const Modals = ({ modalState, setModalState }) => {
  
  // Modal band karne ka function
  const closeModal = (modalName) => {
    setModalState((prev) => ({ ...prev, [modalName]: false }));
  };

  return (
    <>
      {/* 1. Withdraw Modal */}
      {modalState.withdraw && (
        <WithdrawModal 
          isOpen={modalState.withdraw} 
          onClose={() => closeModal('withdraw')} 
          // ❌ user={user} setUser={setUser} HATA DIYA
        />
      )}

      {/* 2. Deposit Modal */}
      {modalState.deposit && (
        <DepositModal 
          isOpen={modalState.deposit} 
          onClose={() => closeModal('deposit')} 
          // ✅ Ye ab seedha Context se data lega
        />
      )}

      {/* 3. P2P Wallet Transfer Modal */}
      {modalState.transfer && (
        <TransferModal 
          isOpen={modalState.transfer} 
          onClose={() => closeModal('transfer')} 
        />
      )}

      {/* 4. Buy Package Modal */}
      {modalState.buyPackage && (
        <BuyPackageModal 
          isOpen={modalState.buyPackage} 
          closeModal={() => closeModal('buyPackage')} 
        />
      )}

      {/* 5. Income to Main Wallet Modal */}
      {modalState.incomeToWallet && (
        <IncomeToWalletModal 
          isOpen={modalState.incomeToWallet} 
          onClose={() => closeModal('incomeToWallet')} 
        />
      )}
    </>
  );
};

export default Modals;