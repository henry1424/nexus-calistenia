// ==========================================================================
// 1. ESTRUTURA DE DADOS DO BANCO DO APLICATIVO
// ==========================================================================

// Configuração fixa dos exercícios e níveis das árvores de evolução
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
    },
    {
        id: "avancados",
        categoria: "Elementos Avançados",
        exercicios: [
            { id: "handstand_parede", nome: "Handstand na Parede", xp: 40, nivelReq: 5 },
            { id: "muscle_up", nome: "Muscle-Up", xp: 100, nivelReq: 12 },
            { id: "front_lever_hold", nome: "Front Lever (Tuck)", xp: 120, nivelReq: 15 }
        ]
    }
];

// Estado global do usuário com os valores iniciais de fábrica
let usuario = {
    nome: "Henry",
    nivel: 1,
    xpAtual: 0,
    xpProximoNivel: 100,
    moedas: 0,
    streak: 5,
    titulo: "Iniciante",
    missoesConcluidas: [],
    itensComprados: [],
    avatarSkin: "bottts"
};

// Configuração das missões fixas
const MISSOES = {
    diarias: [
        { id: "d1", texto: "Fazer 20 flexões", recompensaXp: 30, recompensaMoedas: 10 },
        { id: "d2", texto: "Fazer 30 agachamentos", recompensaXp: 30, recompensaMoedas: 10 },
        { id: "d3", texto: "Fazer 1 minuto de prancha", recompensaXp: 40, recompensaMoedas: 15 }
    ],
    semanais: [
        { id: "s1", texto: "Acumular 1000 de XP total", recompensaXp: 200, recompensaMoedas: 50 },
        { id: "s2", texto: "Completar 5 treinos na árvore", recompensaXp: 150, recompensaMoedas: 40 }
    ]
};

// Itens disponíveis para compra na loja virtual
const LOJA_ITENS = [
    { id: "skin_pixel", nome: "Avatar Pixel Art", preco: 50, tipo: "skin", seed: "pixels" },
    { id: "skin_adventure", nome: "Avatar Roteiro RPG", preco: 120, tipo: "skin", seed: "adventure" },
    { id: "titulo_lendario", nome: "Título 'Deus da Força'", preco: 200, tipo: "titulo", valor: "Deus da Força" }
];

// Conquistas desbloqueáveis por marcos
const CONQUISTAS = [
    { id: "c1", nome: "Primeiro Passo", desc: "Chegou ao nível 2", icone: "fa-baby" },
    { id: "c2", nome: "Guerreiro de Ferro", desc: "Alcançou o nível 6", icone: "fa-shield-halved" },
    { id: "c3", nome: "Burguês do Treino", desc: "Acumulou mais de 100 moedas", icone: "fa-sack-dollar" }
];

// ==========================================================================
// 2. CONTROLE DO FLUXO DO APLICATIVO & INTERFACE
// ==========================================================================

window.onload = function() {
    carregarDados();
    renderizarArvore();
    renderizarMissoes();
    renderizarConquistas();
    renderizarLoja();
    atualizarInterface();
    solicitarPermissaoNotificacao();
};

function carregarDados() {
    const dadosSalvos = localStorage.getItem('nexus_calistenia_completo');
    if (dadosSalvos) {
        usuario = JSON.parse(dadosSalvos);
    } else {
        salvarDados();
    }
}

function salvarDados() {
    localStorage.setItem('nexus_calistenia_completo', JSON.stringify(usuario));
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

    // Atualiza a imagem do avatar caso tenha comprado skins na loja
    document.getElementById('avatar-img').src = `https://api.dicebear.com/7.x/${usuario.avatarSkin}/svg?seed=Henry`;
}

function mudarAba(abaNome) {
    // Remove classe ativa de todos os botões e esconde seções
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

    // Ativa o botão clicado e mostra a seção correta
    const botaoAtivo = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(abaNome));
    if (botaoAtivo) botaoAtivo.classList.add('active');
    
    document.getElementById(`aba-${abaNome}`).classList.remove('hidden');
}

// ==========================================================================
// 3. ENGENHARIA DE RPG & EVOLUÇÃO
// ==========================================================================

function ganharXP(quantidade) {
    usuario.xpAtual += quantidade;
    let subiuDeNivel = false;

    while (usuario.xpAtual >= usuario.xpProximoNivel) {
        usuario.xpAtual -= usuario.xpProximoNivel;
        usuario.nivel++;
        usuario.xpProximoNivel = Math.floor(usuario.xpProximoNivel * 1.5);
        subiuDeNivel = true;
    }

    if (subiuDeNivel) {
        mostrarModalLevelUp();
        // Atualiza a árvore para liberar os exercícios travados pelo nível
        renderizarArvore();
        renderizarConquistas();
    }

    // Ganha uma moeda de bônus por cada treino realizado
    usuario.moedas += Math.floor(quantidade / 5);

    salvarDados();
    atualizarInterface();
}

function atualizarTitulo() {
    // Se comprou o título especial da loja, mantém ele priorizado
    if (usuario.itensComprados.includes("titulo_lendario")) {
        usuario.titulo = "Deus da Força";
        return;
    }

    if (usuario.nivel >= 25) usuario.titulo = "Lenda";
    else if (usuario.nivel >= 18) usuario.titulo = "Mestre da Calistenia";
    else if (usuario.nivel >= 12) usuario.titulo = "Atleta";
    else if (usuario.nivel >= 6) usuario.titulo = "Guerreiro";
    else if (usuario.nivel >= 3) usuario.titulo = "Aprendiz";
    else usuario.titulo = "Iniciante";
}

// ==========================================================================
// 4. RENDERIZADORES DINÂMICOS (CONSTRUÇÃO DO HTML VIA JS)
// ==========================================================================

function renderizarArvore() {
    const container = document.getElementById('tree-exercicios');
    container.innerHTML = "";

    ARVORE_EXERCICIOS.forEach(cat => {
        let exerciciosHTML = "";

        cat.exercicios.forEach(ex => {
            const bloqueado = usuario.nivel < ex.nivelReq;
            const textoBotao = bloqueado 
                ? `<i class="fa-solid fa-lock"></i> Bloqueado (Nv. ${ex.nivelReq})`
                : `<i class="fa-solid fa-play"></i> Treinar (+${ex.xp} XP)`;

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
                    <span class="node-lvl">Árvore</span>
                </div>
                <div class="exercise-btn-row">
                    ${exerciciosHTML}
                </div>
            </div>
        `;
    });
}

function renderizarMissoes() {
    const containerDiarias = document.getElementById('lista-missoes-diarias');
    const containerSemanais = document.getElementById('lista-missoes-semanais');
    
    containerDiarias.innerHTML = "";
    containerSemanais.innerHTML = "";

    // Renderizar Diárias
    MISSOES.diarias.forEach(m => {
        const concluida = usuario.missoesConcluidas.includes(m.id);
        containerDiarias.innerHTML += `
            <div class="mission-card ${concluida ? 'completed' : ''}">
                <div class="mission-info">
                    <p>${m.texto}</p>
                    <span>+${m.recompensaXp} XP / +${m.recompensaMoedas} Moedas</span>
                </div>
                <button class="btn-claim" ${concluida ? 'disabled' : ''} onclick="completarMissao('${m.id}', ${m.recompensaXp}, ${m.recompensaMoedas})">
                    ${concluida ? 'Concluída' : 'Concluir'}
                </button>
            </div>
        `;
    });

    // Renderizar Semanais
    MISSOES.semanais.forEach(m => {
        const concluida = usuario.missoesConcluidas.includes(m.id);
        containerSemanais.innerHTML += `
            <div class="mission-card ${concluida ? 'completed' : ''}">
                <div class="mission-info">
                    <p>${m.texto}</p>
                    <span>+${m.recompensaXp} XP / +${m.recompensaMoedas} Moedas</span>
                </div>
                <button class="btn-claim" ${concluida ? 'disabled' : ''} onclick="completarMissao('${m.id}', ${m.recompensaXp}, ${m.recompensaMoedas})">
                    ${concluida ? 'Concluída' : 'Concluir'}
                </button>
            </div>
        `;
    });
}

function completarMissao(id, xp, moedas) {
    if (!usuario.missoesConcluidas.includes(id)) {
        usuario.missoesConcluidas.push(id);
        usuario.moedas += moedas;
        ganharXP(xp);
        renderizarMissoes();
        tocarSomAlternativo();
    }
}

function renderizarConquistas() {
    const container = document.getElementById('lista-conquistas');
    container.innerHTML = "";

    // Lógica para checar se desbloqueou no momento da renderização
    const condicoes = {
        c1: usuario.nivel >= 2,
        c2: usuario.nivel >= 6,
        c3: usuario.moedas >= 100
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

function renderizarLoja() {
    const container = document.getElementById('lista-loja');
    container.innerHTML = "";

    LOJA_ITENS.forEach(item => {
        const comprado = usuario.itensComprados.includes(item.id);
        const podeComprar = usuario.moedas >= item.preco;

        container.innerHTML += `
            <div class="shop-card">
                <div class="shop-item-info">
                    <h4>${item.nome}</h4>
                    <p>Preço: ${item.preco} moedas</p>
                </div>
                <button class="btn-buy" ${comprado || !podeComprar ? 'disabled' : ''} onclick="comprarItem('${item.id}', ${item.preco}, '${item.tipo}', '${item.seed || item.valor}')">
                    ${comprado ? 'Equipado' : `<i class="fa-solid fa-coins"></i> Comprar`}
                </button>
            </div>
        `;
    });
}

function comprarItem(id, preco, tipo, valor) {
    if (usuario.moedas >= preco && !usuario.itensComprados.includes(id)) {
        usuario.moedas -= preco;
        usuario.itensComprados.push(id);

        if (tipo === "skin") {
            usuario.avatarSkin = valor;
        }

        salvarDados();
        atualizarInterface();
        renderizarLoja();
        renderizarConquistas();
    }
}

// ==========================================================================
// 5. MODAIS, NOTIFICAÇÕES & EXTRAS
// ==========================================================================

function mostrarModalLevelUp() {
    document.getElementById('modal-level').innerText = usuario.nivel;
    const alertDiv = document.getElementById('modal-title-change');
    
    if ([3, 6, 12, 18, 25].includes(usuario.nivel)) {
        alertDiv.innerText = "Novo título de RPG desbloqueado no perfil!";
    } else {
        alertDiv.innerText = "";
    }

    document.getElementById('level-up-modal').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('level-up-modal').classList.add('hidden');
}

function tocarSomAlternativo() {
    // Cria um efeito sonoro retro via API de áudio do próprio navegador (sem carregar arquivo mp3 externo)
    if (window.AudioContext || window.webkitAudioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nota Ré
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // Nota Lá
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    }
}

function solicitarPermissaoNotificacao() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function configurarLembrete() {
    const horario = document.getElementById('reminder-time').value;
    alert(`Lembrete configurado para as ${horario}! Mantenha o foco nos treinos.`);
}

function resetarProgresso() {
    if (confirm("Alerta do RPG: Deseja apagar todos os seus dados e começar sua jornada do zero?")) {
        localStorage.removeItem('nexus_calistenia_completo');
        window.location.reload();
    }
}