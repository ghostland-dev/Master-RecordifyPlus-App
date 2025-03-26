
// This adds the missing cursor type to the MediaTrackConstraints
interface MediaTrackConstraints {
  cursor?: string;
}

// Make DisplayCaptureSurfaceType available since it's used in our TypeScript code
type DisplayCaptureSurfaceType = 'monitor' | 'window' | 'browser' | 'application';
