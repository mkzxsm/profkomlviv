import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Terminal } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Стани для пасхалки
  const [clickCount, setClickCount] = useState(0);
  const [isHacked, setIsHacked] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Текст, який буде виводитись у терміналі
  const hackSequence = [
    "root@lnu-profkom:~# init bypass --target=deans_office",
    "[*] Initializing secure connection to LNU servers...",
    "[*] Bypassing main firewall...",
    "[+] Access granted to internal network.",
    "root@lnu-profkom:~# cd /var/data/secret_scholarships",
    "[*] Downloading database...",
    "[!] ERROR: Unauthorized access detected by SysAdmin!",
    "[!] TRACE IN PROGRESS...",
    "root@lnu-profkom:~# rm -rf /logs && exit",
    "[*] Initiating emergency retreat to Home Page...",
  ];

  // Логіка кліків по 404
  const handleSecretClick = () => {
    if (isHacked) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      setIsHacked(true);
    }
  };

  useEffect(() => {
    if (!isHacked) return;

    let isMounted = true;

    const runHackSequence = async () => {
      // 1. Друкуємо рядки по черзі
      for (let i = 0; i < hackSequence.length; i++) {
        if (!isMounted) return;
        setTerminalLines((prev) => [...prev, hackSequence[i]]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (!isMounted) return;
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Перенаправляємо на головну
      if (isMounted) {
        navigate("/", { replace: true });
      }
    };

    runHackSequence();

    // Очищення: зупиняємо виконання, якщо користувач пішов зі сторінки до завершення
    return () => {
      isMounted = false;
    };
  }, [isHacked, navigate]);

  // Якщо активована пасхалка — показуємо екран терміналу
  if (isHacked) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-6 sm:p-10 flex flex-col w-full overflow-hidden">
        <div className="flex items-center gap-3 mb-6 opacity-70 border-b border-green-900 pb-4">
          <Terminal className="w-6 h-6" />
          <span className="text-sm">LNU_SECURE_SHELL_v2.4.1</span>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:text-base md:text-lg tracking-wide">
          {terminalLines.map((line, index) => (
            <div
              key={index}
              className={`${line.includes("ERROR") || line.includes("!") ? "text-red-500" : "text-green-500"} animate-fade-in-up`}
            >
              {line}
            </div>
          ))}
          {/* Мигаючий курсор */}
          <div className="w-3 h-5 bg-green-500 animate-pulse mt-1"></div>
        </div>
      </div>
    );
  }

  // Стандартна 404 сторінка
  return (
    <div className="min-h-screen bg-[#10183a] flex flex-col items-center justify-center relative overflow-hidden w-full transition-colors duration-500">
      {/* Фонововідблиски */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#1e3a8a]/40 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[70%] rounded-full bg-[#ca8a04]/15 blur-[130px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[90%] rounded-full bg-[#1e3a8a]/30 blur-[140px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full max-w-3xl">
        {/*<div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-8 backdrop-blur-sm border border-white/10 shadow-xl">
          <Search className="w-10 h-10 text-[#facc15]" />
        </div>
    /}        

        {/* Клікабельний текст 404 */}
        <h1
          onClick={handleSecretClick}
          className={`text-8xl md:text-9xl font-extrabold tracking-tighter drop-shadow-2xl mb-4 cursor-pointer select-none transition-all duration-200 ${
            clickCount > 0
              ? "text-[#facc15] scale-95"
              : "text-white hover:scale-105"
          }`}
          title="Hmm..."
        >
          404
        </h1>

        <div className="space-y-4 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#facc15] tracking-wide uppercase">
            Сторінку не знайдено
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
            Ой! Здається, ви перейшли за неправильним посиланням або сторінка
            була видалена. Давайте повернемося туди, де все працює.
          </p>
          {/* Легкий натяк на пасхалку */}
          {clickCount > 0 && clickCount < 5 && (
            <p className="text-sm text-white/40 animate-pulse">
              System destabilizing... ({5 - clickCount} clicks left)
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="group border border-white/30 bg-white/10 backdrop-blur-sm text-white py-3.5 px-8 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Крок назад
          </button>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="group bg-white text-[#1E2A5A] py-3.5 px-8 rounded-2xl font-bold hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300 shadow-[0_4px_12px_rgb(0,0,0,0.08)] flex items-center justify-center gap-2"
          >
            На головну
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-white/20 text-sm font-medium tracking-wide">
        ЛНУ ім. Івана Франка • Профком студентів
      </div>
    </div>
  );
};

export default NotFoundPage;
