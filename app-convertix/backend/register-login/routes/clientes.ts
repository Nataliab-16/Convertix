import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  const email = req.query.email;
  if (typeof email !== 'string' || !email) {
    return res.status(400).json({ error: "Email deve ser uma string válida." });
  }
  try {
    const cliente = await prisma.cliente.findFirst({ where: { email: email } })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json(error)
  }
})

function validaSenha(senha: string) {

  const mensa: string[] = []

  // .length: retorna o tamanho da string (da senha)
  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  // contadores
  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  // senha = "abc123"
  // letra = "a"

  // percorre as letras da variável senha
  for (const letra of senha) {
    // expressão regular
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

  if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
    mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos")
  }

  return mensa
}

router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: "Informe nome, email e senha" })
    return
  }

  const erros = validaSenha(senha)
  if (erros.length > 0) {
    res.status(400).json({ erro: erros.join("; ") })
    return
  }

  // 12 é o número de voltas (repetições) que o algoritmo faz
  // para gerar o salt (sal/tempero)
  const salt = bcrypt.genSaltSync(12)
  // gera o hash da senha acrescida do salt
  const hash = bcrypt.hashSync(senha, salt)

  // para o campo senha, atribui o hash gerado
  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, senha: hash }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/login", async (req, res) => {
  const { email, senha } = req.body

  // em termos de segurança, o recomendado é exibir uma mensagem padrão
  // a fim de evitar de dar "dicas" sobre o processo de login para hackers
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    // res.status(400).json({ erro: "Informe e-mail e senha do usuário" })
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    })

    if (cliente == null) {
      // res.status(400).json({ erro: "E-mail inválido" })
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // se o e-mail existe, faz-se a comparação dos hashs
    if (bcrypt.compareSync(senha, cliente.senha)) {

      res.status(200).json({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      })
    } else {
      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { senha } = req.body

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(senha, salt)

  try {
    const cliente = await prisma.cliente.update({
      where: { id: String(id) },
      data: { senha: hash }
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json(error)
  }
})



async function enviaEmail(nome: string, email: string, codigo: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "7e9a59001@smtp-brevo.com",
      pass: "pjnRDJNTMxAavfOH",
    },
  });


  const info = await transporter.sendMail({
    from: 'nataliabrandao688@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Re: Recuperação da senha", // Subject line
    text: codigo, // plain text body
    html: `<h3>Estimado Cliente: ${nome}</h3>
          <h3>Aqui está seu código de recuperação: ${codigo}</h3>
          <p>Morgana Moda Feminina</p>`

  });
}


router.post("/enviaemail", async (req, res) => {
  const { email, codigo } = req.body;

  try {
    const dados = await prisma.cliente.findUnique({
      where: { email: email },
    });

    if (!dados) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    await enviaEmail(dados.nome, email, codigo);
    res.status(200).json({ message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
    res.status(500).json({ message: "Erro ao enviar o e-mail" });
  }
});

export default router