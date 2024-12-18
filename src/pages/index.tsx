import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";
import { FaDiscord, FaUser } from "react-icons/fa";
import { IoChatbubbleSharp } from "react-icons/io5";
import Router from "next/router";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        asideRef.current &&
        !asideRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <main className="bg-[#1e252b] h-screen flex flex-col">
      <header className="flex items-center shadow-sm bg-[#262d34] font-[sans-serif] min-h-[80px]">
        <div className="flex flex-1 items-center justify-between px-6 py-4 md:px-12">

          <div className="flex items-center flex-1 justify-center md:justify-start">
            <a className="flex items-center">
              <img
                src="../../logo.webp"
                alt="Logo"
                className="w-16 h-auto rounded-[12px]"
              />
              <span className="md:block text-2xl font-bold text-white ml-3">
                8M Vazamentos
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                Router.push(
                  'https://discord.com/oauth2/authorize?client_id=1285629837670617222&response_type=code&redirect_uri=https%3A%2F%2Fsowzaxv1-teste.vercel.app%2Fapi%2Fauth%2Fdiscord%2Fcallback&scope=email+identify'
                );
              }}
              className="flex items-center text-white rounded-full border border-zinc-600 px-6 py-3 text-lg hover:bg-white hover:text-[#262d34] transition-colors"
            >
              <FaUser className="w-6 h-6 mr-3" />
              Login
            </button>
          </div>
        </div>
      </header>
      <section className="text-center mt-12 flex-grow flex flex-col justify-center mb-12">
        <h1 className="text-5xl text-white font-bold">
          Bem-vindo à <span className="text-blue-600">8M Vazamentos</span>
        </h1>
        <p className="text-2xl text-gray-400 mt-6">
          Aqui você aprende, compartilha experiências e encontra métodos, bots, arquivos e ferramentas que fortalecem a nossa comunidade.
        </p>
        <div className="flex justify-center space-x-6 mt-8">
          <button
            onClick={() => {
              Router.push('/forum/anuncios');
            }}
            className="flex items-center border border-zinc-600 text-white text-lg px-8 py-3 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105"
          >
            <IoChatbubbleSharp className="w-6 h-6 mr-3" />
            Ver Fóruns
          </button>
          <a
            href="https://discord.gg/8mvazamentos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center border border-zinc-600 text-white text-lg px-8 py-3 rounded-full hover:bg-[#5b6eae] transition-transform transform hover:scale-105"
          >
            <FaDiscord className="w-6 h-6 mr-3" />
            Ir para Servidor
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
