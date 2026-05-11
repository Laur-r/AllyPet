import { useState, useEffect } from "react";
import { getMe } from "../services/user.service";

export function useCurrentUser() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        // Actualiza el localStorage también para que quede sincronizado
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        // Si falla, igual usa lo que hay en localStorage
      });

    const handleUpdate = () => {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    window.addEventListener("userUpdated", handleUpdate);
    return () => window.removeEventListener("userUpdated", handleUpdate);
  }, []);

  return { user, setUser };
}