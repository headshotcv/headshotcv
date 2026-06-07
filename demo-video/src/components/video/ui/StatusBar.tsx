import { Wifi } from 'lucide-react';

export function StatusBar({ dark = false, time = '14:36' }: { dark?: boolean; time?: string }) {
  const fg = dark ? '#ffffff' : '#0c0c0e';
  return (
    <div
      className="relative z-30 flex items-center justify-between px-[3.4vh] pt-[1.6vh] pb-[0.6vh]"
      style={{ color: fg, fontFamily: 'var(--font-body)' }}
    >
      <div className="text-[2.7vh] font-semibold tabular-nums tracking-tight">{time}</div>
      <div className="flex items-center gap-[1vh]">
        <div className="flex items-end gap-[0.3vh] h-[1.9vh]">
          {[0.45, 0.65, 0.85, 1].map((h, i) => (
            <div
              key={i}
              className="w-[0.7vh] rounded-[0.15vh]"
              style={{ height: `${h * 100}%`, background: fg }}
            />
          ))}
        </div>
        <Wifi className="w-[2.6vh] h-[2.6vh]" strokeWidth={2.6} />
        <div className="flex items-center gap-[0.3vh]">
          <div
            className="w-[3.4vh] h-[1.8vh] rounded-[0.4vh] border-[0.25vh] flex items-center p-[0.2vh]"
            style={{ borderColor: fg }}
          >
            <div className="h-full w-[72%] rounded-[0.2vh]" style={{ background: fg }} />
          </div>
          <div className="w-[0.3vh] h-[0.8vh] rounded-r" style={{ background: fg }} />
        </div>
      </div>
    </div>
  );
}
