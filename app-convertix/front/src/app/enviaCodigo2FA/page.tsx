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
    const router = useRouter();

    async function enviarEmail(data: Inputs) {
        localStorage.setItem("email", data.email); // armazena para reuso
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/email/verificar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }), // só envia o email
            });

            if (res.ok) {
                toast.success("Código enviado para o e-mail!");
                setStatusCodigoGerado(true);
            } else {
                toast.error("Erro ao enviar o código. Tente novamente.");
            }
        } catch (err) {
            toast.error(err + "Erro de rede ao tentar enviar o código.");
        }

        reset();
    }

    async function verificaCodigo(data: Inputs) {
        const email = localStorage.getItem("email");
        const codigo = data.codigo
        if (!email) {
            toast.error("E-mail não encontrado. Volte e insira novamente.");
            setStatusCodigoGerado(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/email/verificar-codigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, codigo }),
            });

            if (res.ok) {
                toast.success("Código verificado com sucesso!");
                setTimeout(() => router.push("/home"), 1000);
            } else {
                toast.warning("Código incorreto ou expirado.");
            }
        } catch (err) {
            toast.error(err + "Erro ao validar o código.");
        }

        reset({ codigo: "" });
    }

    return (
        <section className="poppins-regular">
            <div className="flex flex-col items-center bg-convertix-primary justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                        <div className="space-y-4 md:space-y-6">
                            {!statusCodigoGerado ? (
                                <div>
                                    <h1 className="text-base leading-tight py-8 tracking-tight text-gray-900 md:text-2xl">
                                        Enviaremos um código para o e-mail cadastrado 
                                    </h1>
                                    <form onSubmit={handleSubmit(enviarEmail)}>
                                        <div>
                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                                E-mail
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="my-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                placeholder="Digite o seu e-mail"
                                                {...register("email")}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full text-white bg-convertix-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        >
                                            Enviar código
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-base leading-tight py-8 tracking-tight text-gray-900 md:text-2xl">
                                        Digite o código no campo abaixo
                                    </h1>
                                    <form onSubmit={handleSubmit(verificaCodigo)}>
                                        <div>
                                            <label htmlFor="codigo" className="block mb-2 text-sm font-medium text-gray-900">
                                                Código
                                            </label>
                                            <input
                                                type="text"
                                                id="codigo"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                placeholder="Insira o código aqui"
                                                {...register("codigo")}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full text-white bg-convertix-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-6 text-center"
                                        >
                                            Verificar código
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" expand={true} richColors />
        </section>
    );
}
