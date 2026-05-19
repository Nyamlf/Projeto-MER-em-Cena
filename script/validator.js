export function validarCenario(idCenario, elementosAtuais, conexoesAtuais) {
    let erros = [];

    // ==========================================
    // FUNÇÕES AUXILIARES
    // ==========================================

    const nomesCanvas = Array.from(elementosAtuais).map(el => el.textContent.trim().toUpperCase());
    const temElemento = (nome) => nomesCanvas.includes(nome);
    const contarTipo = (tipo) => Array.from(elementosAtuais).filter(el => el.getAttribute('data-tipo') === tipo).length;

    const obterCardDaLigacao = (nomeEntidade, nomeRelacionamento) => {
        const con = conexoesAtuais.find(c => {
            const n1 = c.el1.textContent.trim().toUpperCase();
            const n2 = c.el2.textContent.trim().toUpperCase();
            return (n1 === nomeEntidade && n2 === nomeRelacionamento) ||
                   (n1 === nomeRelacionamento && n2 === nomeEntidade);
        });
        if (!con) return null;
        return (con.el1.textContent.trim().toUpperCase() === nomeEntidade) ? con.cardLado1 : con.cardLado2;
    };

    const contarAtributosDaEntidade = (nomeEntidade, nomeAtributo) => {
        const entidade = Array.from(elementosAtuais).find(e =>
            e.textContent.trim().toUpperCase() === nomeEntidade &&
            e.getAttribute('data-tipo') === 'entidade'
        );
        if (!entidade) return 0;
        return conexoesAtuais.filter(con => {
            const outro = (con.el1 === entidade) ? con.el2 : (con.el2 === entidade ? con.el1 : null);
            return outro &&
                   outro.getAttribute('data-tipo') === 'atributo' &&
                   outro.textContent.trim().toUpperCase() === nomeAtributo;
        }).length;
    };

    const entidadeTemAtributo = (nomeEntidade, nomeAtributo) =>
        contarAtributosDaEntidade(nomeEntidade, nomeAtributo) > 0;

    const contarAtributosDaRelacao = (nomeRelacao, nomeAtributo) => {
        const relacao = Array.from(elementosAtuais).find(e =>
            e.textContent.trim().toUpperCase() === nomeRelacao &&
            e.getAttribute('data-tipo') === 'relacionamento'
        );
        if (!relacao) return 0;
        return conexoesAtuais.filter(con => {
            const outro = (con.el1 === relacao) ? con.el2 : (con.el2 === relacao ? con.el1 : null);
            return outro &&
                   outro.getAttribute('data-tipo') === 'atributo' &&
                   outro.textContent.trim().toUpperCase() === nomeAtributo;
        }).length;
    };

    const relacaoTemAtributo = (nomeRelacao, nomeAtributo) =>
        contarAtributosDaRelacao(nomeRelacao, nomeAtributo) > 0;

    // Verifica se um atributo está ligado a uma entidade específica E não a outra
    const atributoEhExclusivoDE = (nomeAtributo, nomeEntidadeDona, nomeEntidadeOutra) => {
        const ligadoADona = entidadeTemAtributo(nomeEntidadeDona, nomeAtributo);
        const ligadoAOutra = entidadeTemAtributo(nomeEntidadeOutra, nomeAtributo);
        return ligadoADona && !ligadoAOutra;
    };

    // ==========================================
    // REGRAS GLOBAIS DE HIGIENE
    // ==========================================
    if (temElemento('ENTIDADE') || temElemento('ATRIBUTO') || temElemento('RELACIONAMENTO')) {
        erros.push("Corta! Você deixou formas com nome padrão no quadro. Renomeie com duplo clique ou apague-as!");
        return { valido: false, erros };
    }

    if (elementosAtuais.length > 1) {
        const elementosConectados = new Set();
        conexoesAtuais.forEach(con => {
            elementosConectados.add(con.el1);
            elementosConectados.add(con.el2);
        });
        const temPecaSolta = Array.from(elementosAtuais).some(el => !elementosConectados.has(el));
        if (temPecaSolta) {
            erros.push("Existem elementos soltos pelo quadro! Tudo precisa estar conectado antes de gravar a cena.");
            return { valido: false, erros };
        }
    }

    // ==========================================
    // CENA 1.1: Entidades e Atributos
    // Exige: PACIENTE e MÉDICO com NOME, TELEFONE e ENDEREÇO (Paciente) e ESPECIALIDADE (Médico)
    // Proíbe: atributos compartilhados entre entidades
    // ==========================================
    if (idCenario === 1) {
        if (temElemento('HELENA') || temElemento('ANA') || temElemento('MARIA')) {
            erros.push("Estamos nomeando tipos, não indivíduos. Pense de forma geral!");
            return { valido: false, erros };
        }
        if (temElemento('PESSOA') || temElemento('PESSOAS')) {
            erros.push("Muito amplo! Pacientes e médicos têm papéis diferentes no hospital.");
            return { valido: false, erros };
        }
        if (!temElemento('PACIENTE') || !temElemento('MEDICO')) {
            erros.push("Faltam as entidades principais. Qual é o papel oficial dessas pessoas no hospital?");
            return { valido: false, erros };
        }

        // Verifica atributos obrigatórios de PACIENTE
        const atributosPaciente = ['NOME', 'TELEFONE', 'RUA', 'NUMERO', 'BAIRRO'];
        for (const attr of atributosPaciente) {
            if (!entidadeTemAtributo('PACIENTE', attr)) {
                erros.push(`A entidade PACIENTE precisa do atributo ${attr} conectado a ela.`);
                return { valido: false, erros };
            }
        }

        // Verifica atributos obrigatórios de MÉDICO
        const atributosMedico = ['NOME', 'TELEFONE', 'ESPECIALIDADE'];
        for (const attr of atributosMedico) {
            if (!entidadeTemAtributo('MEDICO', attr)) {
                erros.push(`A entidade MÉDICO precisa do atributo ${attr} conectado a ela.`);
                return { valido: false, erros };
            }
        }

        // Proíbe atributos compartilhados: NOME ligado às duas entidades ao mesmo tempo
        const atributosCompartilhados = ['NOME', 'TELEFONE'];
        for (const attr of atributosCompartilhados) {
            const emPaciente = entidadeTemAtributo('PACIENTE', attr);
            const emMedico = entidadeTemAtributo('MEDICO', attr);
            if (emPaciente && emMedico) {
                // Checa se é o MESMO elemento ou dois separados
                const elsPaciente = conexoesAtuais.filter(c => {
                    const entEl = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'PACIENTE');
                    const outro = c.el1 === entEl ? c.el2 : c.el2 === entEl ? c.el1 : null;
                    return outro && outro.textContent.trim().toUpperCase() === attr;
                }).map(c => {
                    const entEl = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'PACIENTE');
                    return c.el1 === entEl ? c.el2 : c.el1;
                });
                const elsMedico = conexoesAtuais.filter(c => {
                    const entEl = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'MEDICO');
                    const outro = c.el1 === entEl ? c.el2 : c.el2 === entEl ? c.el1 : null;
                    return outro && outro.textContent.trim().toUpperCase() === attr;
                }).map(c => {
                    const entEl = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'MEDICO');
                    return c.el1 === entEl ? c.el2 : c.el1;
                });

                const compartilhado = elsPaciente.some(el => elsMedico.includes(el));
                if (compartilhado) {
                    erros.push(`O atributo ${attr} está sendo compartilhado entre PACIENTE e MEDICO! Cada entidade precisa do seu próprio ${attr}.`);
                    return { valido: false, erros };
                }
            }
        }

        // Verifica duplicatas
        for (const attr of atributosPaciente) {
            if (contarAtributosDaEntidade('PACIENTE', attr) > 1) {
                erros.push(`A entidade PACIENTE tem o atributo ${attr} repetido!`);
                return { valido: false, erros };
            }
        }
        for (const attr of atributosMedico) {
            if (contarAtributosDaEntidade('MEDICO', attr) > 1) {
                erros.push(`A entidade MEDICO tem o atributo ${attr} repetido!`);
                return { valido: false, erros };
            }
        }
    }

    // ==========================================
    // CENA 1.2: Chave Primária
    // Exige: tudo da cena 1.1 + CPF (Paciente) + CRM (Médico) + DATA_NASCIMENTO (Paciente)
    // ==========================================
    if (idCenario === 2) {
        // Deve manter atributos anteriores
        const atributosPaciente = ['NOME', 'TELEFONE', 'RUA', 'NUMERO', 'BAIRRO', 'DATA_NASCIMENTO'];
        for (const attr of atributosPaciente) {
            if (!entidadeTemAtributo('PACIENTE', attr)) {
                erros.push(`Não apague o progresso! A PACIENTE ainda precisa de ${attr}.`);
                return { valido: false, erros };
            }
        }

        const atributosMedico = ['NOME', 'TELEFONE', 'ESPECIALIDADE'];
        for (const attr of atributosMedico) {
            if (!entidadeTemAtributo('MEDICO', attr)) {
                erros.push(`Não apague o progresso! O MEDICO ainda precisa de ${attr}.`);
                return { valido: false, erros };
            }
        }

        // Verifica CPF
        if (!temElemento('CPF')) {
            erros.push("A PACIENTE precisa de um identificador único. Adicione o atributo CPF.");
            return { valido: false, erros };
        }
        if (!entidadeTemAtributo('PACIENTE', 'CPF')) {
            erros.push("O CPF existe, mas não está ligado à PACIENTE! Conecte-os.");
            return { valido: false, erros };
        }

        // Verifica CRM
        if (!temElemento('CRM')) {
            erros.push("O MEDICO precisa de um identificador único. Adicione o atributo CRM.");
            return { valido: false, erros };
        }
        if (!entidadeTemAtributo('MEDICO', 'CRM')) {
            erros.push("O CRM existe, mas não está ligado ao MEDICO! Conecte-os.");
            return { valido: false, erros };
        }

        // Verifica se estão marcados como PK
        const elCPF = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'CPF');
        const elCRM = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'CRM');
        const elDataNasc = Array.from(elementosAtuais).find(e => e.textContent.trim().toUpperCase() === 'DATA_NASCIMENTO');

        if (elCPF && !elCPF.classList.contains('is-pk')) {
            erros.push("O CPF deve ser marcado como Chave Primária! Clique com o botão direito nele.");
            return { valido: false, erros };
        }
        if (elCRM && !elCRM.classList.contains('is-pk')) {
            erros.push("O CRM deve ser marcado como Chave Primária do Médico!");
            return { valido: false, erros };
        }
        // Garante que DATA_NASCIMENTO NÃO seja PK
        if (elDataNasc && elDataNasc.classList.contains('is-pk')) {
            erros.push("DATA_NASCIMENTO não deve ser Chave Primária! Apenas CPF identifica unicamente a paciente.");
            return { valido: false, erros };
        }
    }

    // ==========================================
    // CENA 2.1: Relacionamentos
    // Exige: relacionamento com verbo correto + atributo DATA na relação
    // ==========================================
    if (idCenario === 3) {
        if (contarTipo('relacionamento') === 0) {
            erros.push("Falta o relacionamento! Arraste o losango para o canvas.");
            return { valido: false, erros };
        }

        const verbosProibidos = ['SALA', 'MACA', 'PRONTUARIO', 'FAZ', 'TEM', 'VAI', 'USA'];
        for (const v of verbosProibidos) {
            if (temElemento(v)) {
                erros.push(`"${v}" não representa uma ação entre pessoas. Use um verbo como CONSULTA ou ATENDE.`);
                return { valido: false, erros };
            }
        }

        if (!temElemento('CONSULTA') && !temElemento('ATENDE')) {
            erros.push("O relacionamento precisa de um nome que represente a ação. Tente CONSULTA ou ATENDE.");
            return { valido: false, erros };
        }

        // Exige atributo DATA na relação
        const relNome = temElemento('CONSULTA') ? 'CONSULTA' : 'ATENDE';
        if (!relacaoTemAtributo(relNome, 'DATA')) {
            erros.push(`O relacionamento ${relNome} acontece em um momento específico. Adicione o atributo DATA a ele!`);
            return { valido: false, erros };
        }
    }

    // ==========================================
    // CENA 2.2: Cardinalidade 1:N
    // Exige: cardinalidade correta + todos os atributos anteriores preservados
    // ==========================================
    if (idCenario === 4) {
        // Verifica atributos acumulados
        if (!entidadeTemAtributo('PACIENTE', 'CPF') || !entidadeTemAtributo('PACIENTE', 'NOME')) {
            erros.push("Você removeu atributos importantes da PACIENTE! Mantenha o que foi construído nas cenas anteriores.");
            return { valido: false, erros };
        }
        if (!entidadeTemAtributo('MEDICO', 'CRM') || !entidadeTemAtributo('MEDICO', 'NOME')) {
            erros.push("Você removeu atributos importantes do MÉDICO! Mantenha o que foi construído nas cenas anteriores.");
            return { valido: false, erros };
        }

        const relNome = temElemento('CONSULTA') ? 'CONSULTA' : 'ATENDE';
        const cardMedico = obterCardDaLigacao('MEDICO', relNome);
        const cardPaciente = obterCardDaLigacao('PACIENTE', relNome);

        if (!cardMedico || !cardPaciente) {
            erros.push("Defina as cardinalidades clicando nas linhas que ligam as entidades ao relacionamento!");
            return { valido: false, erros };
        }
        if (cardPaciente === '1' && cardMedico === '1') {
            erros.push("Um médico atende apenas uma paciente na vida inteira? Pense no volume de atendimentos.");
            return { valido: false, erros };
        }
        if (cardPaciente === 'N' && cardMedico === '1') {
            erros.push("Você inverteu! Quantos médicos atendem a Helena neste exato momento?");
            return { valido: false, erros };
        }
        if (cardPaciente === 'N' && cardMedico === 'N') {
            erros.push("Foque no momento exato da consulta. Uma paciente está com quantos médicos agora?");
            return { valido: false, erros };
        }
    }

    // ==========================================
    // CENA 3.1: Cardinalidade N:M
    // Exige: cardinalidade N:N + atributo SALA no relacionamento
    // ==========================================
    if (idCenario === 5) {
        const relNome = temElemento('PARTO') ? 'PARTO' : temElemento('ATENDE') ? 'ATENDE' : 'CONSULTA';

        const cardMedico = obterCardDaLigacao('MEDICO', relNome);
        const cardPaciente = obterCardDaLigacao('PACIENTE', relNome);

        if (!cardMedico || !cardPaciente) {
            erros.push("O sistema precisa saber quantos participam do parto simultaneamente. Defina as cardinalidades!");
            return { valido: false, erros };
        }
        if (cardMedico === '1' || cardPaciente === '1') {
            erros.push("Há vários médicos na sala de parto! É uma relação de muitos para muitos.");
            return { valido: false, erros };
        }

        // Exige atributo SALA no relacionamento
        if (!relacaoTemAtributo(relNome, 'SALA')) {
            erros.push(`O parto acontece em algum lugar! Adicione o atributo SALA ao relacionamento ${relNome}.`);
            return { valido: false, erros };
        }
    }

    // ==========================================
    // CENA 3.2: Entidade Forte vs Fraca
    // Exige: ACOMPANHANTE fraca com atributos NOME e PARENTESCO
    //        BEBÊ forte com atributos NOME e DATA_NASCIMENTO
    //        Relacionamento identificador
    // ==========================================
    if (idCenario === 6) {
        // Verifica BEBÊ
        if (!temElemento('BEBÊ') && !temElemento('BEBE')) {
            erros.push("O bebê nasceu! Adicione a entidade BEBÊ ao diagrama.");
            return { valido: false, erros };
        }
        const nomeBebeNoCanvas = temElemento('BEBÊ') ? 'BEBÊ' : 'BEBE';

        const atributosBebeObrigatorios = ['NOME', 'DATA_NASCIMENTO'];
        for (const attr of atributosBebeObrigatorios) {
            if (!entidadeTemAtributo(nomeBebeNoCanvas, attr)) {
                erros.push(`O ${nomeBebeNoCanvas} precisa do atributo ${attr}. Adicione e conecte!`);
                return { valido: false, erros };
            }
        }

        // Verifica ACOMPANHANTE
        if (!temElemento('ACOMPANHANTE')) {
            erros.push("Adicione a entidade ACOMPANHANTE ao diagrama.");
            return { valido: false, erros };
        }

        const elAcompanhante = Array.from(elementosAtuais).find(e =>
            e.textContent.trim().toUpperCase() === 'ACOMPANHANTE'
        );

        // Verifica atributos do ACOMPANHANTE
        const atributosAcompObrigatorios = ['NOME', 'PARENTESCO'];
        for (const attr of atributosAcompObrigatorios) {
            if (!entidadeTemAtributo('ACOMPANHANTE', attr)) {
                erros.push(`O ACOMPANHANTE precisa do atributo ${attr}. Adicione e conecte!`);
                return { valido: false, erros };
            }
        }

        // Verifica se ACOMPANHANTE está marcado como fraca
        if (elAcompanhante && !elAcompanhante.classList.contains('is-fraca')) {
            erros.push("O ACOMPANHANTE só existe vinculado a uma PACIENTE. Marque-o como Entidade Fraca!");
            return { valido: false, erros };
        }

        // Verifica se existe relacionamento identificador
        const relIdentificador = Array.from(elementosAtuais).some(e =>
            e.getAttribute('data-tipo') === 'relacionamento' && e.classList.contains('is-fraca')
        );
        if (elAcompanhante?.classList.contains('is-fraca') && !relIdentificador) {
            erros.push("Ótimo! Agora marque o Relacionamento que liga ACOMPANHANTE à PACIENTE como Identificador.");
            return { valido: false, erros };
        }

        // Verifica que BEBÊ não está marcado como fraca (é entidade forte)
        const elBebe = Array.from(elementosAtuais).find(e =>
            e.textContent.trim().toUpperCase() === nomeBebeNoCanvas
        );
        if (elBebe && elBebe.classList.contains('is-fraca')) {
            erros.push(`${nomeBebeNoCanvas} tem registro próprio e permanente no hospital. Ele é uma Entidade FORTE, não fraca!`);
            return { valido: false, erros };
        }
    }

    return {
        valido: erros.length === 0,
        erros
    };
}