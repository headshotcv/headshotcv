import { Lock, RotateCw } from 'lucide-react';

export function SafariBar() {
  return (
    <div className="px-[3vh] pb-[1.4vh] pt-[0.6vh] bg-[#eef0f3]">
      <div className="flex items-center gap-[1.4vh] bg-[#e3e4e8] rounded-[1.4vh] px-[2.4vh] py-[1.4vh]">
        <Lock className="w-[2.1vh] h-[2.1vh] text-[#86868b]" strokeWidth={2.6} />
        <span
          className="text-[2.3vh] text-[#3c3c43] font-medium"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          headshotcv.replit.app
        </span>
        <RotateCw className="w-[2.1vh] h-[2.1vh] text-[#86868b] ml-auto" strokeWidth={2.6} />
      </div>
    </div>
  );
}
