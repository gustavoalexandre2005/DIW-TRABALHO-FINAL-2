console.log('✅ Script detalhes.js carregado!');

class GerenciadorDetalhes {
    constructor() {
        // Dados embutidos diretamente no JavaScript
        this.obras = [
            {
                id: 1,
                titulo: "Abaporu",
                artista: "Tarsila do Amaral",
                ano: 1928,
                tecnica: "Óleo sobre tela",
                dimensoes: "85 cm × 72 cm",
                localizacao: "MALBA – Museu de Arte Latino-Americana de Buenos Aires",
                imagem: "imagens/abaporu.png",
                wikipedia: "https://pt.wikipedia.org/wiki/Abaporu",
                coordenadas: { lat: -34.5802, lng: -58.4109 },
                descricao: "Criada em 1928 por Tarsila do Amaral, a obra Abaporu é um dos maiores símbolos do modernismo brasileiro."
            },
            {
                id: 2,
                titulo: "Mona Lisa",
                artista: "Leonardo da Vinci",
                ano: "1503–1506",
                tecnica: "Óleo sobre madeira de álamo",
                dimensoes: "77 cm × 53 cm",
                localizacao: "Museu do Louvre, Paris",
                imagem: "imagens/monalisa.png",
                wikipedia: "https://pt.wikipedia.org/wiki/Mona_Lisa",
                coordenadas: { lat: 48.8606, lng: 2.3376 },
                descricao: "Pintada entre 1503 e 1506 por Leonardo da Vinci, a Mona Lisa é considerada a pintura mais famosa do mundo."
            }
        ];
        
        this.mapa = null;
        this.marcadores = [];
        
        console.log('✅ Dados carregados:', this.obras);
        this.inicializar();
    }

    inicializar() {
        console.log('✅ Inicializando página...');
        this.renderizarObras();
        this.inicializarMapa();
        this.inicializarForum();
    }

    renderizarObras() {
        const container = document.getElementById('obras-container');
        console.log('✅ Renderizando obras no container:', container);
        
        if (!container) {
            console.error('❌ Container de obras não encontrado!');
            return;
        }

        let html = '';

        this.obras.forEach((obra, index) => {
            html += `
                <section class="obra" data-obra-id="${obra.id}">
                    <h2>${obra.titulo}</h2>
                    <div class="imagem-container">
                        <img src="${obra.imagem}" alt="${obra.titulo} - ${obra.artista}" class="imagem-obra img-fluid">
                    </div>
                    <p class="descricao">${obra.descricao}</p>
                    <ul class="detalhes">
                        <li><strong>Autor:</strong> ${obra.artista}</li>
                        <li><strong>Ano:</strong> ${obra.ano}</li>
                        <li><strong>Técnica:</strong> ${obra.tecnica}</li>
                        <li><strong>Dimensões:</strong> ${obra.dimensoes}</li>
                        <li><strong>Localização:</strong> ${obra.localizacao}</li>
                    </ul>
                    <div class="d-flex gap-2">
                        <a href="${obra.wikipedia}" target="_blank" class="btn-obra">Ver mais na Wikipédia</a>
                        <button class="btn btn-outline-secondary btn-localizar" data-id="${obra.id}">
                            📍 Ver no Mapa
                        </button>
                    </div>
                </section>
                ${index < this.obras.length - 1 ? '<hr class="divisor">' : ''}
            `;
        });

        container.innerHTML = html;
        console.log('✅ Obras renderizadas com sucesso!');
        
        // Configura os eventos dos botões
        this.configurarBotoesObras();
    }

    configurarBotoesObras() {
        document.querySelectorAll('.btn-localizar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const obraId = parseInt(e.target.dataset.id);
                this.centralizarNoMapa(obraId);
            });
        });
    }

    inicializarMapa() {
        console.log('✅ Inicializando mapa...');
        
        // Token do Mapbox - SUBSTITUA pelo seu token real
        mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VzdGF2b21jbG92aW4iLCJhIjoiY21pODdwN2xzMDlpcDJsb3NzMXhpbmRyNCJ9.LLa0qVRK7JtAGKue1LhNzw';
        
        this.mapa = new mapboxgl.Map({
            container: 'mapaObras',
            style: 'mapbox://styles/mapbox/light-v11',
            center: [-30, 10],
            zoom: 1
        });

        this.mapa.addControl(new mapboxgl.NavigationControl());

        this.mapa.on('load', () => {
            console.log('✅ Mapa carregado!');
            this.adicionarMarcadores();
        });
    }

    adicionarMarcadores() {
        console.log('✅ Adicionando marcadores...');
        
        this.obras.forEach(obra => {
            const el = document.createElement('div');
            el.className = 'marcador-obra';
            el.innerHTML = '🎨';
            el.style.cursor = 'pointer';
            el.title = obra.titulo;

            const marker = new mapboxgl.Marker(el)
                .setLngLat([obra.coordenadas.lng, obra.coordenadas.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div class="popup-obra">
                            <h6>${obra.titulo}</h6>
                            <p><strong>Artista:</strong> ${obra.artista}</p>
                            <p><strong>Local:</strong> ${obra.localizacao}</p>
                            <button class="btn btn-sm btn-primary btn-ver-detalhes" data-id="${obra.id}">
                                Ver Detalhes
                            </button>
                        </div>
                    `)
                )
                .addTo(this.mapa);

            marker.getPopup().on('open', () => {
                setTimeout(() => {
                    const btnDetalhes = document.querySelector('.btn-ver-detalhes');
                    if (btnDetalhes) {
                        btnDetalhes.addEventListener('click', (e) => {
                            const obraId = parseInt(e.target.dataset.id);
                            this.rolarParaObra(obraId);
                            marker.getPopup().remove();
                        });
                    }
                }, 100);
            });
        });
        
        console.log('✅ Marcadores adicionados!');
    }

    rolarParaObra(obraId) {
        const elementoObra = document.querySelector(`[data-obra-id="${obraId}"]`);
        if (elementoObra) {
            elementoObra.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    centralizarNoMapa(obraId) {
        const obra = this.obras.find(o => o.id === obraId);
        if (obra && this.mapa) {
            this.mapa.flyTo({
                center: [obra.coordenadas.lng, obra.coordenadas.lat],
                zoom: 12
            });
        }
    }

    inicializarForum() {
        console.log('✅ Inicializando fórum...');
        
        const forumForm = document.getElementById("forumForm");
        const nomeUsuario = document.getElementById("nomeUsuario");
        const mensagemUsuario = document.getElementById("mensagemUsuario");
        const mensagensContainer = document.getElementById("mensagens");

        if (!forumForm) {
            console.error('❌ Formulário do fórum não encontrado!');
            return;
        }

        // Carregar mensagens do LocalStorage
        let mensagens = JSON.parse(localStorage.getItem("mensagensForum")) || [];
        this.renderMensagens(mensagens, mensagensContainer);

        // Enviar mensagem
        forumForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const mensagemObj = {
                id: Date.now(),
                nome: nomeUsuario.value.trim(),
                texto: mensagemUsuario.value.trim()
            };
            
            if(!mensagemObj.nome || !mensagemObj.texto) return;
            
            mensagens.push(mensagemObj);
            this.salvarMensagens(mensagens);
            this.renderMensagens(mensagens, mensagensContainer);
            forumForm.reset();
        });

        console.log('✅ Fórum inicializado!');
    }

    salvarMensagens(mensagens) {
        localStorage.setItem("mensagensForum", JSON.stringify(mensagens));
    }

    renderMensagens(mensagens, container) {
        container.innerHTML = "";
        mensagens.forEach(msg => {
            const li = document.createElement("li");
            li.classList.add("mensagem");
            li.dataset.id = msg.id;
            li.innerHTML = `
                <strong>${msg.nome}:</strong> ${msg.texto}
                <div class="botoes-mensagem">
                    <button class="btn-editar">Editar</button>
                    <button class="btn-apagar">Apagar</button>
                </div>
            `;
            container.appendChild(li);

            // Editar
            li.querySelector(".btn-editar").addEventListener("click", () => {
                const novoTexto = prompt("Edite sua mensagem:", msg.texto);
                if(novoTexto !== null && novoTexto.trim() !== ""){
                    msg.texto = novoTexto.trim();
                    this.salvarMensagens(mensagens);
                    this.renderMensagens(mensagens, container);
                }
            });

            // Apagar
            li.querySelector(".btn-apagar").addEventListener("click", () => {
                if(confirm("Deseja realmente apagar esta mensagem?")){
                    const novasMensagens = mensagens.filter(m => m.id !== msg.id);
                    this.salvarMensagens(novasMensagens);
                    this.renderMensagens(novasMensagens, container);
                }
            });
        });
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM carregado, iniciando aplicação...');
    new GerenciadorDetalhes();
});