import { useState, useEffect, useRef } from "react";
import Aside from "@/components/aside";
import Footer from "@/components/footer";
import { BsPlusCircleDotted } from "react-icons/bs";
import { SiHomeadvisor } from "react-icons/si";
import { TbBellRinging } from "react-icons/tb";
import { HiMenu } from "react-icons/hi";
import { FaTag } from "react-icons/fa6";
import Router from "next/router";
import { parseCookies } from "nookies";
import { FaFileDownload } from "react-icons/fa";

const NotificationsMenu = ({ isOpen, onClose }: any) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const cookies = parseCookies();
      const token = cookies["8m.auth"];

      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          console.error("Dados de notificações inválidos", data);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 mt-2 w-64 bg-[#1f2227] text-white rounded-lg shadow-lg">
      <div className="p-4">
        <p className="font-semibold text-lg">Notificações</p>
        <ul className="space-y-1 mt-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="p-2 border-b border-gray-700">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm">{timeAgo(notification.timestamp)}</p>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-white text-lg"
      >
        ×
      </button>
    </div>
  );
};

type User = {
  id: string;
  username: string;
  avatar: string;
  email: string;
  banned: boolean;
  joinedAt: Date;
  role: "Membro" | "Dono";
};

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !tag) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    const cookies = parseCookies();
    const token = cookies["8m.auth"];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("authorId", user?.id || "");

    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Post criado com sucesso!");
        setTitle("");
        setDescription("");
        setTag("");
        setFile(null);
        window.location.reload();
      } else {
        console.error("Erro ao criar o post");
        alert("Erro ao criar o post.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Erro ao criar o post.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const fileName = selectedFile.name;
      const fileExtension = fileName
        .slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
        .toLowerCase();

      const allowedExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".txt",
        ".zip",
        ".rar",
        ".psd",
      ];

      if (!allowedExtensions.includes(`.${fileExtension}`)) {
        setError(
          "Tipo de arquivo não permitido. Tente novamente com um tipo compatível."
        );
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1f2227] text-white bg-opacity-50 z-50">
      <div className="relative bg-[#1f2227] p-6 rounded-lg shadow-lg max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-lg"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">Criar Novo Post</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#262d34] w-full p-2 border border-gray-600 outline-none rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#262d34] w-full p-2 border border-gray-600 outline-none rounded-md resize-none"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tag</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="bg-[#262d34] w-full p-2 border border-gray-600 outline-none rounded-md"
          >
            <option value="" disabled>
              Selecione a tag
            </option>
            <option value="anuncios">Anúncios</option>
            <option value="bots">Bots</option>
            <option value="metodos">Métodos</option>
            <option value="arquivos">Arquivos</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block">
            <span>Deseja enviar um arquivo?</span>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".png, .jpg, .jpeg, .txt, .zip .rar .psd"
              className="block w-full bg-[#262d34] rounded-[10px] text-sm text-gray-500
                file:me-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:disabled:opacity-50 file:disabled:pointer-events-none
                dark:text-neutral-500
                dark:file:bg-blue-500
                dark:hover:file:bg-blue-600"
            />
          </label>
          <p className="mt-1 text-sm text-white">ZIP, PSD, TXT, RAR</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-full bg-blue-600 text-white"
          >
            Postar
          </button>
        </div>
      </div>
    </div>
  );
};

function timeAgo(dateString: string): string {
  const now: Date = new Date();
  const date: Date = new Date(dateString);

  const seconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} segundos atrás`;
  const minutes: number = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutos atrás`;
  const hours: number = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} horas atrás`;
  const days: number = Math.floor(hours / 24);
  if (days < 30) return `${days} dias atrás`;
  const months: number = Math.floor(days / 30);
  if (months < 12) return `${months} meses atrás`;
  const years: number = Math.floor(months / 12);
  return `${years} anos atrás`;
}

export default function Anuncios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [posts, setPosts] = useState<
    Array<{
      id: number;
      title: string;
      tag: string;
      file: [
        {
          isImage: boolean;
          id: number;
          filename: string;
          postId: number;
          image?: string;
        }
      ];
      author: { username: string; avatar: string };
      timestamp: string;
      description: string;
    }>
  >([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        asideRef.current &&
        !asideRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setNotificationsOpen(false);
      }
    };

    if (isOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, notificationsOpen]);

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies["8m.auth"];

    if (!token) {
      Router.push("/");
    }

    const getSession = async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          Router.push('/')
        }

        setUser(data.user);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts?tag=arquivos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          console.error("Dados de posts inválidos", data);
        }
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#262d34]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-t-2 border-[#3498db] border-solid rounded-full animate-spin"></div>
          <span className="text-white text-lg">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center shadow-sm bg-[#262d34] font-[sans-serif] min-h-[70px]">
        <div className="flex flex-1 items-center justify-between px-4 py-3 md:px-10">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              <HiMenu className="w-7 h-7 text-white hover:cursor-pointer" />
            </button>
          </div>

          <div className="flex items-center flex-1 justify-center md:justify-start">
            <a className="flex items-center">
              <img
                src="../../logo.webp"
                alt="Logo"
                className="w-12 h-auto rounded-[10px]"
              />
              <span className="hidden md:block text-xl font-bold text-white ml-2">
                8M Vazamentos
              </span>
            </a>
          </div>

          <div className="flex-1 md:flex justify-center">
            <div className="rounded-[10px] bg-[#262d34] flex border-2 border-transparent focus-within:bg-[#1e252b] px-4 h-11 max-w-md w-full">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder=" Pesquisar"
                className="rounded-[10px] bg-[#1e252b] text-white w-full outline-none text-sm"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <TbBellRinging
              className="cursor-pointer text-white hover:text-[#077bff]"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              size={22}
            />
            <NotificationsMenu
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
            <BsPlusCircleDotted
              className="cursor-pointer text-white hover:text-[#077bff]"
              size={22}
              onClick={() => setIsModalOpen(true)}
            />
            <SiHomeadvisor
              className="cursor-pointer text-white hover:text-[#077bff]"
              size={22}
            />
            <div className="flex-shrink-0">
              <img
                src={user?.avatar}
                alt="Perfil do usuário"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <Aside ref={asideRef} open={isOpen} />
        <section className="flex-1 p-4 space-y-4">
          {filteredPosts.map((post) => (
            <div
              onClick={() => {
                Router.push(
                  `/forum/post/${post.id}?callbackUrl=${Router.pathname}`
                );
              }}
              key={post.id}
              className="bg-[#2a2e36] p-4 rounded-lg shadow-md hover:cursor-pointer"
            >
              <div className="flex items-center mb-3">
                <img
                  src={post.author.avatar}
                  alt="Foto do usuário"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white text-lg font-semibold">
                      {post.title}
                    </h3>
                    <span className="flex items-center text-white text-sm bg-[#3477db] p-[5px] rounded-full">
                      <FaTag className="w-4 h-4 mr-1" />
                      {post.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Iniciado por {post.author.username} -{" "}
                    {timeAgo(post.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-white text-sm">{post.description}</p>
              {post.file && post.file.length > 0 && (
                <div className="bg-[#1e2328] p-3 rounded-lg mt-4">
                  {post.file.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between mb-2"
                    >
                      <div>
                        <h4 className="text-white text-sm font-semibold mb-1">
                          {file.isImage ? "Imagem Postada" : "Arquivo Postado"}
                        </h4>
                        {file.isImage ? (
                          <img
                            src={file.image}
                            alt={file.filename}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <a
                            href={file.filename}
                            className="text-[#3498db] text-sm"
                          >
                            {file.filename}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
      <PostModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
