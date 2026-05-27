export default function ScrollProgress() {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-100 pointer-events-none"
      aria-hidden="true"
      style={{
        background: "#2563eb",
        transformOrigin: "left",
        transform: "scaleX(0)",
        animationTimeline: "scroll(root block)",
        animationName: "scroll-progress",
        animationTimingFunction: "linear",
        animationFillMode: "both",
      }}
    />
  );
}
