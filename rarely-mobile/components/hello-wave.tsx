import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function HelloWave() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 },
    );
    animation.start();

    return () => {
      animation.stop();
      rotate.stopAnimation();
      rotate.setValue(0);
    };
  }, [rotate]);

  const rotateDeg = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-25deg", "0deg", "25deg"],
  });

  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        transform: [{ rotate: rotateDeg }],
      }}
    >
      👋
    </Animated.Text>
  );
}
