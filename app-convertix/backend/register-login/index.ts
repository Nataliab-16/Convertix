import express from 'express'
import cors from 'cors'
import clientesRoutes from './routes/clientes'
const app = express()
const port = 3004

app.use(express.json())
app.use(cors())

app.use("/clientes", clientesRoutes)

app.get('/', (req, res) => {
  res.send('API: Convertix - Registro e Login')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})