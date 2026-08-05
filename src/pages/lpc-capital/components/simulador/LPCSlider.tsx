interface LPCSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}

export function LPCSlider({ min, max, step, value, onChange, ariaLabel }: LPCSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={ariaLabel}
      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#c99900]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00325b] focus-visible:ring-offset-2
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c99900]
        [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
        [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.4)] [&::-webkit-slider-thumb]:transition-transform
        [&::-webkit-slider-thumb]:hover:scale-110
        [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-[#c99900] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
        [&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
      style={{
        background: `linear-gradient(to right, #00325b ${pct}%, #e2e6ea ${pct}%)`,
      }}
    />
  );
}
