import { throttle } from 'lodash-es';

export function useReadingProgress() {
  const readingProgress = ref(0);
  const showBackToTop = ref(false);
  let scrollListener: () => void;

  const calculateProgress = () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    readingProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    showBackToTop.value = scrollTop > 500; // Show back to top button after scrolling down 500px
  };

  const throttledCalculateProgress = throttle(calculateProgress, 25);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  onMounted(() => {
    scrollListener = throttledCalculateProgress;
    window.addEventListener('scroll', scrollListener);
    calculateProgress(); // Initial calculation
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', scrollListener);
    throttledCalculateProgress.cancel();
  });

  return {
    readingProgress,
    showBackToTop,
    scrollToTop,
  };
}
