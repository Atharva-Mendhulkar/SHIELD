import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="relative w-full max-w-sm bg-slate-950 rounded-[3rem] shadow-2xl border-8 border-slate-900" style={{aspectRatio: '9/20'}}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-3xl z-50"></div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800 rounded-full"></div>

        {/* Screen content */}
        <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
