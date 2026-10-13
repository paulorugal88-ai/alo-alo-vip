import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// SEU FIREBASE alo-alo-vip
const firebaseConfig = {
  apiKey: "AIzaSyC2X3sfm5AdgXWsVxNCa_PvQKpjDyO1iWA",
  authDomain: "alo-alo-vip.firebaseapp.com",
  projectId: "alo-alo-vip",
  storageBucket: "alo-alo-vip.firebasestorage.app",
  messagingSenderId: "847804328447",
  appId: "1:847804328447:web:a09aec19415fe16478dfca"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DDD_VALIDOS = ["11","12","13","14","15","16","17","18","19","21","22","24","27","28","31","32","33","34","35","37","38","41","42","43","44","45","46","47","48","49","51","53","54","55","61","62","63","64","65","66","67","68","69","71","73","74","75","77","79","81","82","83","84","85","86","87","88","89","91","92","93","94","95","96","97","98","99"];

export default function App() {
  const [nome, setNome] = useState(""); const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState(""); const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState(""); const [showPass, setShowPass] = useState(false);
  const [aceitoTermos, setAceitoTermos] = useState(false); const [aceitoContrato, setAceitoContrato] = useState(false);
  const [salvarSenha, setSalvarSenha] = useState(true); const [modo, setModo] = useState<"criar"|"entrar">("criar");
  const [erro, setErro] = useState(""); const [loading, setLoading] = useState(false);
  const [pais, setPais] = useState("+55"); const [openPais, setOpenPais] = useState(false);
  
  const formatarTelefone = (v:string) => {
    const nums = v.replace(/\D/g,"");
    if(pais === "+55"){
      if(nums.length <=2) return nums;
      if(nums.length <=6) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
      if(nums.length <=10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`;
      return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7,11)}`;
    }
    return nums;
  };
  const validarDDD = () => {
    if(pais !== "+55") return true;
    const ddd = telefone.replace(/\D/g,"").slice(0,2);
    return DDD_VALIDOS.includes(ddd);
  };

  const handleCriar = async () => {
    setErro("");
    if(!nome || !telefone || !email || !senha) { setErro("Preencha todos os campos"); return; }
    if(pais === "+55" && !validarDDD()){ setErro("Insira DDD válido (ex: 11, 21, 31)"); return; }
    if(senha !== confirmar){ setErro("Senhas não conferem"); return; }
    if(!aceitoTermos || !aceitoContrato){ setErro("Aceite os termos"); return; }
    setLoading(true);
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const hoje = new Date(); const venc = new Date(); venc.setDate(hoje.getDate()+30);
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nome, telefone: `${pais} ${telefone}`, email, dataEntrada: hoje.toISOString().split('T')[0],
        dataVencimento: venc.toISOString().split('T')[0], criadoEm: serverTimestamp(), pais
      });
      alert("Conta criada! Agora você já aparece no Firebase!");
      setModo("entrar");
    }catch(e:any){ setErro(e.message); } finally{ setLoading(false); }
  };
  const handleEntrar = async () => {
    setErro(""); setLoading(true);
    try{ await signInWithEmailAndPassword(auth, email, senha); alert("Entrou!"); }
    catch(e:any){ setErro(e.message); } finally{ setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh", background:"#F9FBFA", fontFamily:"Inter, system-ui", display:"flex", justifyContent:"center", padding:"20px"}}>
      <div style={{width:"100%", maxWidth:440}}>
        {/* LOGO */}
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:28, marginTop:8}}>
          <div style={{width:40, height:40, background:"#0EB87E", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <span style={{color:"white", fontWeight:700}}>📶</span>
          </div>
          <div>
            <div style={{fontWeight:700, fontSize:16, color:"#121614"}}>Alô Alô</div>
            <div style={{fontSize:10, letterSpacing:"0.2em", color:"#8AA098", textTransform:"uppercase"}}>Rede Local Premium</div>
          </div>
        </div>

        <div style={{background:"white", borderRadius:28, padding:28, boxShadow:"0 16px 40px rgba(17,24,20,0.06)", border:"1px solid #E8EDEA"}}>
          <h1 style={{fontSize:26, fontWeight:700, color:"#121614", lineHeight:1.1, margin:0}}>Criar conta no<br/>Alô Alô</h1>
          <p style={{color:"#6B7A75", fontSize:14, marginTop:8}}>Entre para ver o feed da sua cidade</p>

          {erro && <div style={{background:"#FEECEC", border:"1px solid #E5484D", color:"#E5484D", padding:12, borderRadius:12, marginTop:16, fontSize:13}}>{erro}</div>}

          <div style={{marginTop:20, display:"flex", flexDirection:"column", gap:14}}>
            <div>
              <label style={{fontSize:12, fontWeight:600, color:"#121614"}}>Nome completo</label>
              <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João Silva" style={{width:"100%", height:52, background:"#F8F9F8", border:"1px solid #E8EDEA", borderRadius:14, padding:"0 16px", marginTop:6, outline:"none"}}/>
            </div>

            <div>
              <label style={{fontSize:12, fontWeight:600, color:"#121614"}}>Telefone</label>
              <div style={{display:"flex", gap:8, marginTop:6}}>
                <div style={{position:"relative"}}>
                  <button onClick={()=>setOpenPais(!openPais)} style={{height:52, minWidth:92, background:"#F8F9F8", border:"1px solid #E8EDEA", borderRadius:14, padding:"0 12px", fontWeight:600}}>{pais} ▼</button>
                  {openPais && <div style={{position:"absolute", top:56, left:0, background:"white", border:"1px solid #E8EDEA", borderRadius:12, zIndex:20, width:140}}>
                    {["+55","+1","+351","+54","+56","+57","+51","+598","+595"].map(p=><div key={p} onClick={()=>{setPais(p); setOpenPais(false);}} style={{padding:"10px 12px", cursor:"pointer", borderBottom:"1px solid #F3F6F4"}}>{p}</div>)}
                  </div>}
                </div>
                <input value={telefone} onChange={e=>setTelefone(formatarTelefone(e.target.value))} placeholder="(00) 00000-0000" style={{flex:1, height:52, background:"#F8F9F8", border:`1px solid ${pais==="+55" && telefone && !validarDDD() ? "#E5484D" : "#E8EDEA"}`, borderRadius:14, padding:"0 16px", outline:"none"}}/>
              </div>
              <div style={{fontSize:11, color: validarDDD() ? "#0EB87E" : "#E5484D", marginTop:4}}>Insira DDD válido (ex: 11, 21, 31)</div>
            </div>

            <div>
              <label style={{fontSize:12, fontWeight:600, color:"#121614"}}>E-mail</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={{width:"100%", height:52, background:"#F8F9F8", border:"1px solid #E8EDEA", borderRadius:14, padding:"0 16px", marginTop:6, outline:"none"}}/>
            </div>

            <div>
              <label style={{fontSize:12, fontWeight:600, color:"#121614"}}>Senha</label>
              <div style={{position:"relative", marginTop:6}}>
                <input type={showPass?"text":"password"} value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mín. 6 caracteres" style={{width:"100%", height:52, background:"#F8F9F8", border:"1px solid #E8EDEA", borderRadius:14, padding:"0 40px 0 16px", outline:"none"}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute", right:12, top:16}}>👁️</button>
              </div>
            </div>

            {modo==="criar" && <div>
              <label style={{fontSize:12, fontWeight:600, color:"#121614"}}>Confirmar senha</label>
              <input type="password" value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Repita a senha" style={{width:"100%", height:52, background:"#F8F9F8", border:"1px solid #E8EDEA", borderRadius:14, padding:"0 16px", marginTop:6, outline:"none"}}/>
            </div>}

            <div style={{display:"flex", gap:8, marginTop:8}}>
              <input type="checkbox" checked={aceitoTermos} onChange={e=>setAceitoTermos(e.target.checked)}/>
              <span style={{fontSize:12, color:"#3A4A45"}}>Eu concordo com os <u style={{color:"#0EB87E"}}>Termos de Uso</u></span>
            </div>
            <div style={{display:"flex", gap:8}}>
              <input type="checkbox" checked={aceitoContrato} onChange={e=>setAceitoContrato(e.target.checked)}/>
              <span style={{fontSize:12, color:"#3A4A45"}}>Li e aceito o <u style={{color:"#0EB87E"}}>Contrato de Prestação</u></span>
            </div>

            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F3F6F4", borderRadius:12, padding:"12px 14px", marginTop:4}}>
              <span style={{fontSize:13, fontWeight:500}}>Salvar senha</span>
              <button onClick={()=>setSalvarSenha(!salvarSenha)} style={{width:40, height:24, borderRadius:999, background: salvarSenha ? "#0EB87E" : "#DDE5E1", position:"relative", border:"none", transition:"0.2s"}}>
                <div style={{width:20, height:20, borderRadius:999, background:"white", position:"absolute", top:2, left: salvarSenha ? 18 : 2, transition:"0.2s"}}/>
              </button>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:4}}>
              <div style={{background:"#F9FBFA", border:"1px solid #EEF2EF", borderRadius:12, padding:12}}>
                <div style={{fontSize:10, color:"#8AA098", textTransform:"uppercase"}}>Data de entrada</div>
                <div style={{fontSize:13, fontWeight:600}}>Hoje<br/>08/10/2026</div>
              </div>
              <div style={{background:"#E6F8F1", border:"1px solid #B7E8D5", borderRadius:12, padding:12}}>
                <div style={{fontSize:10, color:"#3A6B57", textTransform:"uppercase"}}>Vencimento • 30 dias</div>
                <div style={{fontSize:13, fontWeight:600, color:"#0B6B4A"}}>07/11/2026</div>
              </div>
            </div>

            <button onClick={modo==="criar"?handleCriar:handleEntrar} disabled={loading} style={{width:"100%", height:52, background:"#0EB87E", color:"white", border:"none", borderRadius:14, fontWeight:700, fontSize:15, marginTop:6, cursor:"pointer"}}>
              {loading ? "Carregando..." : modo==="criar" ? "Criar conta" : "Entrar"}
            </button>

            <div style={{textAlign:"center", fontSize:13, color:"#6B7A75", marginTop:4}}>
              {modo==="criar" ? "Já possui uma conta?" : "Não tem conta?"} <span onClick={()=>setModo(modo==="criar"?"entrar":"criar")} style={{color:"#0EB87E", fontWeight:600, cursor:"pointer", textDecoration:"underline"}}>{modo==="criar"?"Entrar":"Criar conta"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
