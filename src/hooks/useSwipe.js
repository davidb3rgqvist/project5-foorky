import { useState, useEffect, useCallback } from "react";

export const useSwipe = (length) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(false);

  // Enable swipe functionality only for screens below 768px
  const updateIsSwipeEnabled = useCallback(() => {
    setIsSwipeEnabled(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Initialize swipe status on mount and add resize listener
    updateIsSwipeEnabled();
    window.addEventListener("resize", updateIsSwipeEnabled);

    return () => {
      window.removeEventListener("resize", updateIsSwipeEnabled);
    };
  }, [updateIsSwipeEnabled]);

  // Handle swipe functionality
  const handleSwipe = useCallback(
    (direction) => {
      if (!isSwipeEnabled) return; // Skip if swipe is disabled

      if (direction === "left" && activeIndex < length - 1) {
        setActiveIndex((prevIndex) => prevIndex + 1);
      } else if (direction === "right" && activeIndex > 0) {
        setActiveIndex((prevIndex) => prevIndex - 1);
      }
    },
    [activeIndex, length, isSwipeEnabled]
  );

  useEffect(() => {
    if (!isSwipeEnabled) return; // Disable swipe for larger screens

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) handleSwipe("left");
      if (touchEndX - touchStartX > 50) handleSwipe("right");
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleSwipe, isSwipeEnabled]);

  return { activeIndex, setActiveIndex, handleSwipe, isSwipeEnabled };
};
