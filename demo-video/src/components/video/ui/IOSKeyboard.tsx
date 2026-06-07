import { ChevronUp, Delete, Globe, CornerDownLeft } from 'lucide-react';

const ROW1 = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW2 = ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'];
const ROW3 = ['w', 'x', 'c', 'v', 'b', 'n'];

export function IOSKeyboard({ activeKey = '' }: { activeKey?: string }) {
  const k = activeKey.toLowerCase();
  const Key = ({ ch }: { ch: string }) => {
    const pressed = ch === k;
    return (
      <div className="flex-1 mx-[0.35vh]">
        <div
          className={`flex items-center justify-center rounded-[0.7vh] h-[5.6vh] text-[3vh] transition-all duration-75 ${
            pressed ? 'bg-[#9a9da6] scale-90' : 'bg-white'
          }`}
          style={{ fontFamily: 'var(--font-body)', boxShadow: '0 0.2vh 0 rgba(0,0,0,0.28)' }}
        >
          {ch}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#d2d5db] px-[1vh] pt-[1.2vh] pb-[2.4vh] select-none">
      <div
        className="flex items-center justify-around pb-[1.4vh] text-[2.4vh] text-black/80"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <span>Je</span>
        <span>Tu</span>
        <span>C'est</span>
      </div>
      <div className="flex mb-[1vh]">{ROW1.map((c) => <Key key={c} ch={c} />)}</div>
      <div className="flex mb-[1vh] px-[2.6vh]">{ROW2.map((c) => <Key key={c} ch={c} />)}</div>
      <div className="flex mb-[1vh] items-stretch">
        <div className="w-[7vh] mx-[0.35vh] flex items-center justify-center rounded-[0.7vh] h-[5.6vh] bg-[#adb1ba]">
          <ChevronUp className="w-[3vh] h-[3vh]" strokeWidth={2.6} />
        </div>
        <div className="flex flex-1">{ROW3.map((c) => <Key key={c} ch={c} />)}</div>
        <div className="w-[7vh] mx-[0.35vh] flex items-center justify-center rounded-[0.7vh] h-[5.6vh] bg-[#adb1ba]">
          <Delete className="w-[3.2vh] h-[3.2vh]" strokeWidth={2.2} />
        </div>
      </div>
      <div className="flex items-stretch h-[5.6vh] gap-[0.7vh]">
        <div
          className="w-[8vh] flex items-center justify-center rounded-[0.7vh] bg-[#adb1ba] text-[2.2vh] font-medium"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          123
        </div>
        <div className="w-[6vh] flex items-center justify-center rounded-[0.7vh] bg-[#adb1ba]">
          <Globe className="w-[3vh] h-[3vh]" />
        </div>
        <div
          className="flex-1 flex items-center justify-center rounded-[0.7vh] bg-white text-[2.4vh] text-black/45"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          espace
        </div>
        <div className="w-[8vh] flex items-center justify-center rounded-[0.7vh] bg-[#adb1ba]">
          <CornerDownLeft className="w-[3vh] h-[3vh]" />
        </div>
      </div>
    </div>
  );
}
