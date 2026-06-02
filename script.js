// ==========================================================================
// 1. ESTRUTURA DE DADOS DO BANCO DO APLICATIVO
// ==========================================================================

const ARVORE_EXERCICIOS = [
    {
        id: "flexoes",
        categoria: "Flexões",
        exercicios: [
            { id: "flexao_inclinada", nome: "Flexão Inclinada", xp: 15, nivelReq: 1 },
            { id: "flexao_comum", nome: "Flexão Tradicional", xp: 25, nivelReq: 2 },
            { id: "flexao_diamante", nome: "Flexão Diamante", xp: 40, nivelReq: 4 },
            { id: "flexao_arquitetada", nome: "Flexão Archer", xp: 60, nivelReq: 7 }
        ]
    },
    {
        id: "barras",
        categoria: "Barras Fixas",
        exercicios: [
            { id: "barra_australiana", nome: "Barra Australiana", xp: 20, nivelReq: 1 },
            { id: "chin_up", nome: "Chin-Up (Supinada)", xp: 35, nivelReq: 3 },
            { id: "pull_up", nome: "Pull-Up (Pronada)", xp: 50, nivelReq: 5 },
            { id: "barra_explosiva", nome: "Barra Explosiva", xp: 75, nivelReq: 9 }
        ]
    },
    {
        id: "agachamentos",
        categoria: "Agachamentos",
        exercicios: [
            { id: "agachamento_comum", nome: "Agachamento Livre", xp: 15, nivelReq: 1 },
            { id: "agachamento_sumo", nome: "Agachamento Sumô", xp: 25, nivelReq: 3 },
            { id: "agachamento_pistol_prep", nome: "Pistol Squat Assistido", xp: 50, nivelReq: 6 },
            { id: "pistol_squat", nome: "Pistol Squat Completo", xp: 90, nivelReq: 10 }
        ]
    }
];

// Estado global de dados (Com chave de login controlada)
let usuario = {
    logado: false,
    email: "",
    nome: "",
    foto: "", // String Base64 da imagem real enviada
    nivel: 1,
    xpAtual: 0,
    xpProximoNivel: 100,
    moedas: 0,
    streak: 1,
    titulo: "Iniciante",
    missoesConcluidas: [],
    itensComprados: []
};

const MISSOES = {
    diarias: [
        { id: "d1", texto: "Fazer 20 flexões", recompensaXp: 30 },
        { id: "d2", texto: "Fazer 30 agachamentos", recompensaXp: 30 },
        { id: "d3", texto: "Fazer 1 minuto de prancha", recompensaXp: 40 }
    ],
    semanais: [
        { id: "s1", texto: "Completar 5 treinos na árvore", recompensaXp: 150 },
        { id: "s2", texto: "Alcançar 3 dias de Streak seguidos", recompensaXp: 200 }
    ]
};

// Nova Loja focada em Monetização e Microtransações em R$
const LOJA_MONETIZACAO = [
    { id: "moedas_p", nome: "Pacote 50 Moedas Nexus", desc: "Acelere suas conquistas", precoExibicao: "R$ 4,99", valorMoedas: 50, tipo: "consumivel" },
    { id: "moedas_g", nome: "Baú de 250 Moedas", desc: "Melhor Custo-Benefício!", precoExibicao: "R$ 14,99", valorMoedas: 250, tipo: "consumivel" },
    { id: "titulo_premium", nome: "Título RPG: 'Deus da Força'", desc: "Destaque exclusivo no perfil", precoExibicao: "R$ 9,90", valorMoedas: 0, tipo: "titulo", valor: "Deus da Força" }
];

const CONQUISTAS = [
    { id: "c1", nome: "Primeiro Passo", desc: "Chegou ao nível 2", icone: "fa-baby" },
    { id: "c2", nome: "Guerreiro de Ferro", desc: "Alcançou o nível 6", icone: "fa-shield-halved" },
    { id: "c3", nome: "Investidor Nexus", desc: "Comprou um item com dinheiro real", icone: "fa-credit-card" }
];

// Guardar string temporária da foto carregada no login
let fotoBase64Temporaria = "";

// ==========================================================================
// 2. SISTEMA DE LOGIN & COMPORTAMENTO DE FOTO REAL
// ==========================================================================

window.onload = function() {
    carregarDados();
    
    if (usuario.logado) {
        exibirAplicativo();
    } else {
        exibirTelaLogin();
    }
};

function previewImagem(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoBase64Temporaria = e.target.result;
            const preview = document.getElementById('preview-img');
            preview.src = fotoBase64Temporaria;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(arquivo);
    }
}

function realizarLogin() {
    const email = document.getElementById('login-email').value;
    const nome = document.getElementById('login-name').value;

    if (!email || !nome) {
        alert("Por favor, preencha o e-mail e o seu nome de usuário do Google!");
        return;
    }

    // Alimenta o banco local
    usuario.logado = true;
    usuario.email = email;
    usuario.nome = nome;
    usuario.foto = fotoBase64Temporaria || "https://api.dicebear.com/7.x/bottts/svg?seed=" + nome;

    salvarDados();
    exibirAplicativo();
}

function exibirTelaLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-main').classList.add('hidden');
}

function exibirAplicativo() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-main').classList.remove('hidden');
    
    // Inicia e renderiza todas as abas
    renderizarArvore();
    renderizarMissoes();
    renderizarConquistas();
    renderizarLoja();
    atualizarInterface();
}

// ==========================================================================
// 3. PERSISTÊNCIA & ATUALIZAÇÃO DA TELA
// ==========================================================================

function carregarDados() {
    const dadosSalvos = localStorage.getItem('nexus_calistenia_premium');
    if (dadosSalvos) {
        usuario = JSON.parse(dadosSalvos);
    }
}

function salvarDados() {
    localStorage.setItem('nexus_calistenia_premium', JSON.stringify(usuario));
}

function atualizarInterface() {
    document.getElementById('user-name').innerText = usuario.nome;
    document.getElementById('user-level').innerText = usuario.nivel;
    document.getElementById('current-xp').innerText = usuario.xpAtual;
    document.getElementById('next-level-xp').innerText = usuario.xpProximoNivel;
    document.getElementById('streak-count').innerText = usuario.streak;
    document.getElementById('coin-count').innerText = usuario.moedas;
    
    atualizarTitulo();
    document.getElementById('user-title').innerText = usuario.titulo;

    const porcentagemXp = (usuario.xpAtual / usuario.xpProximoNivel) * 100;
    document.getElementById('xp-bar-fill').style.width = `${porcentagemXp}%`;

    // Aplica a foto de perfil real (Base64) salva
    document.getElementById('avatar-img').src = usuario.foto;
}

function mudarAba(abaNome) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

    const btnClicado = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(abaNome));
    if (btnClicado) btnClicado.classList.add('active');
    
    document.getElementById(`aba-${abaNome}`).classList.remove('hidden');
}

// ==========================================================================
// 4. LÓGICA DE TREINOS E MISSÕES (RPG)
// ==========================================================================

function ganharXP(quantidade) {
    usuario.xpAtual += Math.floor(quantidade);
    let subiuDeNivel = false;

    while (usuario.xpAtual >= usuario.xpProximoNivel) {
        usuario.xpAtual -= usuario.xpProximoNivel;
        usuario.nivel++;
        usuario.xpProximoNivel = Math.floor(usuario.xpProximoNivel * 1.5);
        subiuDeNivel = true;
    }

    if (subiuDeNivel) {
        mostrarModalLevelUp();
        renderizarArvore();
        renderizarConquistas();
    }

    salvarDados();
    atualizarInterface();
}

function atualizarTitulo() {
    if (usuario.itensComprados.includes("titulo_premium")) {
        usuario.titulo = "Deus da Força";
        return;
    }
    if (usuario.nivel >= 25) usuario.titulo = "Lenda";
    else if (usuario.nivel >= 12) usuario.titulo = "Atleta";
    else if (usuario.nivel >= 6) usuario.titulo = "Guerreiro";
    else usuario.titulo = "Iniciante";
}

function renderizarArvore() {
    const container = document.getElementById('tree-exercicios');
    container.innerHTML = "";

    ARVORE_EXERCICIOS.forEach(cat => {
        let exerciciosHTML = "";
        cat.exercicios.forEach(ex => {
            const bloqueado = usuario.nivel < ex.nivelReq;
            const textoBotao = bloqueado 
                ? `<i class="fa-solid fa-lock"></i> Nv. ${ex.nivelReq}`
                : `<i class="fa-solid fa-play"></i> Concluir (+${ex.xp} XP)`;

            exerciciosHTML += `
                <button class="exercise-node-btn" ${bloqueado ? 'disabled' : ''} onclick="ganharXP(${ex.xp})">
                    <span>${ex.nome}</span>
                    <span class="xp-reward">${textoBotao}</span>
                </button>
            `;
        });

        container.innerHTML += `
            <div class="category-node">
                <div class="category-header">
                    <h4>${cat.categoria}</h4>
                    <span class="node-lvl">Sessão</span>
                </div>
                <div class="exercise-btn-row">${exerciciosHTML}</div>
            </div>
        `;
    });
}

function renderizarMissoes() {
    const containerDiarias = document.getElementById('lista-missoes-diarias');
    const containerSemanais = document.getElementById('lista-missoes-semanais');
    containerDiarias.innerHTML = "";
    containerSemanais.innerHTML = "";

    MISSOES.diarias.forEach(m => {
        const concluida = usuario.missoesConcluidas.includes(m.id);
        containerDiarias.innerHTML += `
            <div class="mission-card ${concluida ? 'completed' : ''}">
                <div class="mission-info">
                    <p>${m.texto}</p>
                    <span>+${m.recompensaXp} XP</span>
                </div>
                <button class="btn-claim" ${concluida ? 'disabled' : ''} onclick="completarMissao('${m.id}', ${m.recompensaXp})">
                    ${concluida ? 'Feito' : 'Marcar'}
                </button>
            </div>
        `;
    });

    MISSOES.semanais.forEach(m => {
        const concluida = usuario.missoesConcluidas.includes(m.id);
        containerSemanais.innerHTML += `
            <div class="mission-card ${concluida ? 'completed' : ''}">
                <div class="mission-info">
                    <p>${m.texto}</p>
                    <span>+${m.recompensaXp} XP</span>
                </div>
                <button class="btn-claim" ${concluida ? 'disabled' : ''} onclick="completarMissao('${m.id}', ${m.recompensaXp})">
                    ${concluida ? 'Feito' : 'Marcar'}
                </button>
            </div>
        `;
    });
}

function completarMissao(id, xp) {
    if (!usuario.missoesConcluidas.includes(id)) {
        usuario.missoesConcluidas.push(id);
        ganharXP(xp);
        renderizarMissoes();
    }
}

function renderizarConquistas() {
    const container = document.getElementById('lista-conquistas');
    container.innerHTML = "";

    const condicoes = {
        c1: usuario.nivel >= 2,
        c2: usuario.nivel >= 6,
        c3: usuario.itensComprados.length > 0
    };

    CONQUISTAS.forEach(c => {
        const desbloqueada = condicoes[c.id];
        container.innerHTML += `
            <div class="achievement-card ${desbloqueada ? 'unlocked' : ''}">
                <i class="fa-solid ${c.icone}"></i>
                <h5>${c.nome}</h5>
                <p>${c.desc}</p>
            </div>
        `;
    });
}

// ==========================================================================
// 5. LOJA DE MONETIZAÇÃO (COMPRA REAL DE MOEDAS SIMULADA)
// ==========================================================================

function renderizarLoja() {
    const container = document.getElementById('lista-loja');
    container.innerHTML = "";

    LOJA_MONETIZACAO.forEach(item => {
        const comprado = usuario.itensComprados.includes(item.id);
        
        let textoBotao = `<i class="fa-solid fa-cart-shopping"></i> Comprar`;
        let classeBotao = "btn-buy";
        let disparadorClique = `processarCompraMonetizada('${item.id}', ${item.valorMoedas}, '${item.tipo}')`;

        if (comprado && item.tipo === "titulo") {
            textoBotao = "Ativado";
            classeBotao = "btn-buy purchased";
            disparadorClique = "";
        }

        container.innerHTML += `
            <div class="shop-card">
                <div class="shop-item-info">
                    <h4>${item.nome}</h4>
                    <p>${item.desc}</p>
                    <span class="price-tag">${item.precoExibicao}</span>
                </div>
                <button class="${classeBotao}" onclick="${disparadorClique}">${textoBotao}</button>
            </div>
        `;
    });
}

function processarCompraMonetizada(id, valorMoedas, tipo) {
    // Simulação profissional de Gateway de Pagamento (Mercado Pago / Stripe / Google Play API)
    if (confirm(`💸 Gateway Nexus Pay:\n\nDeseja simular o pagamento deste item por dinheiro real no ambiente de testes do GitHub?`)) {
        
        alert("✅ Pagamento aprovado com sucesso! Seus créditos premium foram injetados.");
        
        if (tipo === "consumivel") {
            usuario.moedas += valorMoedas;
        } else if (tipo === "titulo") {
            usuario.itensComprados.push(id);
        }

        salvarDados();
        atualizarInterface();
        renderizarLoja();
        renderizarConquistas();
    }
}

// ==========================================================================
// 6. EXTRAS & RESET
// ==========================================================================

function mostrarModalLevelUp() {
    document.getElementById('modal-level').innerText = usuario.nivel;
    document.getElementById('level-up-modal').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('level-up-modal').classList.add('hidden');
}

function configurarLembrete() {
    alert(`Notificação do app: Você será avisado no horário configurado para não quebrar sua sequência de treinos.`);
}

function resetarProgresso() {
    if (confirm("Quer realmente deslogar e limpar sua conta deste dispositivo?")) {
        localStorage.removeItem('nexus_calistenia_premium');
        window.location.reload();
    }
}