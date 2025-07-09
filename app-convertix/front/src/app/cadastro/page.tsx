"use client";
import "../stylelogin.css";
import React from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import Link from "next/link";

type Inputs = {
  email: string
  senha: string
  nome: string
}

export default function CadastroPage() {
  const { register, handleSubmit } = useForm<Inputs>()
  const router = useRouter()

  async function verificaCadastro(data: Inputs) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ nome: data.nome, email: data.email, senha: data.senha })

    })
    const responseData = await response.json();
    if (response.status == 201) {
      toast.success("Registrado com sucesso")
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }

    function validaSenha(senha: string) {

      let mensa: boolean = true

      let pequenas = 0
      let grandes = 0
      let numeros = 0
      let simbolos = 0

      for (const letra of senha) {
        if ((/[a-z]/).test(letra)) {
          pequenas++
        }
        else if ((/[A-Z]/).test(letra)) {
          grandes++
        }
        else if ((/[0-9]/).test(letra)) {
          numeros++
        } else {
          simbolos++
        }
      }

      if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0 || senha.length < 8) {
        mensa = false
      }

      return mensa
    }
    if (validaSenha(data.senha) == false) {
      toast.warning("Senha deve conter 8 caracteres, letras minúsculas, maiúsculas, números e símbolos");
    }

    if (responseData.code === "P2002") { toast.warning("E-mail já cadastrado") }
  }
  return (
    <div>
      <Head>
        <title>Cadastro - Convertix</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container-fluid vh-100 d-flex p-0">
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-5" style={{ backgroundColor: '#0C1421', color: 'white' }}>
          <div className="mb-4 d-flex flex-column align-items-center pd-personalizada">
            <img src="/branco_png.png" alt="Logo Convertix" className="mb-3" style={{ width: '400px' }} />
            <p className="text-center fw-bold" style={{ fontSize: '2.0rem' }}>
              Conecte,<br />
              Converta <br />
              <span style={{ color: '#2BB673' }}>&</span> Cresça
            </p>
          </div>
        </div>

        <div className="col-md-6 bg-white d-flex flex-column justify-content-center align-items-center p-5">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4 text-dark fw-bold" style={{ fontSize: '2.5rem' }}>Cadastre-se</h2>

            <form onSubmit={handleSubmit(verificaCadastro)}>
              <div className="mb-4">
                <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-700 ">Nome completo</label>
                <input type="text" id="nome" className="form-control rounded-0 border-0 border-bottom" placeholder="Digite o seu nome" required {...register("nome")} />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 ">E-mail</label>
                <input type="email" id="email" className="form-control rounded-0 border-0 border-bottom" placeholder="Digite o seu e-mail" required {...register("email")} />
              </div>
        
              <div className="mb-4 position-relative">
                <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-700 ">Senha</label>
                <input type="password" id="senha" className="form-control rounded-0 border-0 border-bottom pe-5" placeholder="••••••••" required  {...register("senha")} />
                <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary pb-3" style={{ cursor: 'pointer' }}>
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                    <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </span>
              </div>
              <Link href={"/login"}>
                <p className="pb-4 text-sm font-light text-gray-500 dark:text-gray-400">
                  Já tem conta? <span className="font-medium  text-primary-600 hover:underline">Realize Login</span>
                </p>
              </Link>
              <div className="text-start">
                <button type="submit" className="btn px-4 py-2" style={{ backgroundColor: '#2BB673', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                  Cadastrar-se →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-center" expand={true} richColors />
    </div>
  );
}