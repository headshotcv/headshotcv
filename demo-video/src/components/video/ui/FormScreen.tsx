import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Cursor } from './Cursor';

type Field = { label: string; value: string; placeholder: string; active: boolean };

export function FormScreen({
  title,
  subtitle,
  fields,
  passer = false,
  suivantPressed = false,
}: {
  title: string;
  subtitle: string;
  fields: Field[];
  passer?: boolean;
  suivantPressed?: boolean;
}) {
  return (
    <div className="flex-1 px-[3vh] pt-[2.4vh] flex flex-col">
      <motion.div
        className="bg-white rounded-[2.4vh] px-[3.2vh] py-[3.4vh] shadow-[0_2vh_5vh_rgba(0,0,0,0.06)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="text-[4.4vh] leading-[1.1] font-semibold text-[#1c1f26]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <p
          className="text-[2.5vh] text-[#8a8f9a] mt-[1.4vh]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {subtitle}
        </p>

        {fields.map((f, i) => (
          <div key={i} className="mt-[3vh]">
            <div
              className="text-[2.4vh] font-semibold text-[#3a3f4a] mb-[1.1vh]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {f.label}
            </div>
            <div
              className={`rounded-[1.4vh] border-[0.3vh] px-[2.2vh] h-[6.4vh] flex items-center text-[2.8vh] ${
                f.active ? 'border-[#2563eb] bg-[#f7f9ff]' : 'border-[#e4e6ea] bg-white'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {f.value ? (
                <span className="text-[#1c1f26]">{f.value}</span>
              ) : (
                !f.active && <span className="text-[#a7abb4]">{f.placeholder}</span>
              )}
              {f.active && <Cursor />}
            </div>
          </div>
        ))}

        <div className="flex items-center mt-[4vh]">
          <div
            className="flex items-center gap-[1vh] text-[#8a8f9a] text-[2.5vh] font-medium"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-[2.6vh] h-[2.6vh]" strokeWidth={2.4} /> Retour
          </div>
          <div className="flex-1" />
          {passer && (
            <div
              className="text-[#8a8f9a] text-[2.5vh] font-medium mr-[2.4vh]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Passer
            </div>
          )}
          <motion.div
            className="flex items-center gap-[1vh] text-white text-[2.6vh] font-semibold rounded-[1.4vh] px-[2.8vh] py-[1.6vh]"
            style={{ fontFamily: 'var(--font-body)', background: suivantPressed ? '#1d4fd0' : '#2563eb' }}
            animate={{ scale: suivantPressed ? 0.94 : 1 }}
            transition={{ duration: 0.12 }}
          >
            Suivant <ArrowRight className="w-[2.6vh] h-[2.6vh]" strokeWidth={2.6} />
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center justify-between px-[1vh] mt-[2.2vh]">
        <div className="flex gap-[3vh] text-[#a0a4ad]">
          <ChevronUp className="w-[3.4vh] h-[3.4vh]" />
          <ChevronDown className="w-[3.4vh] h-[3.4vh]" />
        </div>
        <Check className="w-[3.4vh] h-[3.4vh] text-[#1c1f26]" />
      </div>
    </div>
  );
}
