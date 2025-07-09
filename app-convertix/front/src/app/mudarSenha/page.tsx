"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

type Inputs = {
    novaSenha: string;
    repeteSenha: string;
};

export default function mudarSenha() {
    const { register, handleSubmit, reset } = useForm<Inputs>();
    const [codigo, setCodigo] = useState("");
    const router = useRouter();

    async function novaSenha(data: Inputs) {
        

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

        if (validaSenha(data.novaSenha) == false) {
            toast.warning("Senha deve conter 8 caracteres, letras minúsculas, maiúsculas, números e símbolos");
        }          
        
        else if (data.novaSenha !== data.repeteSenha) {
            toast.warning("Senhas devem coincindirem");
        }

        else {
            try {
                const email = localStorage.getItem("email");
                const getClienteResponse = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes?email=${email}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            const cliente = await getClienteResponse.json();
            console.log(`clientes:`, cliente)
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${cliente.id}`, { 
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PATCH",
                body: JSON.stringify({
                    senha: data.novaSenha 
                })
            });
            
            if (response.status === 200) {
                toast.success("Senha alterada com sucesso");
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                toast.error("Erro ao atualizar a senha.");
            }
        } catch (error) {
            console.error("Erro ao buscar ou atualizar o cliente:", error);
            toast.error("Erro ao processar sua solicitação.");
        }
    }
}

    return (
        <section className="poppins-regular">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-base leading-tight  tracking-tight text-gray-900 md:text-2xl">
                        Insira sua nova senha abaixo =)
                        </h1>
                        <div className="space-y-4 md:space-y-6">
                                <form onSubmit={handleSubmit(novaSenha)}>
                                    <div>
                                        <label htmlFor="novaSenha" className="mt-5 block mb-2 text-sm font-medium text-gray-900">Nova senha</label>
                                        <input
                                            type="password"
                                            id="novaSenha"
                                            className=" bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Insira a sua nova senha"
                                            {...register("novaSenha")}
                                        />
                                        <label htmlFor="repetenovaSenha" className="mt-5 block mb-2 text-sm font-medium text-gray-900">Repita nova senha</label>
                                        <input
                                            type="password"
                                            id="repetenovaSenha"
                                            className=" bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Repita a sua senha"
                                            {...register("repeteSenha")}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full text-white bg-pinkm hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-6 text-center"
                                    >
                                        Salvar senha
                                    </button>
                                </form>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" expand={true} richColors />
        </section>
    );
}
