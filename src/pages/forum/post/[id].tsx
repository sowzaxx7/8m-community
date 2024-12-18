import Footer from "@/components/footer";
import { SiHomeadvisor } from "react-icons/si";
import { TbBellRinging } from "react-icons/tb";
import { FaFileDownload, FaArrowLeft, FaBan, FaTrash } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { FaTag } from "react-icons/fa6";
import { parseCookies } from "nookies";
import Router, { useRouter } from "next/router";

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
  posts: any;
  id: string;
  username: string;
  avatar: string;
  email: string;
  banned: boolean;
  joinedAt: Date;
  role: "Membro" | "Dono";
};

type File = {
  isImage: boolean;
  id: number;
  filename: string;
  postId: number;
  image?: string;
};

type Post = {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  tag: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    email: string;
    banned: boolean;
    joinedAt: string;
    role: string;
  };
  file?: File[];
};

export default function PostPage() {
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    const fetchPostData = async (postId: string) => {
      const cookies = parseCookies();
      const token = cookies["8m.auth"];

      if (!token) {
        Router.push("/");
        return;
      }

      try {
        const [postResponse, userResponse] = await Promise.all([
          fetch(`/api/posts/${postId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/users/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const postData = await postResponse.json();
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          Router.push('/')
        }

        setPost(postData.post);
        setAuthor(postData.author);
        setUser(userData.user);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      const postId = router.query.id as string;
      if (postId) {
        fetchPostData(postId);
      }
    }
  }, [router.isReady, router.query.id]);

  const handleBanUser = async () => {
    const cookies = parseCookies();
    const token = cookies["8m.auth"];

    if (!token) {
      Router.push("/");
      return;
    }

    try {
      const action = author?.banned ? "unban" : "ban";
      const response = await fetch(`/api/users/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: author?.id,
        }),
      });

      if (response.ok) {
        setAuthor((prevAuthor) =>
          prevAuthor ? { ...prevAuthor, banned: !prevAuthor.banned } : null
        );
      } else {
        console.error(
          `Erro ao ${action === "unban" ? "desbanir" : "banir"} o usuário`
        );
      }
    } catch (error) {
      console.error(`Erro ao fazer ação ao usuário:`, error);
    }
  };

  const handleDeletePost = async () => {
    const cookies = parseCookies();
    const token = cookies["8m.auth"];

    if (!token) {
      Router.push("/");
      return;
    }

    try {
      const response = await fetch(`/api/posts/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post?.id,
        }),
      });

      if (response.ok) {
        Router.push("/forum/anuncios");
      } else {
        console.error("Erro ao excluir o post");
      }
    } catch (error) {
      console.error("Erro ao fazer a exclusão do post:", error);
    }
  };

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
          <div className="flex items-center flex-1 justify-center md:justify-start">
            <a className="flex items-center mr-[130px]">
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

      <main className="flex flex-1 flex-col md:flex-row">
        <section className="w-full md:w-1/4 p-4">
          <div className="bg-[#2a2e36] p-4 rounded-lg shadow-md text-center">
            <div className="mb-4 flex items-center justify-between">
              <a
                href={Router.query.callbackUrl as string}
                className="flex items-center text-white hover:text-gray-400"
              >
                <FaArrowLeft size={20} className="mr-2" />
                <span>Voltar</span>
              </a>
              {user?.role === "Dono" && author && (
                <button
                  onClick={handleBanUser}
                  className={`text-white px-3 py-1 rounded flex items-center ${
                    author.banned
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <FaBan className="mr-1" />
                  {author.banned ? "Desbanir" : "Banir"}
                </button>
              )}
            </div>
            {author && (
              <>
                <img
                  src={author.avatar}
                  alt="Foto do usuário"
                  className="w-24 h-24 rounded-full mx-auto mb-3"
                />
                <h3 className="text-white text-lg font-semibold mb-1">
                  {author.username}
                </h3>
                <p className="text-gray-400 text-sm mb-1">
                  Posts: {author.posts.length}
                </p>
                <p className="text-gray-400 text-sm mb-1">
                  Juntou-se:{" "}
                  {new Date(author.joinedAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <span className="text-white text-sm bg-[#3477db] py-1 px-2 rounded-full font-bold">
                  {author.role.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </section>

        <section className="flex-1 p-4 space-y-4">
          {post ? (
            <div className="bg-[#2a2e36] p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                {author && (
                  <img
                    src={author.avatar}
                    alt="Foto do usuário"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white text-lg font-semibold">
                      {post.title}
                    </h3>
                    {user?.role === "Dono" && (
                      <button
                        onClick={handleDeletePost}
                        className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded flex items-center"
                      >
                        <FaTrash />
                      </button>
                    )}
                    <span className="flex items-center text-white text-sm bg-[#3477db] p-[5px] rounded-full">
                      <FaTag className="w-4 h-4 mr-1" />
                      {post.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Iniciado por {author?.username} - {timeAgo(post.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-white text-sm mb-2">{post.description}</p>
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
                      <a
                        href={`/uploads/${file.filename}`}
                        className="text-white text-sm py-1 px-3"
                        download
                      >
                        <FaFileDownload size={22} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-white">Nenhum post encontrado.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
