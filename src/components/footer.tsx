export default function Footer() {
  return (
    <footer className="border-t border-square-700 border-zinc-600 py-4 pb-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row justify-between gap-6 px-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:max-w-sm">
          <div className="flex items-center gap-2 rounded-full">
            <img
              src="../../logo.webp"
              alt="8m"
              className="h-12 rounded-[10px]"
            />
            <h1 className="text-xl font-semibold text-white">8M Vazamentos</h1>
          </div>

          <p className="text-gray-500 text-sm">
            &copy; 2024 8M Vazamentos. Todos os Direitos Reservados.
          </p>
        </div>

        <div className="max-xl:grid max-xl:grid-cols-2 max-xl:gap-6 lg:justify-center xl:flex xl:grid-cols-4 xl:gap-6">
          <div className="mt-6 lg:mt-0">
            <h2 className="text-md mb-4 font-semibold uppercase text-white">
              Parceiros
            </h2>
            <ul className="text-gray-400">
              <li className="mb-2">
                <a className="hover:underline" target="_self" href="https://discord.gg/8mvazamentos">
                  8M Community{" "}
                </a>
              </li>
              <li className="mb-2">
                <a
                  className="hover:underline"
                  target="_self"
                  href="https://discord.gg/8mvazamentos"
                >
                  8M Community{" "}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
