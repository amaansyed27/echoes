import React, { useState } from 'react';

interface LocationInputProps {
  onStart: (location: string) => void;
  error: string | null;
  disabled?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ onStart, error, disabled = false }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !disabled) {
      onStart(location.trim());
    }
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif">
        ECHOES
      </h1>
      <p className="text-white/70 mb-8 text-lg">
        Where will your journey begin?
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a city, monument, or landmark..."
            disabled={disabled}
            className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !location.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-amber-400 text-gray-900 font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            {disabled ? (
              <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
            ) : (
              'Begin'
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LocationInput;
