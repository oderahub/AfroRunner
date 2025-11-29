"use client";

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export function NotificationModal({
  isOpen,
  title,
  message,
  type = 'info',
  onClose
}: NotificationModalProps) {
  if (!isOpen) return null;

  const colors = {
    success: { border: 'border-green-500', bg: 'bg-green-500', icon: '✓' },
    error: { border: 'border-red-500', bg: 'bg-red-500', icon: '✕' },
    info: { border: 'border-blue-500', bg: 'bg-blue-500', icon: 'ℹ' },
    warning: { border: 'border-yellow-500', bg: 'bg-yellow-500', icon: '⚠' },
  };

  const color = colors[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-gradient-to-b from-gray-900 to-black border-2 ${color.border} rounded-lg p-8 max-w-md mx-4 shadow-2xl`}>
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            <div className={`mx-auto w-16 h-16 ${color.bg} rounded-full flex items-center justify-center`}>
              <span className="text-3xl text-white">{color.icon}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-300 mb-6 text-sm whitespace-pre-line">
            {message}
          </p>

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 ${color.bg} hover:opacity-90 text-white rounded-lg font-bold transition-opacity`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
