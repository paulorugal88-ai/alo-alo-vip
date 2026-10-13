import React, { useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

// SEU FIREBASE alo-alo-vip - mantive suas chaves
const firebaseConfig = {
  apiKey: "AIzaSyC2X3sfm5AdgXWsVxNCa_",
  authDomain: "alo-alo-vip.firebaseapp.com",
  projectId: "alo-alo-vip",
  storageBucket: "alo-alo-vip.appspot.com",
  messagingSenderId: "84780432447",
  appId: "1:84780432447:web:a09aec19"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const DDDS_VALIDOS = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99]

export default function App(){
  const [aba, setAba] = useState<'cadastro'|'login'>('cadastro')
  const [nome, setNome] = useState('')
  const [ddd, setDdd] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroDDD, setErroDDD] = useState('')
  const [loading, setLoading] = useState(false)

  const hoje = new Date()
  const venc = new Date(); venc.setDate(hoje.getDate()+30)

  function validarDDD(v:string){
    const n = parseInt(v)
    if(!v || v.length!==2 || !DDDS_VALIDOS.includes(n)){
      setErroDDD('Insira DDD válido (ex: 11, 21, 31)')
      return false
    }
    setErroDDD('')
    return true
  }

  async function handleCadastro(){
    if(!validarDDD(ddd)) return
    if(!nome || !telefone || !email || !senha){ alert('Preencha tudo'); return }
    setLoading(true)
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, senha)
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nome, ddd, telefone, email,
        dataEntrada: hoje.toISOString(),
        vencimento: venc.toISOString(),
        criadoEm: new Date()
      })
      alert('Cadastro feito com sucesso!')
    }catch(e:any){ alert(e.message) }
    setLoading(false)
  }

  async function handleLogin(){
    setLoading(true)
    try{
      await signInWithEmailAndPassword(auth, email, senha)
      alert('Login OK!')
    }catch(e:any){ alert(e.message) }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:420, margin:'0 auto', padding:20, background:'#fff', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', background:'#f3f4f6', borderRadius:12, padding:4, marginBottom:20}}>
        <button onClick={()=>setAba('cadastro')} style={{flex:1, padding:10, borderRadius:8, border:'none', fontWeight:700, background: aba==='cadastro'?'#00C896':'transparent', color: aba==='cadastro'?'#fff':'#666'}}>Cadastro</button>
        <button onClick={()=>setAba('login')} style={{flex:1, padding:10, borderRadius:8, border:'none', fontWeight:700, background: aba==='login'?'#00C896':'transparent', color: aba==='login'?'#fff':'#666'}}>Login</button>
      </div>

      {aba==='cadastro' && <>
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome" style={{width:'100%', padding:14, borderRadius:12, border:'1px solid #e5e7eb', background:'#EEF4FF', marginBottom:12}}/>
        <div style={{display:'flex', gap:8, marginBottom:4}}>
          <select style={{padding:14, borderRadius:12, border:'1px solid #e5e7eb'}}><option>+55</option></select>
          <input value={ddd} onChange={e=>{ const v=e.target.value.replace(/\D/g,'').slice(0,2); setDdd(v); if(v.length===2) validarDDD(v)}} placeholder="DDD" style={{padding:14, borderRadius:12, border: erroDDD?'1px solid red':'1px solid #e5e7eb', width:80}}/>
          <input value={telefone} onChange={e=>setTelefone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="99981-1502" style={{flex:1, padding:14, borderRadius:12, border:'1px solid #e5e7eb'}}/>
        </div>
        {erroDDD && <p style={{color:'#0DBE8B', fontSize:12, marginBottom:12}}>{erroDDD}</p>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" style={{width:'100%', padding:14, borderRadius:12, border:'1px solid #e5e7eb', background:'#EEF4FF', marginBottom:12}}/>
        <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" style={{width:'100%', padding:14, borderRadius:12, border:'1px solid #e5e7eb', marginBottom:16}}/>
        <button onClick={handleCadastro} disabled={loading} style={{width:'100%', padding:16, borderRadius:16, background:'#00C896', color:'#fff', border:'none', fontWeight:700}}>{loading?'Carregando...':'Entrar'}</button>
        <div style={{display:'flex', gap:12, marginTop:20}}>
          <div style={{flex:1, padding:12, borderRadius:12, background:'#f9fafb', border:'1px solid #eee'}}><small>DATA DE ENTRADA</small><br/><b>{hoje.toLocaleDateString('pt-BR')}</b></div>
          <div style={{flex:1, padding:12, borderRadius:12, background:'#ECFDF5', border:'1px solid #A7F3D0'}}><small>VENCIMENTO • 30 DIAS</small><br/><b style={{color:'#065F46'}}>{venc.toLocaleDateString('pt-BR')}</b></div>
        </div>
      </>}

      {aba==='login' && <>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" style={{width:'100%', padding:14, borderRadius:12, border:'1px solid #e5e7eb', background:'#EEF4FF', marginBottom:12}}/>
        <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" style={{width:'100%', padding:14, borderRadius:12, border:'1px solid #e5e7eb', marginBottom:16}}/>
        <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:16, borderRadius:16, background:'#00C896', color:'#fff', border:'none', fontWeight:700}}>{loading?'Carregando...':'Entrar'}</button>
      </>}
    </div>
  )
}
