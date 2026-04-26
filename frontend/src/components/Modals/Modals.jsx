import React from 'react';
import WithdrawModal from './WithdrawModal';
import DepositModal from './DepositModal';
import TransferModal from './TransferModal';
import BuyPackageModal from './BuyPackageModal';
import IncomeToWalletModal from './IncomeToWalletModal'; // 🟢 Naya Import

const Modals = ({ user, setUser, modalState, setModalState }) => {
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
          user={user} 
          setUser={setUser} 
        />
      )}

      {/* 2. Deposit Modal */}
      {modalState.deposit && (
        <DepositModal 
          isOpen={modalState.deposit} 
          onClose={() => closeModal('deposit')} 
          user={user} 
          setUser={setUser} 
        />
      )}

      {/* 3. P2P Wallet Transfer Modal */}
      {modalState.transfer && (
        <TransferModal 
          isOpen={modalState.transfer} 
          onClose={() => closeModal('transfer')} 
          user={user} 
          setUser={setUser} 
        />
      )}

      {/* 4. Buy Package Modal */}
      {modalState.buyPackage && (
        <BuyPackageModal 
          isOpen={modalState.buyPackage} 
          closeModal={() => closeModal('buyPackage')} 
          user={user} 
          setUser={setUser} 
        />
      )}

      {/* 🟢 5. Income to Main Wallet Modal (Naya Add Kiya) */}
      {modalState.incomeToWallet && (
        <IncomeToWalletModal 
          isOpen={modalState.incomeToWallet} 
          onClose={() => closeModal('incomeToWallet')} 
          user={user} 
          setUser={setUser} 
        />
      )}
    </>
  );
};

export default Modals;