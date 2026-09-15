import { useEffect, useState } from "react";

const SPLASH_KEY = "mordomo.splashShown";

export default function MordomoSplash({ onFinish }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      sessionStorage.setItem(SPLASH_KEY, "true");
      onFinish?.();
      return;
    }

    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);

    if (alreadyShown) {
      onFinish?.();
      return;
    }

    setVisible(true);
  }, [onFinish]);

  const finish = () => {
    sessionStorage.setItem(SPLASH_KEY, "true");
    setFading(true);

    setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`mordomo-splash ${
        fading ? "mordomo-splash--fade" : ""
      }`}
    >
      <video
        className="mordomo-splash__video"
        src="/intro-desktop.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
      />
    </div>
  );
}