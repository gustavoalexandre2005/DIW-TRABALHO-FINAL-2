// ---------- Helpers ----------
const stage = document.getElementById('stage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginMsg = document.getElementById('loginMessage');
const regMsg = document.getElementById('regMessage');

const toRegisterBtn = document.getElementById('toRegisterBtn');
const toLoginBtn = document.getElementById('toLoginBtn');

// Redirect destination
const DESTINATION = "home.html";

function isEmail(v){ 
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); 
}

function show(el, text, ok=true){
  el.textContent = text;
  el.classList.remove('ok','err');
  el.classList.add(ok ? 'ok' : 'err');
  el.style.opacity = '1';
  setTimeout(()=> el.style.opacity = '0.0', 2800);
}

// ---------- Switch Screens ----------
toRegisterBtn.addEventListener('click', ()=> {
  stage.classList.add('register-active');
});
toLoginBtn.addEventListener('click', ()=> {
  stage.classList.remove('register-active');
});

// ---------- Login ----------
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const pass  = loginPassword.value.trim();

  if(!isEmail(email)) { show(loginMsg, 'E-mail inválido.', false); return; }
  if(pass.length < 6) { show(loginMsg, 'Senha deve ter ao menos 6 caracteres.', false); return; }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

  if(!found){
    show(loginMsg, 'Email ou senha incorretos.', false);
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify(found));
  show(loginMsg, "Login bem-sucedido!", true);

  setTimeout(() => window.location.href = DESTINATION, 700);
});

// ---------- Cadastro ----------
registerForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass  = regPassword.value.trim();

  if(name.length < 2){ show(regMsg, 'Nome muito curto.', false); return; }
  if(!isEmail(email)){ show(regMsg, 'E-mail inválido.', false); return; }
  if(pass.length < 6){ show(regMsg, 'Senha deve ter ao menos 6 caracteres.', false); return; }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if(users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    show(regMsg, 'Já existe uma conta com esse e-mail.', false); 
    return;
  }

  users.push({ id: Date.now(), name, email, password: pass });
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedUser", JSON.stringify({ name, email }));

  show(regMsg, "Conta criada com sucesso!", true);

  setTimeout(() => window.location.href = DESTINATION, 700);
});

// ESC volta ao login
window.addEventListener('keydown', e => {
  if(e.key === 'Escape') stage.classList.remove('register-active');
});