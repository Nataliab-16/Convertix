"use client";
import { useState } from "react";

interface InputSenhaProps {
  register: any;
  name: string;
  placeholder?: string;
}

export default function InputSenha({ register, name, placeholder }: InputSenhaProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="position-relative">
      <input
        type={mostrarSenha ? "text" : "password"}
        className="form-control rounded-0 border-0 border-bottom pe-5"
        placeholder={placeholder || "Senha"}
        {...register(name)}
      />

      <span
        className="position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary pb-1"
        style={{ cursor: "pointer" }}
        onClick={() => setMostrarSenha((prev) => !prev)}
      >
        {mostrarSenha ? (
          // Ocultar senha
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        ) : (
          // Mostrar senha
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
            />
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </span>
    </div>
  );
}
