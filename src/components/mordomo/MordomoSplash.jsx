import { useEffect, useState } from "react";

const SPLASH_KEY = "mordomo.splashShown";

export default function MordomoSplash({ onFinish }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mobile: não exibe o Splash
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      sessionStorage.setItem(SPLASH_KEY, "true");
      onFinish?.();
      return;
    }

    // Desktop: verifica se o Splash já foi exibido nesta sessão
    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);

    if (alreadyShown) {
      onFinish?.();
      return;
    }

    setVisible(true);
  }, [onFinish]);

  const finish = () => {
    sessionStorage.setItem(SPLASH_KEY, "true");

    // Pequeno fade antes de sair
    setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div className="mordomo-splash">
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