import { forwardRef } from "react";
import Router from "next/router";
import { FaRobot, FaCogs, FaBell, FaFile } from "react-icons/fa";

const Aside = forwardRef<HTMLDivElement, { open: boolean }>((props, ref) => {
  const { open } = props;

  return (
    <aside
      ref={ref}
      className={`${
        open ? "absolute left-0 top-[-5px] z-50 w-[250px] h-screen" : "hidden"
      } md:block md:ml-[10px] md:z-0 md:w-[250px] md:h-[600px] bg-[#000000] rounded-[10px] my-4 p-4`}
    >
      <ul className="text-white space-y-4">
        <li
          onClick={() => {
            Router.push("/forum/anuncios");
          }}
          className="hover:bg-[#2b3843] rounded-[10px] cursor-pointer flex items-center gap-2 p-2 transition-all duration-300"
        >
          <FaBell size={22} className="text-[#3477db]" />
          Anúncios
        </li>
      </ul>

      <h2 className="text-[#475961] text-[14px] mb-2 mt-4">TAGS</h2>

      <ul className="text-white space-y-4">
        <li
          onClick={() => {
            Router.push("/forum/tags/bots");
          }}
          className="hover:bg-[#2b3843] rounded-[10px] cursor-pointer flex items-center gap-2 p-2 transition-all duration-300"
        >
          <FaRobot size={22} className="text-[#3477db]" />
          Bots
        </li>
        <li
          onClick={() => {
            Router.push("/forum/tags/metodos");
          }}
          className="hover:bg-[#2b3843] rounded-[10px] cursor-pointer flex items-center gap-2 p-2 transition-all duration-300"
        >
          <FaCogs size={22} className="text-[#3477db]" />
          Métodos
        </li>
        <li
          onClick={() => {
            Router.push("/forum/tags/arquivos");
          }}
          className="hover:bg-[#2b3843] rounded-[10px] cursor-pointer flex items-center gap-2 p-2 transition-all duration-300"
        >
          <FaFile size={22} className="text-[#3477db]" />
          Arquivos
        </li>
      </ul>
    </aside>
  );
});

Aside.displayName = "Aside";

export default Aside;
