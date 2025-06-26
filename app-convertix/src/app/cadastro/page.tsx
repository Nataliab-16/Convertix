import React from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CadastroPage() {
  return (
    <div>
      <Head>
        <title>Cadastro - Convertix</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container-fluid vh-100 d-flex p-0">
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-5" style={{ backgroundColor: '#0C1421', color: 'white' }}>
          <div className="mb-4 d-flex flex-column align-items-center">
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

            <form>
              <div className="mb-3">
                <input type="text" className="form-control rounded-0 border-0 border-bottom" placeholder="Nome" />
              </div>
              <div className="mb-3">
                <input type="email" className="form-control rounded-0 border-0 border-bottom" placeholder="Email" />
              </div>
              <div className="mb-3 position-relative">
                <input type="password" className="form-control rounded-0 border-0 border-bottom pe-5" placeholder="Senha" />
                <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary" style={{ cursor: 'pointer' }}>👁️</span>
              </div>
              <div className="mb-4 position-relative">
                <input type="password" className="form-control rounded-0 border-0 border-bottom pe-5" placeholder="Confirmação senha" />
                <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary" style={{ cursor: 'pointer' }}>👁️</span>
              </div>

              <div className="text-start">
                <button type="submit" className="btn px-4 py-2" style={{ backgroundColor: '#2BB673', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                  Cadastrar-se →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}