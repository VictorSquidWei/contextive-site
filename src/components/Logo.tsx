interface LogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export function Logo({ className = '', size = 'sm' }: LogoProps) {
  const isLg = size === 'lg';
  return (
    <div className={`flex items-center ${isLg ? 'gap-2 sm:gap-2.5' : 'gap-2'} ${className}`}>
      <div
        className={`${isLg ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'} flex flex-col justify-center ${isLg ? 'gap-[3px] sm:gap-1' : 'gap-[3px]'}`}
      >
        <div className={`${isLg ? 'h-[2px] sm:h-[2.5px]' : 'h-[1.8px]'} w-full bg-current`}></div>
        <div className={`${isLg ? 'h-[2px] sm:h-[2.5px]' : 'h-[1.8px]'} w-2/3 bg-current`}></div>
      </div>
      <span
        className={`${isLg ? 'text-xl sm:text-2xl' : 'text-sm'} font-bold tracking-tight uppercase font-display`}
      >
        Contextive
      </span>
    </div>
  );
}
