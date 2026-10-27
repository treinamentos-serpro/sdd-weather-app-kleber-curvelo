# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa solicitou um site responsivo para que usuários consultem informações meteorológicas de localidades em um navegador. A experiência deve permitir buscar manualmente uma localidade, ver as condições atuais e a previsão para cinco dias, alternar entre Celsius e Fahrenheit e usar o produto em dispositivos móveis e desktops. O site será publicado no GitHub Pages.

O briefing define as capacidades principais e algumas decisões de escopo. Ainda precisam ser definidos detalhes como quais informações meteorológicas devem ser exibidas e os critérios de desempenho, acessibilidade e compatibilidade.

## Requisitos Funcionais

- **RF1 — Buscar localidades:** permitir que o usuário pesquise manualmente uma localidade e consultar o primeiro resultado apresentado quando houver localidades iguais.
- **RF2 — Consultar clima atual:** exibir as condições meteorológicas atuais da localidade selecionada.
- **RF3 — Consultar previsão:** exibir a previsão para um período de cinco dias.
- **RF4 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e refletir a unidade escolhida nos valores apresentados.
- **RF5 — Site responsivo:** disponibilizar as funcionalidades principais em navegadores de dispositivos móveis e desktops, com interface responsiva.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a interface deve se adaptar a dispositivos móveis; dimensões de tela e critérios específicos ainda precisam ser definidos.
- **RNF2 — Usabilidade:** busca, consulta da previsão e alternância de unidades devem ser compreensíveis e acessíveis ao usuário.
- **RNF3 — Resiliência:** o comportamento diante de falhas de rede ou indisponibilidade da fonte de dados deve ser definido para evitar uma experiência confusa.
- **RNF4 — Desempenho:** o tempo aceitável para buscar localidades e carregar dados meteorológicos precisa ser acordado.
- **RNF5 — Acessibilidade:** requisitos de navegação por teclado, leitores de tela e contraste devem ser definidos.

## Personas

> Personas preliminares, baseadas no briefing; devem ser validadas com usuários reais.

### 1. Pessoa que decide a rotina do dia

- **Objetivo principal:** consultar rapidamente as condições atuais para decidir o que vestir ou se precisa levar guarda-chuva.
- **Contexto de uso:** principalmente mobile, em momentos curtos antes de sair de casa ou durante deslocamentos.
- **Métrica de sucesso para a persona:** consegue encontrar sua cidade e entender as condições relevantes em uma única consulta, sem precisar recorrer a outra fonte.

### 2. Viajante que planeja os próximos dias

- **Objetivo principal:** verificar o clima de uma cidade de destino para planejar atividades, roupas e itens para levar.
- **Contexto de uso:** desktop para comparar e planejar com antecedência; mobile para consultar novamente durante a viagem.
- **Métrica de sucesso para a persona:** consegue consultar a previsão de cinco dias para o destino e identificar rapidamente as condições de cada dia.

### 3. Pessoa que trabalha ou realiza atividades ao ar livre

- **Objetivo principal:** avaliar as condições do tempo antes de organizar atividades externas e ajustar seus planos quando necessário.
- **Contexto de uso:** mobile, frequentemente em movimento; pode consultar a previsão de cinco dias antes e verificar o clima atual no local.
- **Métrica de sucesso para a persona:** encontra a localidade correta e obtém informação atual e previsão legíveis o suficiente para decidir se mantém ou altera seus planos.

## Riscos
| Tipo | Risco | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Técnico | Indisponibilidade, limite de requisições ou mudança na API meteorológica | Média | Alto — consultas podem falhar ou ficar indisponíveis. | Confirmar limites e condições de uso do Open-Meteo; tratar falhas com mensagens claras e opção de tentar novamente. Cache de dados meteorológicos não faz parte do escopo atual. |
| Técnico | Dados ausentes, desatualizados ou com cobertura geográfica insuficiente | Média | Alto — o usuário pode receber informações incompletas ou não encontrar sua cidade. | Validar cobertura para as regiões prioritárias; informar quando os dados foram atualizados; definir comportamento para campos indisponíveis. |
| Técnico | Resultados incorretos para localidades homônimas | Média | Alto — a previsão exibida pode corresponder a outra localidade. | Selecionar o primeiro resultado apresentado e exibir a identificação disponível da localidade; permitir que o usuário faça uma nova busca. |
| Técnico | Conversão ou formatação incorreta de Celsius/Fahrenheit | Baixa | Alto — temperaturas erradas podem comprometer decisões do usuário. | Definir claramente quais valores mudam de unidade; centralizar a conversão e cobrir os casos com testes. |
| Técnico | Desempenho ruim em redes lentas ou dispositivos móveis | Média | Médio/alto — pode dificultar a busca e a leitura da previsão. | Estabelecer metas de desempenho; otimizar carregamento e requisições; testar em dispositivos e condições de rede representativos. |
| Técnico | Falhas de acessibilidade ou compatibilidade com navegadores e telas | Média | Médio/alto — parte dos usuários pode não conseguir usar funções essenciais. | Definir navegadores e requisitos de acessibilidade; validar teclado, leitores de tela, contraste e telas pequenas durante o desenvolvimento. |
| Produto | Escopo ambíguo dos dados do clima atual e da previsão de cinco dias | Alta | Alto — equipe e usuários podem esperar conteúdos diferentes. | Validar quais dados devem ser exibidos e transformar a decisão de período em critérios de aceite. |
| Produto | Busca não atende às necessidades reais dos usuários | Média | Alto — usuários podem não encontrar localidades ou selecionar a localidade errada. | Validar formato de busca, apresentação dos resultados e cobertura com usuários e localidades prioritárias; tornar a localidade consultada identificável. |
| Produto | Experiência móvel não corresponde às expectativas | Média | Alto — as funcionalidades principais podem ser difíceis de usar em telas menores. | Tratar o produto como site responsivo e validar os fluxos principais em telas móveis desde o início. |
| Produto | Expectativa de funcionalidades fora do escopo, como localização automática ou favoritos | Média | Médio/alto — pode gerar insatisfação ou expansão de escopo tardia. | Comunicar explicitamente o escopo do lançamento e validar expectativas com usuários e stakeholders. |
| Produto | Previsões interpretadas como garantias, apesar da incerteza meteorológica | Média | Médio/alto — pode reduzir a confiança no produto quando a previsão divergir das condições reais. | Exibir horários de atualização e apresentar a previsão como estimativa; evitar comunicar precisão que a fonte não assegura. |
| Produto | Formatos regionais ou cobertura geográfica inadequados ao público | Média | Médio — dados podem ser difíceis de interpretar ou cidades relevantes podem não estar disponíveis. | Definir regiões prioritárias e formatos de data e hora; validar a cobertura do Open-Meteo para esse público. |

## Perguntas em Aberto

1. Quais informações devem aparecer no clima atual e em cada dia da previsão?
2. Quais regiões devem ser suportadas e qual identificação da localidade deve ser exibida nos resultados e na consulta?
3. Como a aplicação deve se comportar diante de busca sem resultados, falha de rede, timeout, indisponibilidade da fonte ou dados incompletos?
4. Quais critérios de desempenho, acessibilidade e compatibilidade com navegadores devem ser atendidos?

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Definida para fornecer geocodificação e dados meteorológicos sem exigir uma chave de API. Limites, cobertura e condições de uso ainda devem ser considerados.
- **Período da previsão: hoje mais os quatro dias seguintes.** Torna explícito como contar os cinco dias e resolve a ambiguidade sobre a inclusão do dia atual.
- **Unidade padrão: Celsius.** Define a unidade apresentada inicialmente; a preferência não será persistida entre acessos.
- **Sem autenticação ou persistência.** Não haverá contas, persistência de dados em servidor nem persistência local de preferências ou localidades consultadas.
- **Consulta manual.** O usuário sempre inicia a consulta por busca manual; localização do dispositivo não será utilizada.
- **Desambiguação por ordem dos resultados.** Quando houver resultados iguais, será usado o primeiro resultado apresentado pela busca, sem etapa adicional de confirmação.
- **Plataforma e publicação: site responsivo no navegador, hospedado no GitHub Pages.** Não serão desenvolvidos aplicativo nativo nem app instalável neste escopo.
- **Sem cache de dados meteorológicos.** Cache e suporte offline não fazem parte do escopo atual.
- **Idioma da interface: pt-BR.** Define o idioma dos textos da interface; a cobertura geográfica continua em aberto.

## Suposições

- A busca manual por localidade é o único meio de iniciar uma consulta; não será usada localização automática.
- A aplicação será um site responsivo acessado pelo navegador e publicado no GitHub Pages.
- O primeiro resultado apresentado será usado quando a busca retornar localidades iguais; a identificação visível da localidade deve ajudar o usuário a reconhecer o resultado consultado.
- Não haverá autenticação, persistência local ou em servidor, cache de dados meteorológicos nem suporte offline neste escopo.
- O Open-Meteo atende às necessidades iniciais de consulta, sujeito à validação de cobertura, limites e condições de uso.
- A unidade inicial é Celsius e a previsão cobre hoje e os quatro dias seguintes; campos meteorológicos e demais detalhes não definidos permanecem em aberto até validação.
