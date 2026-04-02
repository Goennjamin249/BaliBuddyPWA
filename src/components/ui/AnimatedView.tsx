import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type AnimationType = "fadeIn" | "slideUp" | "scaleIn" | "none";

interface AnimatedViewProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  style?: ViewStyle;
  className?: string;
}

export function AnimatedView({
  children,
  animation = "fadeIn",
  delay = 0,
  style,
  className,
}: AnimatedViewProps) {
  const opacity = useSharedValue(animation === "none" ? 1 : 0);
  const scale = useSharedValue(animation === "scaleIn" ? 0.9 : 1);
  const translateY = useSharedValue(animation === "slideUp" ? 20 : 0);

  useEffect(() => {
    if (animation === "none") {
      opacity.value = 1;
      return;
    }

    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      if (animation === "scaleIn") {
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      }
      if (animation === "slideUp") {
        translateY.value = withTiming(0, { duration: 300 });
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [animation, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
}

// Pre-configured animation variants
export function FadeInView({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <AnimatedView animation="fadeIn" delay={delay} style={style}>
      {children}
    </AnimatedView>
  );
}

export function SlideUpView({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <AnimatedView animation="slideUp" delay={delay} style={style}>
      {children}
    </AnimatedView>
  );
}

export function ScaleInView({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <AnimatedView animation="scaleIn" delay={delay} style={style}>
      {children}
    </AnimatedView>
  );
}
