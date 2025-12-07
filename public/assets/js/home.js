const API_URL = 'http://localhost:3000/api';

let loggedUser = null;
let allObras = [];
let userFavoritos = [];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar se usuário está logado
  const userData = localStorage.getItem('loggedUser');
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }

  loggedUser = JSON.parse(userData);
  
  // Exibir informações do usuário
  document.getElementById('userName').textContent = loggedUser.name;
  document.getElementById('userEmail').textContent = loggedUser.email;

  // Mostrar painel dev se for desenvolvedor
  if (loggedUser.email === 'dev@arte.com') {
    document.getElementById('devPanel').style.display = 'block';
  }

  // Carregar dados
  await carregarObras();
  await carregarFavoritos();
  
  // Event listeners
  document.getElementById('btnLogout').addEventListener('click', logout);
  document.getElementById('formAddObra').addEventListener('submit', adicionarObra);
  document.getElementById('formEditObra').addEventListener('submit', atualizarObra);
});

// ==================== CARREGAR OBRAS ====================
async function carregarObras() {
  try {
    const response = await fetch(`${API_URL}/obras`);
    allObras = await response.json();
    
    renderizarCarrossel();
    renderizarTodasObras();
  } catch (error) {
    console.error('Erro ao carregar obras:', error);
    alert('Erro ao conectar com o servidor. Certifique-se de que está rodando!');
  }
}

// ==================== CARREGAR FAVORITOS ====================
async function carregarFavoritos() {
  try {
    const response = await fetch(`${API_URL}/favoritos/${encodeURIComponent(loggedUser.email)}`);
    userFavoritos = await response.json();
    
    renderizarFavoritos();
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
  }
}

// ==================== RENDERIZAR CARROSSEL ====================
function renderizarCarrossel() {
  const indicatorsContainer = document.getElementById('carouselIndicators');
  const innerContainer = document.getElementById('carouselInner');
  
  indicatorsContainer.innerHTML = '';
  innerContainer.innerHTML = '';

  allObras.forEach((obra, index) => {
    // Indicadores
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.setAttribute('data-bs-target', '#carouselExampleCaptions');
    indicator.setAttribute('data-bs-slide-to', index);
    if (index === 0) indicator.classList.add('active');
    indicatorsContainer.appendChild(indicator);

    // Slides
    const slide = document.createElement('div');
    slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    slide.innerHTML = `
      <a href="${obra.link}" target="_blank">
        <img src="${obra.imagem}" class="d-block w-100" alt="${obra.titulo}" style="height: 400px; object-fit: cover;">
      </a>
      <div class="carousel-caption d-none d-md-block">
        <h5>${obra.titulo}</h5>
        <p>${obra.autor}</p>
      </div>
    `;
    innerContainer.appendChild(slide);
  });
}

// ==================== RENDERIZAR TODAS AS OBRAS ====================
function renderizarTodasObras() {
  const container = document.getElementById('obrasGrid');
  container.innerHTML = '';

  allObras.forEach(obra => {
    const isFavorited = userFavoritos.some(f => f.id === obra.id);
    
    const card = document.createElement('div');
    card.className = 'obra-card';
    card.innerHTML = `
      <img src="${obra.imagem}" alt="${obra.titulo}">
      <div class="d-flex justify-content-between align-items-center mt-2">
        <h4>${obra.titulo}</h4>
        <button class="btn-favorito ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorito(${obra.id})">
          ${isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
      <p><strong>Autor:</strong> ${obra.autor}</p>
      <p><strong>Data:</strong> ${obra.data}</p>
      <p><strong>Técnica:</strong> ${obra.tecnica}</p>
      <p><strong>Dimensões:</strong> ${obra.dimensoes}</p>
      <p><strong>Localização:</strong> ${obra.localizacao}</p>
      <p class="mt-2">${obra.resumo}</p>
      <div class="mt-2">
        <a href="${obra.link}" target="_blank" class="btn btn-sm btn-info">Ver detalhes</a>
        ${loggedUser.email === 'dev@arte.com' ? `
          <button class="btn btn-sm btn-warning" onclick="editarObra(${obra.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarObra(${obra.id})">Excluir</button>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== RENDERIZAR FAVORITOS ====================
function renderizarFavoritos() {
  const container = document.getElementById('favoritosGrid');
  
  if (userFavoritos.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">Você ainda não tem favoritos. Clique no coração em qualquer obra!</p>';
    return;
  }

  container.innerHTML = '';
  
  userFavoritos.forEach(obra => {
    const card = document.createElement('div');
    card.className = 'obra-card';
    card.innerHTML = `
      <img src="${obra.imagem}" alt="${obra.titulo}">
      <div class="d-flex justify-content-between align-items-center mt-2">
        <h4>${obra.titulo}</h4>
        <button class="btn-favorito favorited" onclick="toggleFavorito(${obra.id})">❤️</button>
      </div>
      <p><strong>Autor:</strong> ${obra.autor}</p>
      <p><strong>Data:</strong> ${obra.data}</p>
      <p class="mt-2">${obra.resumo.substring(0, 150)}...</p>
      <a href="${obra.link}" target="_blank" class="btn btn-sm btn-info mt-2">Ver mais</a>
    `;
    container.appendChild(card);
  });
}

// ==================== TOGGLE FAVORITO ====================
async function toggleFavorito(obraId) {
  const isFavorited = userFavoritos.some(f => f.id === obraId);

  try {
    if (isFavorited) {
      // Remover favorito
      await fetch(`${API_URL}/favoritos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loggedUser.email, obraId })
      });
    } else {
      // Adicionar favorito
      await fetch(`${API_URL}/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loggedUser.email, obraId })
      });
    }

    await carregarFavoritos();
    renderizarTodasObras();
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    alert('Erro ao atualizar favorito');
  }
}

// ==================== ADICIONAR OBRA ====================
async function adicionarObra(e) {
  e.preventDefault();

  const novaObra = {
    titulo: document.getElementById('inputTitulo').value,
    autor: document.getElementById('inputAutor').value,
    data: document.getElementById('inputData').value,
    tecnica: document.getElementById('inputTecnica').value,
    dimensoes: document.getElementById('inputDimensoes').value,
    localizacao: document.getElementById('inputLocalizacao').value,
    imagem: document.getElementById('inputImagem').value,
    link: document.getElementById('inputLink').value,
    resumo: document.getElementById('inputResumo').value
  };

  try {
    const response = await fetch(`${API_URL}/obras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaObra)
    });

    if (response.ok) {
      alert('Obra adicionada com sucesso!');
      document.getElementById('formAddObra').reset();
      bootstrap.Modal.getInstance(document.getElementById('modalAddObra')).hide();
      await carregarObras();
    }
  } catch (error) {
    console.error('Erro ao adicionar obra:', error);
    alert('Erro ao adicionar obra');
  }
}

// ==================== EDITAR OBRA ====================
function editarObra(id) {
  const obra = allObras.find(o => o.id === id);
  if (!obra) return;

  document.getElementById('editObraId').value = obra.id;
  document.getElementById('editTitulo').value = obra.titulo;
  document.getElementById('editAutor').value = obra.autor;
  document.getElementById('editData').value = obra.data;
  document.getElementById('editTecnica').value = obra.tecnica;
  document.getElementById('editDimensoes').value = obra.dimensoes;
  document.getElementById('editLocalizacao').value = obra.localizacao;
  document.getElementById('editImagem').value = obra.imagem;
  document.getElementById('editLink').value = obra.link;
  document.getElementById('editResumo').value = obra.resumo;

  new bootstrap.Modal(document.getElementById('modalEditObra')).show();
}

async function atualizarObra(e) {
  e.preventDefault();

  const id = document.getElementById('editObraId').value;
  const obraAtualizada = {
    titulo: document.getElementById('editTitulo').value,
    autor: document.getElementById('editAutor').value,
    data: document.getElementById('editData').value,
    tecnica: document.getElementById('editTecnica').value,
    dimensoes: document.getElementById('editDimensoes').value,
    localizacao: document.getElementById('editLocalizacao').value,
    imagem: document.getElementById('editImagem').value,
    link: document.getElementById('editLink').value,
    resumo: document.getElementById('editResumo').value
  };

  try {
    const response = await fetch(`${API_URL}/obras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obraAtualizada)
    });

    if (response.ok) {
      alert('Obra atualizada com sucesso!');
      bootstrap.Modal.getInstance(document.getElementById('modalEditObra')).hide();
      await carregarObras();
      await carregarFavoritos();
    }
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    alert('Erro ao atualizar obra');
  }
}

// ==================== DELETAR OBRA ====================
async function deletarObra(id) {
  if (!confirm('Tem certeza que deseja excluir esta obra?')) return;

  try {
    const response = await fetch(`${API_URL}/obras/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Obra excluída com sucesso!');
      await carregarObras();
      await carregarFavoritos();
    }
  } catch (error) {
    console.error('Erro ao deletar obra:', error);
    alert('Erro ao deletar obra');
  }
}

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
}