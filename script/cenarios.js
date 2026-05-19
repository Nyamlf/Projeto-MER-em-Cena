// cenarios.js
export const cenarios = {
    // === ATO I ===
    1: {
        video: "Cena_1_1.mp4",
        texto: `<p><strong>Cena 1.1 — Muitas Marias, um caderno enorme</strong></p>
            <p>A Maternidade São Lucas está informatizando seus registros. Dona Fátima, a recepcionista, tem na mesa um caderno enorme com duas seções: uma para <strong>PACIENTES</strong> e outra para <strong>MÉDICOS</strong>.</p>
            <p>Cada grupo tem suas próprias informações. As pacientes informam nome, telefone e onde moram — rua, número e bairro. Os médicos informam nome, telefone e sua área de atuação.</p>
            <p>O sistema precisa guardar exatamente isso — sem misturar o que é de um com o que é do outro.</p>`,
        dica: `Dica: Crie as duas entidades e conecte a cada uma apenas os atributos que lhe pertencem.
               <br>⚠️ Cada entidade deve ter seus <em>próprios</em> atributos — não compartilhe!`,
        falaMascote: "Ação! Cada ator tem seu próprio crachá. Não compartilhem!",
        ferramentasLiberadas: ['entidade', 'atributo']
    },
    2: {
        video: "Cena_1_2.mp4",
        texto: `<p><strong>Cena 1.2 — Três Marias, nenhuma certeza</strong></p>
            <p>A enfermeira Priscila precisa entregar um resultado de exame para Maria Souza — mas o sistema retornou três registros com o mesmo nome e o mesmo bairro.</p>
            <p>A solução está na pulseira da paciente internada: o <strong>CPF</strong>. Um número único, que não se repete e não muda. O Dr. Renato também lembra: todo médico tem um <strong>CRM</strong> que o identifica sem ambiguidade.</p>
            <p>Além disso, a <strong>data de nascimento</strong> da paciente entra no cadastro — ela ajuda a descrever quem é a pessoa, mas não serve como identificador único.</p>`,
        dica: `Dica: Precisamos de chaves primárias!`,
        falaMascote: "Nome se repete. CPF não. Qual desses você usaria para encontrar alguém?",
        ferramentasLiberadas: ['entidade', 'atributo']
    },

    // === ATO II ===
    3: {
        video: "Cena_2_1.mp4",
        texto: `<p><strong>Cena 2.1 — O que acontece entre elas?</strong></p>
            <p>O sistema sabe que a Dra. Beatriz existe. Sabe que Helena existe. Mas quando a médica abre a porta do Consultório 4 e as duas se encontram, o sistema não registra nada — porque ainda falta algo no modelo.</p>
            <p>A enfermeira Priscila preenche a ficha de atendimento: nome da médica, nome da paciente e a <strong>data</strong> do encontro. Mas essa data não pertence à Helena, nem à Dra. Beatriz — ela pertence ao evento entre as duas.</p>
            <p>Para registrar interações entre entidades, o MER usa um elemento específico, nomeado sempre com uma ação.</p>`,
        dica: `Dica: Esse relacionamento tem atributo!`,
        falaMascote: "Luzes! Câmera! Ação! E anote no roteiro quando essa cena acontece!",
        ferramentasLiberadas: ['entidade', 'atributo', 'relacionamento']
    },
    4: {
        video: "Cena_2_2.mp4",
        texto: `<p><strong>Cena 2.2 — Quem está na sala agora?</strong></p>
            <p>O coordenador Sr. Antônio aponta para o quadro de horários e faz duas perguntas simples:</p>
            <p>Neste momento exato, com a porta do Consultório 4 fechada — quantas médicas estão com Helena? <strong>Uma.</strong></p>
            <p>Ao longo da manhã, quantas pacientes a Dra. Beatriz vai atender? <strong>Várias.</strong></p>
            <p>A resposta muda dependendo do momento que você observa. E é exatamente essa proporção que o modelo precisa registrar.</p>`,
        dica: `<br>💡 Clique em cada linha para abrir o menu de cardinalidade`,
        falaMascote: "Uma coisa é o que acontece agora. Outra é o que acontece ao longo do tempo.",
        ferramentasLiberadas: ['entidade', 'atributo', 'relacionamento']
    },

    // === ATO III ===
    5: {
        video: "Cena_3_1.mp4",
        texto: `<p><strong>Cena 3.1 — Código Rosa</strong></p>
            <p>Madrugada. Alarme vermelho piscando no corredor. Parto de emergência na Sala 3. Três médicos entram juntos — Dr. Henrique, Dra. Lima e Dr. Paulo.</p>
            <p>Diferente de uma consulta, aqui vários profissionais atuam com uma mesma paciente ao mesmo tempo. E esses mesmos médicos já participaram de outros partos antes, em outras salas.</p>
            <p>A <strong>sala</strong> onde o parto aconteceu não pertence ao médico — ele já atuou em outras. Não pertence à paciente — ela não a escolheu. A sala pertence ao evento em si.</p>`,
        dica: `<br>💡 A sala pertence ao evento, não às pessoas!`,
        falaMascote: "Essa é uma cena de grupo! Todos participam — e anotem em qual sala estão gravando!",
        ferramentasLiberadas: ['entidade', 'atributo', 'relacionamento']
    },
    6: {
        video: "Cena_3_2.mp4",
        texto: `<p><strong>Cena 3.2 — Quem pode ficar sozinho?</strong></p>
            <p>Dois cadastros chegam ao sistema no mesmo dia. A enfermeira coloca uma pulseira no recém-nascido <strong>Pedro</strong> — ele recebe um registro próprio e permanente. Mesmo depois que a mãe tiver alta, o prontuário de Pedro continua ativo.</p>
            <p>Na recepção, Jorge se apresenta como acompanhante. Dona Fátima pergunta: <em>"Acompanhante de quem?"</em> — sem a paciente vinculada, o cadastro de Jorge não existe.</p>
            <p>Dois registros feitos no mesmo dia. Um existe por conta própria. O outro depende de alguém para fazer sentido.</p>`,
        dica: `⚠️ Temos duas novas entidades! uma delas é fraca.`,
        falaMascote: "Quem sobrevive no roteiro sozinho e quem depende de outro personagem para existir?",
        ferramentasLiberadas: ['entidade', 'atributo', 'relacionamento']
    }
};