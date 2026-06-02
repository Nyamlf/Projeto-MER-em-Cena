# MER em Cena: Plataforma Interativa para Aprendizagem de Modelagem de Banco de Dados

Este repositório contém o código-fonte (MVP) da plataforma **MER em Cena**, uma ferramenta educacional desenvolvida para apoiar estudantes de Computação na aprendizagem de modelagem conceitual em Banco de Dados.

## Acessar a Plataforma (Teste)
O protótipo funcional da plataforma encontra-se hospedado e disponível para uso, testes e avaliação de interface.
**[https://6a175ab5debfe12c1e9cef15--elegant-sable-a72374.netlify.app/](https://6a175ab5debfe12c1e9cef15--elegant-sable-a72374.netlify.app/)**

## Sobre o Projeto
O desenvolvimento desta ferramenta foi motivado pela identificação empírica de que a maior barreira para estudantes iniciantes não é a notação gráfica em si, mas a interpretação do mini-mundo — a etapa de extração de requisitos a partir de enunciados textuais. 

Fundamentada na Teoria da Aprendizagem Significativa (Ausubel) e na Teoria da Carga Cognitiva (Sweller), a plataforma atua como um ambiente guiado que reduz a complexidade da abstração por meio de estratégias de mitigação de carga cognitiva.

## Principais Funcionalidades
* **Contextualização Narrativa:** Cenários apresentados através de narrativas imersivas para a ativação de subsunçores.
* **Split-Layout e Destaque Visual:** O design de tela dividida permite a leitura do mini-mundo e a construção do diagrama simultaneamente. *Tags* coloridas no texto auxiliam o pareamento cognitivo de entidades e relacionamentos.
* **Feedback Pedagógico em Tempo Real:** Um Tutor Baseado em Restrições, materializado no NPC "Mascote Diretor", impede conexões sintaticamente inválidas e fornece alertas visuais corretivos imediatos durante a mecânica de modelagem.

## Arquitetura e Tecnologias
O MVP foi construído visando leveza e alta acessibilidade em laboratórios educacionais, sem dependência de frameworks pesados:
* **HTML5 & CSS3:** Estrutura semântica e sistema de cores planejado para o design instrucional.
* **Vanilla JavaScript:** Gerenciamento de estado (MVC), motor de *drag-and-drop* e renderização dinâmica de conexões via vetores SVG.

## Diretrizes de Anonimização (Double-Blind Review)
Em rigorosa conformidade com as diretrizes de avaliação cega por pares (double-blind review) adotadas por simpósios científicos, todas as informações sensíveis, nomes de autores, orientadores ou instituições de ensino foram inteiramente removidas do código-fonte e deste documento.
