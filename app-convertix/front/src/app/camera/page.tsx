"use client";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import React, { useState} from "react";
import { Toaster } from "sonner";

export default function EnvioGravacao() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async () => {
    if (!date || (!file && !link)) return alert("Escolha uma data e um arquivo ou link.");

    const formData = new FormData();
    formData.append("date", date);
    if(link) formData.append("link", link);
    if(file) formData.append("file", file);

    try {
      await axios.post("/api/gravacoes", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total)
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      alert("Gravação enviada!");
      setFile(null);
      setLink("");
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar gravação.");
    }
  };
    return (
        <div className="flex">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex flex-col gap-4 max-w-lg mx-auto p-4">
                <label className="font-semibold">Data da gravação</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />

                <label className="font-semibold">Link do vídeo</label>
                <input type="text" placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} className="border p-2 rounded" />
                <p>ou</p>
                <label className="font-semibold">Arquivo de vídeo</label>
                <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border p-2 rounded" />
                
                {uploadProgress > 0 && <div className="w-full bg-gray-200 h-3 rounded">
                    <div className="bg-blue-500 h-3 rounded" style={{ width: `${uploadProgress}%` }}></div>
                </div>}

                <button onClick={handleSubmit} className={`p-2 rounded text-white ${!date || !file || !link ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer"}`}>
                    Enviar
                </button>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
