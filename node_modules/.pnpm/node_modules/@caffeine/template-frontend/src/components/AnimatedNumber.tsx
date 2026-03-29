import { useCurrency } from "@/hooks/useCurrency";
import { useMotionValue, useSpring, useTransform, motion } from "motion/react";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  compact?: boolean;
  className?: string;
}

export function AnimatedNumber({
  value,
  compact = true,
  className,
}: AnimatedNumberProps) {
  const { formatCurrency } = useCurrency();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 200,
    mass: 1,
  });
  const display = useTransform(springValue, (latest) =>
    formatCurrency(Math.round(latest), compact),
  );

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
