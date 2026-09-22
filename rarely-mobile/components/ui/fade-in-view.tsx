import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, type ViewProps } from "react-native";
import { getMotionDistance, getMotionDuration } from "@/lib/ux/motion";

export type FadeInViewProps = ViewProps & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
};

export function FadeInView({ children, delay = 0, duration = 280, distance = 8, style, ...props }: FadeInViewProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
      progress.stopAnimation();
    };
  }, [progress]);

  useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: getMotionDuration(reduceMotion, duration),
      delay: reduceMotion ? 0 : delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, duration, progress, reduceMotion]);

  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [getMotionDistance(reduceMotion, distance), 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
