"use client"
import React from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../stylelogin.css";
import Link from "next/link";
import { useForm } from "react-hook-form"
import { useClienteStore } from "@/context/clientes"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"


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
      router.push("/")
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
                <input type="email" className="form-control rounded-0 border-0 border-bottom" placeholder="Email" />
              </div>
              <div className="mb-4 position-relative">
                <input type="password" className="form-control rounded-0 border-0 border-bottom pe-5" placeholder="Senha" />
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
    </div>
  );
}