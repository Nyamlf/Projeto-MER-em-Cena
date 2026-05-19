// editor.js
import { mostrarErro, mostrarDicaMascote, carregarCenario } from './ui.js';
import { validarCenario } from './validator.js'; // Adicione esta linha!

// ==========================================
// 1. ESTADO DO EDITOR (Variáveis Privadas)
// Ninguém de fora consegue mexer nestas variáveis
// ==========================================
let conexoes = [];
let contadorIds = 0;
let modoAtual = 'conectar';
let elementoSelecionadoParaConectar = null;
let conexaoContextual = null;
let cardSelecionado = { lado1: '', lado2: '' };
let conexaoEmEdicao = null;

// Elementos do DOM (Serão carregados no initEditor)
let areaTrabalho, camadaLinhas, modoLabel, menuContextual, painelCard;
let cenarioAtualId = 1;

// ==========================================
// 2. INICIALIZAÇÃO (Exportado para o main.js)
// ==========================================
export function initEditor() {
    areaTrabalho = document.getElementById('areaTrabalho');
    camadaLinhas = document.getElementById('camada-linhas');
    modoLabel = document.getElementById('modoLabel');
    menuContextual = document.getElementById('menuContextual');
    painelCard = document.getElementById('painelCardinalidade');

    // Prepara as ferramentas para serem arrastadas
    document.querySelectorAll('.ferramenta').forEach(f => {
        f.addEventListener('dragstart', e => {
            e.dataTransfer.setData('tipo', e.currentTarget.getAttribute('data-tipo'));
        });
    });

    areaTrabalho.addEventListener('dragover', e => e.preventDefault());
    
    areaTrabalho.addEventListener('drop', e => {
        e.preventDefault();
        const tipo = e.dataTransfer.getData('tipo');
        if (!tipo) return;
        const rect = areaTrabalho.getBoundingClientRect();
        criarElementoCanvas(tipo, e.clientX - rect.left - 45, e.clientY - rect.top - 22);
    });

    // Eventos globais de clique para fechar menus
    areaTrabalho.addEventListener('click', () => { desmarcar(); fecharMenu(); });
    
    document.addEventListener('click', e => {
        if (menuContextual && !menuContextual.contains(e.target)) {
            menuContextual.classList.remove('ativo');
        }
    });

    if(painelCard) painelCard.addEventListener('click', e => e.stopPropagation());
}

// ==========================================
// 3. AÇÕES DA TOPBAR E BOTTOMBAR (Exportadas)
// ==========================================
export function setModo(modo) {
    modoAtual = modo;
    
    // 1. Tira o estilo ativo dos botões de forma segura
    document.querySelectorAll('.btn-modo').forEach(b => b.classList.remove('ativo'));
    
    // 2. Tenta achar o botão pelo ID de forma flexível (sem travar se não achar)
    const btnClicado = document.getElementById('btn-modo-' + modo) || document.getElementById(modo);
    if (btnClicado) {
        btnClicado.classList.add('ativo');
    }

    // 3. Atualiza o painel de texto
    const labels = { 
        conectar: 'MODO: CONECTAR  |  arraste para mover', 
        remover: 'MODO: REMOVER ELEMENTO | clique para remover' 
    };
    
    if (modoLabel) {
        modoLabel.textContent = labels[modo] || '';
    }
    
    desmarcar();
}

export function limparTudo() {
    if (!confirm('Limpar todo o diagrama?')) return;
    document.querySelectorAll('.elemento-canvas').forEach(el => el.remove());
    conexoes = []; 
    desenharLinhas();
}

export function validarModelo() {
    const elementos = document.querySelectorAll('.elemento-canvas');
    
    if (elementos.length === 0) {
        mostrarDicaMascote('O quadro está vazio! Arraste algumas formas para começar a modelar.', 'atencao');
        return;
    }

    // Valida o cenário atual
    const resultado = validarCenario(cenarioAtualId, elementos, conexoes);

    if (resultado.valido) {
        // Vitória!
        const proximaFase = cenarioAtualId + 1;
        
        const mensagemSucesso = `
            <strong>Fantástico!</strong> Você modelou tudo certinho! ✨<br>
            <button onclick="avancarFase(${proximaFase})" style="margin-top:10px; padding:6px 12px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
                Próximo Desafio ➔
            </button>
        `;
        
        mostrarDicaMascote(mensagemSucesso, 'vitoria'); 
        
    } else {
        // Erro de cenário
        mostrarDicaMascote(resultado.erros[0], 'atencao');
    }
}

// Função para o botão do pinguim chamar
export function avancarFase(idProximaFase) {
    cenarioAtualId = idProximaFase;
    
    // 1. O SEGREDO: Nós simplesmente DELETAMOS o "limparTudo()" daqui.
    // Assim, todas as divs e linhas do SVG continuam intactas na tela!
    
    // 2. Carrega o vídeo e o texto da nova fase
    if (idProximaFase > 6) {
        mostrarTelaFim();
        return;
    }

    cenarioAtualId = idProximaFase;
    carregarCenario(idProximaFase);

    // 3. Tira a roupa de "Vitória" do Pinguim e volta ele ao normal
    const balaoMascote = document.querySelector('.balao-fala');
    if (balaoMascote) {
        balaoMascote.style.borderColor = '#e2e8f0'; // Volta para a borda cinza
        balaoMascote.style.backgroundColor = 'white'; // Volta pro fundo branco
    }
}

// ==========================================
// 4. LÓGICA DE ELEMENTOS (Funções Privadas)
// ==========================================
function criarElementoCanvas(tipo, x, y) {
    const el = document.createElement('div');
    el.id = 'forma_' + contadorIds++;
    el.classList.add('elemento-canvas', 'forma-' + tipo);
    el.setAttribute('data-tipo', tipo);
    el.style.left = x + 'px';
    el.style.top  = y + 'px';

    // O texto inicial sempre maiúsculo
    el.textContent = tipo.toUpperCase();

    let isDragging = false, startX, startY, initialX, initialY, mouseMoved = false;

    // 1. EVENTO DE CLICAR PARA ARRASTAR
    el.addEventListener('mousedown', e => {
        // Se a caixa estiver em modo de edição de texto, sai da função e deixa o mouse livre
        if (el.isContentEditable) return; 

        // O SEGREDO: Impede que o navegador tente arrastar o texto como se fosse um link,
        // o que quebrava o movimento da caixa!
        e.preventDefault(); 
        
        if (e.button !== 0) return; // Só botão esquerdo do mouse
        
        isDragging = true;
        mouseMoved = false;
        startX = e.clientX; 
        startY = e.clientY;
        initialX = el.offsetLeft; 
        initialY = el.offsetTop;
        e.stopPropagation();
    });

    // 2. EVENTO DE MOVER O MOUSE
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            mouseMoved = true;
            el.style.left = (initialX + dx) + 'px';
            el.style.top  = (initialY + dy) + 'px';
            desenharLinhas();
        }
    });

    // 3. EVENTO DE SOLTAR O MOUSE
    document.addEventListener('mouseup', () => { 
        isDragging = false; 
    });

    // 4. DUPLO CLIQUE (Edição de Texto Inline Moderna)
    el.addEventListener('dblclick', e => {
        e.stopPropagation();

        el.contentEditable = "true"; // Transforma em campo de texto
        el.focus();
        el.classList.add('editando'); // Avisa o CSS
        
        // Seleciona o texto
        document.execCommand('selectAll', false, null);
        
        el.style.outline = '3px dashed #e94560';
        el.style.zIndex = '1000';

        const finalizarEdicao = () => {
            el.contentEditable = "false";
            el.classList.remove('editando');
            el.style.outline = 'none';
            el.style.zIndex = '1';
            
            const novoTexto = el.textContent.trim().toUpperCase();
            el.textContent = novoTexto === '' ? tipo.toUpperCase() : novoTexto;
            
            el.removeEventListener('blur', finalizarEdicao);
            el.removeEventListener('keydown', verificarEnter);
            desenharLinhas();
        };

        const verificarEnter = (evt) => {
            if (evt.key === 'Enter') {
                evt.preventDefault();
                finalizarEdicao();
            }
        };

        el.addEventListener('blur', finalizarEdicao);
        el.addEventListener('keydown', verificarEnter);
    });
    el.addEventListener('click', e => {
        e.stopPropagation();
        
        // Se o mouse moveu (arraste), ignora o clique
        if (mouseMoved) { 
            mouseMoved = false; 
            return; 
        }
        
        // Fofoqueiro: Diz no F12 qual modo está ativo
        console.log("Clique detectado! Modo atual:", modoAtual);

        if (modoAtual === 'remover') { 
            removerElemento(el); 
            // Depois de apagar, volta pro modo conectar automaticamente! (Fica bem melhor a UX)
            setModo('conectar'); 
            return; 
        }
        
        if (modoAtual === 'conectar') {
            gerenciarConexao(el);
        }
    });

    // 6. BOTÃO DIREITO (Menu de PK e Entidade Fraca)
    el.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();

        if (tipo === 'atributo' || tipo === 'entidade' || tipo === 'relacionamento') {
            abrirMenuElemento(e.clientX, e.clientY, el, tipo);
        }
    });

    areaTrabalho.appendChild(el);
}

function removerElemento(el) {
    if (!confirm('Remover este elemento e todas as suas ligações?')) return;
    conexoes = conexoes.filter(c => c.el1 !== el && c.el2 !== el);
    el.remove();
    desenharLinhas();
}

function gerenciarConexao(elClicado) {
    if (!elementoSelecionadoParaConectar) {
        elementoSelecionadoParaConectar = elClicado;
        elClicado.classList.add('selecionado');
        return;
    }
    if (elementoSelecionadoParaConectar === elClicado) { desmarcar(); return; }

    const t1 = elementoSelecionadoParaConectar.getAttribute('data-tipo');
    const t2 = elClicado.getAttribute('data-tipo');

    // ======================================================
    // REGRA 1: VERIFICAÇÕES DE TIPO (Prioridade Alta)
    // ======================================================
    if (t1 === 'relacionamento' && t2 === 'relacionamento') {
        mostrarErro('⚠️ Não é permitido relacionamento entre relacionamentos!'); desmarcar(); return;
    }
    if (t1 === 'entidade' && t2 === 'entidade') {
        mostrarErro('⚠️ Entidades não se ligam direto! Adicione um Relacionamento.'); desmarcar(); return;
    }
    if (t1 === 'atributo' && t2 === 'atributo') {
        mostrarErro('⚠️ Atributos não se conectam entre si!'); desmarcar(); return;
    }

    // ======================================================
    // REGRA 2: LIGAÇÃO DUPLICADA
    // ======================================================
    const jaExiste = conexoes.some(c =>
        (c.el1 === elementoSelecionadoParaConectar && c.el2 === elClicado) ||
        (c.el1 === elClicado && c.el2 === elementoSelecionadoParaConectar)
    );
    if (jaExiste) { mostrarErro('⚠️ Esta ligação já existe!'); desmarcar(); return; }

    // ======================================================
    // REGRA 3: LIMITE DE CONEXÕES DO ATRIBUTO (Prioridade Baixa)
    // ======================================================
    const contarLinhas = (el) => conexoes.filter(c => c.el1 === el || c.el2 === el).length;

    if (t1 === 'atributo' && contarLinhas(elementoSelecionadoParaConectar) >= 1) {
        mostrarErro('⚠️ Este atributo já está conectado a outro elemento!');
        desmarcar(); return;
    }
    if (t2 === 'atributo' && contarLinhas(elClicado) >= 1) {
        mostrarErro('⚠️ Este atributo já está conectado a outro elemento!');
        desmarcar(); return;
    }

    // ======================================================
    // SUCESSO: Se passou em todas as regras, cria a conexão!
    // ======================================================
    conexoes.push({ id: 'con_' + contadorIds++, el1: elementoSelecionadoParaConectar, el2: elClicado, cardLado1: '', cardLado2: '' });
    desenharLinhas();
    desmarcar();
}

function desmarcar() {
    if (elementoSelecionadoParaConectar) {
        elementoSelecionadoParaConectar.classList.remove('selecionado');
        elementoSelecionadoParaConectar = null;
    }
}

// ==========================================
// 5. RENDERIZAÇÃO DE LINHAS (Funções Privadas)
// ==========================================
function desenharLinhas() {
    
    camadaLinhas.innerHTML = '';
    const pr = areaTrabalho.getBoundingClientRect();

    conexoes.forEach(con => {
        const r1 = con.el1.getBoundingClientRect();
        const r2 = con.el2.getBoundingClientRect();
        const x1 = r1.left - pr.left + r1.width / 2;
        const y1 = r1.top  - pr.top  + r1.height / 2;
        const x2 = r2.left - pr.left + r2.width / 2;
        const y2 = r2.top  - pr.top  + r2.height / 2;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // 1. A HITBOX (Grossa e transparente, para não errar o clique)
        const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hit.setAttribute('x1', x1); hit.setAttribute('y1', y1);
        hit.setAttribute('x2', x2); hit.setAttribute('y2', y2);
        hit.setAttribute('stroke', 'transparent'); 
        hit.setAttribute('stroke-width', '24'); // Bem grossa!
        hit.style.pointerEvents = 'stroke';
        hit.style.cursor = 'pointer';

        // 2. A LINHA VISÍVEL (A cinza que fica vermelha)
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
        ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
        ln.classList.add('linha-conexao');
        ln.style.pointerEvents = 'stroke';

        g.appendChild(hit);
        g.appendChild(ln);

        if (con.cardLado1) g.appendChild(criarTextoCard(x1,y1,x2,y2,con.cardLado1,'lado1'));
        if (con.cardLado2) g.appendChild(criarTextoCard(x1,y1,x2,y2,con.cardLado2,'lado2'));

        // 3. A MÁGICA DO CLIQUE INTELIGENTE
        const cliqueNaLinha = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (modoAtual === 'remover') {
                // Se a borracha estiver ligada, apaga a linha na hora!
                conexoes = conexoes.filter(c => c.id !== con.id);
                fecharMenu();
                desenharLinhas();
            } else {
                // Se estiver no modo conectar, abre o menu da cardinalidade
                conexaoContextual = con; 
                abrirMenu(e.clientX, e.clientY);
            }

        };

        // Colocamos o evento nas duas camadas para ter 100% de certeza
        hit.addEventListener('click', cliqueNaLinha);
        ln.addEventListener('click', cliqueNaLinha);
        
        camadaLinhas.appendChild(g);
    });
    
}

function criarTextoCard(x1,y1,x2,y2,texto,lado) {
    const t  = lado === 'lado1' ? 0.25 : 0.75;
    const cx = x1 + (x2-x1)*t, cy = y1 + (y2-y1)*t;
    const g  = document.createElementNS('http://www.w3.org/2000/svg','g');

    const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
    bg.setAttribute('x', cx-14); bg.setAttribute('y', cy-10);
    bg.setAttribute('width', 28); bg.setAttribute('height', 16);
    bg.setAttribute('rx', 3);
    bg.setAttribute('fill','white');
    bg.setAttribute('stroke','#c5cae9');
    bg.setAttribute('stroke-width','1');

    const tx = document.createElementNS('http://www.w3.org/2000/svg','text');
    tx.setAttribute('x', cx); tx.setAttribute('y', cy+4);
    tx.setAttribute('text-anchor','middle');
    tx.classList.add('texto-cardinalidade');
    tx.textContent = texto;

    g.appendChild(bg); g.appendChild(tx);
    return g;
}

// ==========================================
// 6. MENUS FLUTUANTES (Algumas exportadas para o HTML)
// ==========================================
function abrirMenu(cx, cy) {
    // Busca o menu fresquinho direto do HTML na hora do clique!
    const menu = document.getElementById('menuContextual');
    
    if (!menu) {
        alert("O HTML do menu não existe na página! Faça o Passo 2.");
        return;
    }
    
    menu.style.position = 'fixed'; 
    menu.style.display = 'block'; 
    menu.style.zIndex = '999999'; 
    menu.style.left = cx + 'px';
    menu.style.top  = cy + 'px';
    menu.classList.add('ativo');
}

export function fecharMenu() {
    const menu = document.getElementById('menuContextual');
    if (menu) {
        menu.style.display = 'none'; 
        menu.classList.remove('ativo');
    }
}
export function menuRemoverConexao() {
    if (!conexaoContextual) return;
    conexoes = conexoes.filter(c => c.id !== conexaoContextual.id);
    conexaoContextual = null;
    fecharMenu();
    desenharLinhas();
}

export function menuCardinalidade() {
    console.log("Iniciando menuCardinalidade...");
    
    if (!conexaoContextual) {
        alert("ERRO: O sistema esqueceu qual linha foi clicada! Tente clicar na linha de novo.");
        return;
    }

    const painelCard = document.getElementById('painelCardinalidade');
    if (!painelCard) {
        alert("ERRO: A div 'painelCardinalidade' não existe no HTML!");
        return;
    }

    // Salva a memória e fecha o menu pequeno
    conexaoEmEdicao = conexaoContextual;
    conexaoContextual = null;
    fecharMenu(); 

    // Marca os botões de azul
    cardSelecionado.lado1 = conexaoEmEdicao.cardLado1 || '';
    cardSelecionado.lado2 = conexaoEmEdicao.cardLado2 || '';

    ['lado1','lado2'].forEach(lado => {
        document.querySelectorAll(`#card-${lado} .card-op`).forEach(op => {
            op.classList.toggle('selecionado', op.textContent === cardSelecionado[lado]);
        });
    });

    // Força Bruta para Exibir
    painelCard.style.position = 'fixed';
    painelCard.style.display = 'block'; 
    painelCard.style.zIndex = '999999'; 
    painelCard.style.left = '50%';
    painelCard.style.top = '50%';
    painelCard.style.transform = 'translate(-50%, -50%)';
}
export function selecionarCard(el, lado, valor) {
    document.querySelectorAll(`#card-${lado} .card-op`).forEach(op => op.classList.remove('selecionado'));
    el.classList.add('selecionado');
    cardSelecionado[lado] = valor;
}

export function fecharCardinalidade() {
    // Salva as escolhas na memória da linha
    if (conexaoEmEdicao) {
        conexaoEmEdicao.cardLado1 = cardSelecionado.lado1;
        conexaoEmEdicao.cardLado2 = cardSelecionado.lado2;
        conexaoEmEdicao = null;
    }
    
    // Esconde o painel na força bruta
    const painelCard = document.getElementById('painelCardinalidade');
    if (painelCard) {
        painelCard.style.display = 'none'; 
    }
    
    // Redesenha as linhas para o 1,N aparecer na tela
    desenharLinhas();
}


// ==========================================
// 7. MENU DE ELEMENTOS (Chave Primária)
// ==========================================
let elementoContextual = null;

export function abrirMenuElemento(cx, cy, el, tipo) {
    elementoContextual = el;
    const menu = document.getElementById('menuContextualElemento');
    if (!menu) return;

    // Pega os botões
    const btnPK = document.getElementById('btnTornarPK');
    const btnEntFraca = document.getElementById('btnTornarEntidadeFraca');
    const btnRelFraco = document.getElementById('btnTornarRelFraco');

    // Esconde tudo primeiro
    btnPK.style.display = 'none';
    btnEntFraca.style.display = 'none';
    btnRelFraco.style.display = 'none';

    // Mostra só o botão certo e muda o texto se já estiver ativado (toggle)
    if (tipo === 'atributo') {
        btnPK.style.display = 'block';
        btnPK.innerHTML = el.classList.contains('is-pk') ? '<s>🔑 Remover Chave Primária</s>' : '🔑 Tornar Chave Primária';
    } else if (tipo === 'entidade') {
        btnEntFraca.style.display = 'block';
        btnEntFraca.innerHTML = el.classList.contains('is-fraca') ? '<s>⬛ Remover Entidade Fraca</s>' : '⬛ Tornar Entidade Fraca';
    } else if (tipo === 'relacionamento') {
        btnRelFraco.style.display = 'block';
        btnRelFraco.innerHTML = el.classList.contains('is-fraca') ? '<s>💎 Remover Rel. Identificador</s>' : '💎 Tornar Rel. Identificador';
    }

    // Exibe o menu
    menu.style.position = 'fixed';
    menu.style.display = 'block';
    menu.style.zIndex = '999999';
    menu.style.left = cx + 'px';
    menu.style.top  = cy + 'px';
}

// Essa função serve tanto para a Entidade quanto para o Relacionamento
export function menuTornarFraca() {
    if (elementoContextual) {
        elementoContextual.classList.toggle('is-fraca'); // Liga ou desliga a borda dupla
    }
    fecharMenuElemento();
}

export function fecharMenuElemento() {
    const menu = document.getElementById('menuContextualElemento');
    if(menu) menu.style.display = 'none';
}

export function menuTornarPK() {
    if (!elementoContextual) {
        fecharMenuElemento();
        return;
    }

    // 1. Se já é PK, o usuário só quer desmarcar (remover a chave)
    if (elementoContextual.classList.contains('is-pk')) {
        elementoContextual.classList.remove('is-pk');
        fecharMenuElemento();
        return;
    }

    // 2. Se não for PK, precisamos garantir que ele seja o ÚNICO da sua Entidade.
    // Primeiro, procuramos no array de conexoes se ele está ligado a alguma Entidade.
    let entidadeAlvo = null;
    
    for (let con of conexoes) { // NOTA: Verifique se o seu array de linhas chama 'conexoes' mesmo
        if (con.el1 === elementoContextual && con.el2.getAttribute('data-tipo') === 'entidade') {
            entidadeAlvo = con.el2;
            break;
        } else if (con.el2 === elementoContextual && con.el1.getAttribute('data-tipo') === 'entidade') {
            entidadeAlvo = con.el1;
            break;
        }
    }

    // 3. Se ele estiver conectado a uma Entidade, vamos caçar os "irmãos" dele
    if (entidadeAlvo) {
        for (let con of conexoes) {
            let outroAtributo = null;
            
            // Descobre se a entidadeAlvo tem outros atributos ligados a ela
            if (con.el1 === entidadeAlvo && con.el2.getAttribute('data-tipo') === 'atributo') {
                outroAtributo = con.el2;
            } else if (con.el2 === entidadeAlvo && con.el1.getAttribute('data-tipo') === 'atributo') {
                outroAtributo = con.el1;
            }

            // Se achou um irmão (e não é o atributo que acabamos de clicar), arranca a PK dele!
            if (outroAtributo && outroAtributo !== elementoContextual) {
                outroAtributo.classList.remove('is-pk');
            }
        }
    }

    // 4. Finalmente, coroa o atributo atual como a nova Chave Primária
    elementoContextual.classList.add('is-pk');
    
    fecharMenuElemento();
}

function mostrarTelaFim() {
    const telaFim = document.createElement('div');
    telaFim.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #1a1a2e;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        z-index: 9999999; color: white; text-align: center;
    `;
    telaFim.innerHTML = `
        <img src="arara_venceu.png" style="width:180px; margin-bottom:30px;">
        <h1 style="font-size:3rem; letter-spacing:4px; margin-bottom:16px;">🎬 FIM DE GRAVAÇÃO!</h1>
        <p style="font-size:1.2rem; color:#a8b2d1; margin-bottom:40px;">
            Você dominou o MER! O diretor está orgulhoso.
        </p>
        <button onclick="location.reload()" style="
            background:#e94560; color:white; border:none;
            padding:14px 36px; font-size:1.2rem; font-weight:bold;
            border-radius:30px; cursor:pointer;
        ">↩ Jogar Novamente</button>
    `;
    document.body.appendChild(telaFim);
}