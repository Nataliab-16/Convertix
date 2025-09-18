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
import Image from 'next/image';

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
      toast.success("Dados corretos!");
      router.push("/enviaCodigo2FA")
    } else if (response.status === 401 || response.status === 404) {
      toast.error("Email ou senha incorretos");
    } else {
      toast.error("Erro ao tentar logar. Tente novamente.");
    }
  } catch (error) {
    toast.error(error + "Erro na conexão com o servidor.");
  }


}
return (
  <div>
    <Head>
      <title>Login - Convertix</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div className="container-fluid min-vh-100 d-flex flex-wrap p-0">
        {/* Lado esquerdo */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center p-5 text-white" style={{ backgroundColor: '#0C1421' }}>
          <div className="text-center mb-4 d-flex flex-column align-items-center pd-personalizada">
            <Image src="/branco_png.png" alt="Logo Convertix" className="img-fluid mb-3" width={300} height={50} />
            <p className="fw-bold text-center" style={{ fontSize: '1.8rem' }}>
              Conecte,<br />
              Converta <br />
              <span style={{ color: '#2BB673' }}>&</span> Cresça
            </p>
          </div>
        </div>

        {/* Lado direito */}
        <div className="col-12 col-md-6 bg-white d-flex flex-column justify-content-center align-items-center p-4">
          <div className="w-100 pt-4 pd-personalizada" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4 text-dark fw-bold text-center text-md-start" style={{ fontSize: '2rem' }}>Login</h2>

            <form onSubmit={handleSubmit(verificaLogin)}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input type="email" id="email" className="form-control rounded-0 border-0 border-bottom pe-5" placeholder="Digite seu e-mail" {...register("email")} required />
              </div>

              <div className="mb-4 position-relative">
                <label htmlFor="senha" className="form-label">Senha</label>
                <InputSenha<Inputs> register={register} name="senha" placeholder="Digite sua senha" />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input type="checkbox" id="remember" {...register("manter")} className="form-check-input" />
                  <label htmlFor="remember" className="form-check-label text-secondary">Lembre de mim</label>
                </div>
                <Link href="/recuperasenha" className="text-sm text-primary fw-semibold text-decoration-none">
                  Esqueceu a senha?
                </Link>
              </div>

              <Link href="/cadastro" className="d-block mb-3 text-center text-sm text-secondary">
                Ainda não tem conta? <span className="text-success fw-semibold">Realize Cadastro</span>
              </Link>

              <div className="text-start">
                <button type="submit" className="btn w-100" style={{ backgroundColor: '#2BB673', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                  Acessar →
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