// ui.js
import { cenarios } from './cenarios.js';

const somErro = new Audio('script/audios/erro.wav'); 
somErro.volume = 1.0;

// ==========================================
// 1. CARREGAR CENÁRIO (Texto, Mascote e VÍDEO)
// ==========================================



export function carregarCenario(id) {
    const cenario = cenarios[id];
    const containerCenario = document.getElementById("textoCenario");
    const textoMascote = document.querySelector(".balao-fala p");
    const balaoMascote = document.querySelector(".balao-fala");
    const videoCenario = document.getElementById("videoCenario");

    if (!containerCenario || !cenario) return;

    // Faz o fade-out de tudo
    containerCenario.style.opacity = '0';
    if (textoMascote) textoMascote.style.opacity = '0';
    if (videoCenario) {
        videoCenario.style.opacity = '0';
        videoCenario.style.transition = 'opacity 0.2s ease-in-out';
    }

    setTimeout(() => {
        // Atualiza textos
        containerCenario.innerHTML = cenario.texto + `<div class="dica">${cenario.dica}</div>`;
        if (textoMascote) {
            textoMascote.innerText = cenario.falaMascote || "Continue assim!";
            if (balaoMascote) balaoMascote.setAttribute('data-fala-original', textoMascote.innerText);
        }

        // TROCA O VÍDEO
        if (videoCenario && cenario.video) {
            videoCenario.src = cenario.video;
            videoCenario.load(); // Força o navegador a puxar o novo arquivo
        }

        // Faz o fade-in de tudo
        containerCenario.style.opacity = '1';
        if (textoMascote) textoMascote.style.opacity = '1';
        if (videoCenario) videoCenario.style.opacity = '1';
    }, 200);
}
// ==========================================
// 2. FAIXA VERMELHA (Regras do MER)
// ==========================================
export function mostrarErro(msg) {
    if (somErro) {
        somErro.pause();
        somErro.currentTime = 0;
        somErro.play().catch(e => console.warn("Áudio aguardando interação inicial:", e));
    }

    const alertaErro = document.getElementById('alertaErro');
    if (alertaErro) {
        alertaErro.textContent = msg;
        alertaErro.style.display = 'block';
        clearTimeout(mostrarErro._t);
        mostrarErro._t = setTimeout(() => alertaErro.style.display = 'none', 4000);
    }
}

// ==========================================
// 3. PROFESSOR PINGUIM (Dicas e Vitória)
// ==========================================
export function mostrarDicaMascote(msg, tipo = 'atencao') {
    const balaoMascote = document.querySelector('.balao-fala');
    const textoMascote = document.querySelector('.balao-fala p');
    const imagemMascote = document.querySelector('.imagem-mascote');
    
    if (balaoMascote && textoMascote) {
        if (!balaoMascote.hasAttribute('data-fala-original')) {
            balaoMascote.setAttribute('data-fala-original', textoMascote.innerText);
        }

        if (imagemMascote) {
            if (tipo === 'atencao') {
                imagemMascote.src = 'arara_erro.png'; // imagem de susto/alerta
            } else if (tipo === 'sucesso') {
                imagemMascote.src = 'arara_feliz.png';      // imagem de comemoração
            } else if (tipo === 'vitoria') {
                imagemMascote.src = 'arara_venceu.png';    // imagem de vitória
            }
        }

        // Estilos e Formatações
        if (tipo === 'atencao') {
            balaoMascote.style.borderColor = '#f59e0b'; // Laranja
            balaoMascote.style.backgroundColor = '#fffbeb';
            textoMascote.innerHTML = `<strong>Ops!</strong> ${msg}`;
        } else if (tipo === 'sucesso') {
            balaoMascote.style.borderColor = '#10b981'; // Verde
            balaoMascote.style.backgroundColor = '#ecfdf5';
            textoMascote.innerHTML = `<strong>Fantástico!</strong> ${msg}`;
        } else if (tipo === 'vitoria') {
            balaoMascote.style.borderColor = '#10b981'; // Verde
            balaoMascote.style.backgroundColor = '#ecfdf5';
            textoMascote.innerHTML = msg; // Recebe o botão de avançar direto do editor.js
        }

        clearTimeout(mostrarDicaMascote._t);
        
        // Regra de Ouro: Se for Vitória, NÃO APAGA o balão! Fica esperando o clique.
        if (tipo !== 'vitoria') {
            mostrarDicaMascote._t = setTimeout(() => {
                balaoMascote.style.borderColor = '#e2e8f0';
                balaoMascote.style.backgroundColor = 'white';
                textoMascote.innerText = balaoMascote.getAttribute('data-fala-original');

                if (imagemMascote) imagemMascote.src = 'arara_estudante.png'; // 👈 restaura
            }, 6000);

        }
    }
}