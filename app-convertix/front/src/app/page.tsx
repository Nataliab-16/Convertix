"use client"
import React from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./stylelogin.css";
import Link from "next/link";
import { useForm } from "react-hook-form"
import { useClienteStore } from "@/context/clientes"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import InputSenha from '@/components/InputSenha';


type Inputs = {
  email: string
  senha: string
  manter: boolean
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<Inputs>()
  const { logaCliente } = useClienteStore()

  const router = useRouter()

  async function verificaLogin(data: Inputs) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/login`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ email: data.email, senha: data.senha })
    })

    if (response.status == 200) {
      const dados = await response.json()
      logaCliente(dados)
      if (data.manter) {
        localStorage.setItem("client_key", dados.id)
      } else {
        if (localStorage.getItem("client_key")) { localStorage.removeItem("client_key") }
      }
      toast.success("Logado com sucesso!");
      router.push("/home")
    } else if (response.status === 401 || response.status === 404) {
      toast.error("Email ou senha incorretos");
    } else {
      toast.error("Erro ao tentar logar. Tente novamente.");
    }
  } catch (error) {
    toast.error("Erro na conexão com o servidor.");
  }


}
return (
  <div>
    <Head>
      <title>Login - Convertix</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-5 pd-personalizada" style={{ backgroundColor: '#0C1421', color: 'white' }}>
        <div className="mb-4 d-flex flex-column align-items-center pd-personalizada">
          <img src="/branco_png.png" alt="Logo Convertix" style={{ width: '400px' }} />
          <p className="text-center fw-bold pb-4" style={{ fontSize: '2.0rem' }}>
            Conecte,<br />
            Converta <br />
            <span style={{ color: '#2BB673' }}>&</span> Cresça
          </p>
        </div>
      </div>

      <div className="col-md-6 bg-white d-flex flex-column justify-content-center align-items-center p-5">
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <h2 className="mb-4 text-dark fw-bold" style={{ fontSize: '2.5rem' }}>Login</h2>

          <form onSubmit={handleSubmit(verificaLogin)}>
            <div className="mb-3">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 ">E-mail</label>
              <input type="email" id="email" className="form-control rounded-0 border-0 border-bottom" placeholder="Digite o seu email" {...register("email")} required />
            </div>
            <div className="mb-4 position-relative">
              <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-700 ">Senha</label>
              <InputSenha register={register} name="senha" placeholder="Digite sua senha" />
            </div>
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="remember"  {...register("manter")} aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Lembre de mim</label>
                </div>
              </div>
              <Link href="/recuperasenha" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Esqueceu a senha?</Link>
            </div>
            <Link href={"/cadastro"}>
              <p className="pb-4 text-sm font-light text-gray-500 dark:text-gray-400">
                Ainda não tem conta? <span className='font-medium  text-primary-600 hover:underline'>Realize Cadastro</span>
              </p>
            </Link>
            <div className="text-start">
              <button type="submit" className="btn px-4 py-2" style={{ backgroundColor: '#2BB673', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                Acessar →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Toaster richColors position="top-right" />
  </div>
);
}