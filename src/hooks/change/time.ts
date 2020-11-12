import type { Ref } from 'vue';
import { ref } from 'vue';
import { Func } from '@/types/base/function';

export function useVerifyTime (currentTime = 0, startTime = 60, endTime = 0, duration = 1, down = true, cb: Func): [Ref<number>, Func] {
  const time = ref(currentTime);
  function reset (init = false) {
    if (!init) {
      time.value = startTime;
    }
    let timeId: ReturnType<typeof setInterval> | null = null;
    timeId = setInterval(() => {
      if (down) {
        if (time.value > endTime) {
          time.value -= duration;
          cb(String(time.value));
        } else {
          time.value = endTime;
          clearInterval(Number(timeId));
          timeId = null;
        }
      } else {
        if (time.value < endTime) {
          time.value += duration;
          cb(String(time.value));
        } else {
          time.value = endTime;
          clearInterval(Number(timeId));
          timeId = null;
        }
        timeId = null;
      }
    }, duration * 1000);
  }
  if (currentTime !== endTime) {
    reset(true);
  }
  return [time, reset];
}