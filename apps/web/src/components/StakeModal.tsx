"use client";

interface StakeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isMiniPay: boolean;
}

export function StakeModal({ isOpen, onConfirm, onCancel, isMiniPay }: StakeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎮</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {isMiniPay ? 'Enter Tournament' : 'Stake Required'}
          </h2>

          {/* Message */}
          <p className="text-gray-300 mb-6 text-base">
            {isMiniPay
              ? 'Stake 1 cUSD to enter the daily tournament and compete for prizes!'
              : 'You need to stake 1 cUSD to play. Top 10 players win prizes!'
            }
          </p>

          {/* Prize Info */}
          <div className="bg-black/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-yellow-400 font-semibold mb-2 text-sm">Prize Distribution:</p>
            <div className="text-gray-400 text-xs space-y-1">
              <p>🥇 1st: 30% • 🥈 2nd: 20% • 🥉 3rd: 15%</p>
              <p>4th: 10% • 5th: 8% • 6th: 6%</p>
              <p>7th-10th: 1.5% each</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold transition-colors shadow-lg"
            >
              Stake 1 cUSD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
