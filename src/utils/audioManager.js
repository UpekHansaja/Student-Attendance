// Audio management utilities for sound effects

// Create audio instance for attendance success sound
let attendanceSuccessAudio = null;

// Initialize audio
export const initializeAudio = () => {
  try {
    attendanceSuccessAudio = new Audio('/audio/IcloudPurchaseSound.mp3');
    attendanceSuccessAudio.preload = 'auto';
    attendanceSuccessAudio.volume = 0.7; // Set volume to 70%
    console.log('Audio initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing audio:', error);
    return false;
  }
};

// Play attendance success sound
export const playAttendanceSuccessSound = () => {
  try {
    if (attendanceSuccessAudio) {
      // Reset audio to beginning
      attendanceSuccessAudio.currentTime = 0;
      
      // Play the sound
      const playPromise = attendanceSuccessAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Attendance success sound played');
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            // Audio might be blocked by browser autoplay policy
            // This is normal and not a critical error
          });
      }
    } else {
      // Initialize audio if not already done
      if (initializeAudio()) {
        playAttendanceSuccessSound();
      }
    }
  } catch (error) {
    console.error('Error playing attendance success sound:', error);
  }
};

// Set audio volume (0.0 to 1.0)
export const setAudioVolume = (volume) => {
  if (attendanceSuccessAudio) {
    attendanceSuccessAudio.volume = Math.max(0, Math.min(1, volume));
  }
};

// Check if audio is supported
export const isAudioSupported = () => {
  return typeof Audio !== 'undefined';
};
