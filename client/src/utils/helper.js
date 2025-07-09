export function areStreamsEqual(a, b) {
  if (!a || !b) return false;
  const aTracks = a.getTracks();
  const bTracks = b.getTracks();
  if (aTracks.length !== bTracks.length) return false;
  return aTracks.every((track, i) => track.id === bTracks[i].id);
}
