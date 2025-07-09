"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

type Inputs = {
    codigo: string;
    email: string;
};

export default function RecuperarSenha() {
    const { register, handleSubmit, reset } = useForm<Inputs>();
    const [statusCodigoGerado, setStatusCodigoGerado] = useState(false);
    const [codigo, setCodigo] = useState("");
    const router = useRouter();

    function gerarCodigo() {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let codigoGerado = "";
        for (let i = 0; i < 4; i++) {
            const indiceAleatorio = Math.floor(Math.random() * letras.length);
            codigoGerado += letras[indiceAleatorio];
        }
        setCodigo(codigoGerado);
        return codigoGerado;
    }

    async function enviarEmail(data: Inputs) {
        localStorage.setItem("email", data.email);
        const codigoGerado = gerarCodigo();
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/enviaemail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: data.email, codigo: codigoGerado }),
        });
        reset({ email: "", codigo: "" });
        if (res.ok) {
            toast.success("Código enviado para o e-mail!");
            setStatusCodigoGerado(true); 
        } else {
            toast.error("Erro ao enviar o código. Tente novamente.");
        }
    }

    async function recuperaSenha(data: Inputs) {
        if (codigo === data.codigo) {
            toast.success("Código verificado com sucesso");
            setTimeout(() => {
                router.push("/mudarSenha");
            }, 1000);
        } else {
            toast.warning("Código errado, insira o código que te enviamos por e-mail");
        }
    }

    return (
        <section className="poppins-regular">
            <div className="flex flex-col items-center bg-convertix-primary justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-base leading-tight p-8 tracking-tight text-gray-900 md:text-2xl">
                            Para recuperar a sua senha enviaremos um código para o e-mail cadastrado =)
                        </h1>
                        <div className="space-y-4 md:space-y-6">
                            {!statusCodigoGerado ? (
                                <form onSubmit={handleSubmit(enviarEmail)}>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">E-mail</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="my-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Digite o seu e-mail"
                                            {...register("email")}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full text-white bg-convertix-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                    >
                                        Enviar código
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit(recuperaSenha)}>
                                    <div>
                                        <label htmlFor="codigo" className="block mb-2 text-sm font-medium text-gray-900">Código</label>
                                        <input
                                            type="text"
                                            id="codigo"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Insira o código aqui"
                                            {...register("codigo")}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full text-white bg-convertix-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-6 text-center"
                                    >
                                        Verificar código
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" expand={true} richColors />
        </section>
    );
}
