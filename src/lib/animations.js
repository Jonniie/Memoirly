import { gsap } from "gsap";

// Fade in animation
export const fadeIn = (element, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration, ease: "power2.out" }
  );
};

// Slide in from bottom
export const slideUp = (element, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration, ease: "power2.out" }
  );
};

// Slide in from right
export const slideInRight = (element, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { x: 50, opacity: 0 },
    { x: 0, opacity: 1, duration, ease: "power2.out" }
  );
};

// Scale up animation
export const scaleUp = (element, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { scale: 0.9, opacity: 0 },
    { scale: 1, opacity: 1, duration, ease: "back.out(1.7)" }
  );
};

// Stagger children animation
export const staggerChildren = (parent, children, duration = 0.5) => {
  return gsap.fromTo(
    children,
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      stagger: 0.1,
      ease: "power2.out",
    }
  );
};

// Modal animations
export const modalEnter = (element, duration = 0.3) => {
  return gsap.fromTo(
    element,
    { scale: 0.9, opacity: 0 },
    { scale: 1, opacity: 1, duration, ease: "back.out(1.7)" }
  );
};

export const modalExit = (element, duration = 0.3) => {
  return gsap.to(element, {
    scale: 0.9,
    opacity: 0,
    duration,
    ease: "power2.in",
  });
};

// Page transition animations
export const pageEnter = (element, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration, ease: "power2.out" }
  );
};

export const pageExit = (element, duration = 0.5) => {
  return gsap.to(element, {
    opacity: 0,
    y: -20,
    duration,
    ease: "power2.in",
  });
};

// Grid item animations
export const gridItemEnter = (element, index, duration = 0.5) => {
  return gsap.fromTo(
    element,
    { scale: 0.8, opacity: 0, y: 20 },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration,
      delay: index * 0.1,
      ease: "back.out(1.7)",
    }
  );
};

// Filter animations
export const filterEnter = (element, duration = 0.3) => {
  return gsap.fromTo(
    element,
    { height: 0, opacity: 0 },
    { height: "auto", opacity: 1, duration, ease: "power2.out" }
  );
};

export const filterExit = (element, duration = 0.3) => {
  return gsap.to(element, {
    height: 0,
    opacity: 0,
    duration,
    ease: "power2.in",
  });
};
