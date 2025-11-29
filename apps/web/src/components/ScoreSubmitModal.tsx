"use client";

interface ScoreSubmitModalProps {
  isOpen: boolean;
  score: number;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ScoreSubmitModal({ isOpen, score, onConfirm, onCancel, isSubmitting = false }: ScoreSubmitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-green-500 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Game Over!
          </h2>

          {/* Score */}
          <div className="bg-black/50 rounded-lg p-6 mb-6">
            <p className="text-gray-400 text-sm mb-2">Your Score</p>
            <p className="text-5xl font-bold text-green-400">{score.toLocaleString()}</p>
          </div>

          {/* Message */}
          <p className="text-gray-300 mb-6 text-base">
            Submit your score to the blockchain leaderboard and compete for daily prizes!
          </p>

          {/* Leaderboard Info */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-green-400 font-semibold mb-2 text-sm">🎯 Compete for Top 10:</p>
            <div className="text-gray-400 text-xs space-y-1">
              <p>Daily prizes distributed at midnight WAT</p>
              <p>Your best score counts!</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-700 disabled:cursor-not-allowed text-black rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                'Submit to Leaderboard'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
