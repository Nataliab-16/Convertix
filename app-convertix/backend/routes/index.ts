import express from 'express'
import cors from 'cors'
import clientesRoutes from './routes/clientes'
import emailRoutes from './routes/email'
import vendasRoutes from './routes/vendas'
const app = express()
const port = 3004

app.use(express.json())
app.use(cors())

app.use("/clientes", clientesRoutes)
app.use("/email", emailRoutes)
app.use("/vendas", vendasRoutes)

app.get('/', (req, res) => {
  res.send('API: Convertix - Backend')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})