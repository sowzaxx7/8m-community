import { useEffect } from "react";
import Router from "next/router";

export default function Redirect() {

  useEffect(() => {
    Router.push('/forum/anuncios')
  }, []);

  return <main></main>;
}
