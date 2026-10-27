# Backlog de implementação — Weather App

**Fonte:** [plano técnico](../plans/weather-app-plan.md) e
[especificação](../specs/weather-app-spec.md).

As tarefas estão organizadas por entrega e em ordem de dependência. Cada
tarefa limita sua implementação a um componente, função ou fluxo de teste
coeso; testes e implementação são tarefas distintas. As referências `FR`,
`AC` e `NFR` apontam para os identificadores da especificação.

## Entrega 1 — Contratos e funções puras

### T-01 — Definir os tipos do domínio meteorológico

- **Descrição:** Criar os contratos compartilhados de localidade, condição,
  condições atuais, previsão de cinco dias, unidade e estado da consulta.
- **Critérios de aceite:**
  - Os tipos representam os dados e estados definidos no modelo do plano, sem
    combinações inválidas de estado.
  - A previsão exige cinco dias; temperaturas-base são Celsius; região, país
    e fuso horário são opcionais.
  - O projeto compila em TypeScript strict sem `any` nesses contratos.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data
- **Requisitos:** FR-02–FR-06; AC-02.2, AC-03.1, AC-04.1, AC-05.1,
  AC-06.4–AC-06.6; NFR-06, NFR-09.

### T-02 — Mapear códigos meteorológicos WMO

- **Descrição:** Implementar o mapeamento determinístico de códigos WMO para
  descrições em português do Brasil.
- **Critérios de aceite:**
  - Cada código suportado retorna uma descrição não vazia em pt-BR.
  - Código desconhecido é reportado como dado inválido e não aparenta sucesso.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Tipo:** Data
- **Requisitos:** FR-03, FR-04, FR-06; AC-03.1, AC-03.3, AC-04.1,
  AC-04.4; NFR-05.

### T-03 — Implementar conversão de temperatura

- **Descrição:** Criar funções puras para conversão entre Celsius e
  Fahrenheit, arredondando os valores exibidos.
- **Critérios de aceite:**
  - Celsius é preservado como valor-base e Fahrenheit é calculado a partir
    dele.
  - As duas unidades são arredondadas ao inteiro mais próximo para
    apresentação.
  - Converter a unidade não modifica o valor-base.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data
- **Requisitos:** FR-05; AC-05.2–AC-05.5; NFR-06.

### T-04 — Formatar temperaturas e datas civis

- **Descrição:** Implementar funções puras de formatação para temperaturas e
  datas da previsão.
- **Critérios de aceite:**
  - Temperaturas formatadas incluem o símbolo da unidade selecionada.
  - Datas ISO civis da localidade são exibidas sem deslocamento causado pelo
    fuso horário do dispositivo.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/lib/format.ts`
- **Tipo:** Data
- **Requisitos:** FR-03–FR-05; AC-03.2, AC-04.2–AC-04.3, AC-05.3;
  NFR-05–NFR-06, NFR-09.

### T-05 — Testar conversão e formatação

- **Descrição:** Testar conversão, arredondamento e apresentação de
  temperaturas e datas.
- **Critérios de aceite:**
  - Os testes verificam conversão nos dois sentidos, arredondamento ao inteiro
    mais próximo e preservação dos valores-base.
  - Os testes verificam unidade explícita e data civil sem deslocamento de
    fuso.
  - Os testes não realizam chamadas de rede.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`,
  `tests/unit/format.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-03–FR-05; AC-03.2, AC-04.2–AC-04.3,
  AC-05.2–AC-05.5; NFR-05–NFR-06, NFR-09.

### T-06 — Testar descrições de códigos WMO

- **Descrição:** Testar os códigos WMO suportados e o tratamento de código
  desconhecido.
- **Critérios de aceite:**
  - Os testes confirmam descrições em pt-BR para os códigos suportados.
  - Código desconhecido não retorna descrição vazia ou sucesso aparente.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-03, FR-04, FR-06; AC-03.3, AC-04.4; NFR-05.

## Entrega 2 — Serviço de dados

### T-07 — Implementar geocodificação

- **Descrição:** Implementar `searchCities(name: string): Promise<City[]>` com
  geocodificação Open-Meteo, mapeando todos os resultados. A seleção do primeiro
  resultado fica a cargo do consumidor na etapa de integração.
- **Critérios de aceite:**
  - A consulta envia o texto após `trim`, com `count=5` e idioma `pt`.
  - Os resultados preservam a ordem da API e são mapeados com nome, coordenadas
    e campos opcionais disponíveis.
  - Lista vazia é distinguível de erro HTTP, de rede ou payload inválido.
  - A chamada é abortada após dez segundos e não há retry automático.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Requisitos:** FR-01, FR-02, FR-06; AC-01.2, AC-02.1–AC-02.3,
  AC-06.2–AC-06.3, AC-06.7; NFR-08.

### T-08 — Implementar consulta e validação da previsão

- **Descrição:** Implementar `getWeather(city: City): Promise<WeatherData>` para
  buscar e validar condições atuais e previsão de exatamente cinco dias para
  uma localidade já selecionada, lançando `WeatherServiceError` sem dados
  parciais quando a resposta estiver incompleta ou inválida.
- **Critérios de aceite:**
  - A consulta usa as coordenadas recebidas, Celsius, `timezone=auto` e cinco
    dias.
  - Temperatura e condição atuais e todos os campos dos cinco dias
    consecutivos são obrigatórios.
  - Arrays desalinhados, campos ausentes, valores inválidos ou códigos sem
    descrição rejeitam a resposta inteira, sem dados parciais.
  - A chamada é abortada após dez segundos e não há retry automático.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Requisitos:** FR-03, FR-04, FR-06; AC-03.1–AC-03.3,
  AC-04.1–AC-04.4, AC-06.5, AC-06.7; NFR-05, NFR-08–NFR-09.

### T-09 — Testar geocodificação

- **Descrição:** Testar requisição, mapeamento, resultados vazios e falhas da
  busca de localidades.
- **Critérios de aceite:**
  - Testes verificam parâmetros, `trim`, primeiro resultado e campos
    opcionais.
  - Testes distinguem lista vazia de erro HTTP, rede ou payload inválido.
  - Testes verificam timeout de dez segundos sem acessar a API real.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-01, FR-02, FR-06; AC-01.2–AC-01.3, AC-02.1–AC-02.3,
  AC-06.2–AC-06.3, AC-06.7; NFR-08.

### T-10 — Testar consulta da previsão

- **Descrição:** Testar parâmetros e validação completa da consulta
  meteorológica.
- **Critérios de aceite:**
  - Testes verificam coordenadas, timezone, unidade e cinco dias solicitados.
  - Testes verificam o mapeamento integral de condições atuais e cinco datas.
  - Testes rejeitam campos ausentes, arrays desalinhados, códigos
    desconhecidos, erros HTTP/rede e timeout.
  - Testes não acessam a API real.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-03, FR-04, FR-06; AC-03.3, AC-04.1, AC-04.4,
  AC-06.5, AC-06.7; NFR-08–NFR-09.

## Entrega 3 — Orquestração da consulta

### T-11 — Orquestrar a busca de localidades

- **Descrição:** Implementar no hook a etapa de geocodificação e seus estados
  inicial, loading, vazio e erro.
- **Critérios de aceite:**
  - Entrada vazia não chama o serviço e mantém orientação para informar uma
    localidade.
  - Uma busca válida comunica carregamento e representa corretamente lista
    vazia e falha de geocodificação.
  - Retry de geocodificação conserva a consulta original.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data
- **Requisitos:** FR-01, FR-02, FR-06; AC-01.3, AC-02.3,
  AC-06.1–AC-06.3, AC-06.6–AC-06.8.

### T-12 — Orquestrar a previsão e o retry

- **Descrição:** Integrar a etapa de previsão no hook e representar sucesso,
  falha de previsão e retry da localidade selecionada.
- **Critérios de aceite:**
  - Após selecionar a primeira localidade, o hook solicita a previsão com a
    mesma cidade e comunica o carregamento.
  - Sucesso só é exposto com dados completos; falha não expõe dados parciais.
  - Retry de previsão reutiliza a localidade selecionada sem nova
    geocodificação.
  - Nova busca limpa o resultado anterior e submissões durante loading não
    iniciam chamadas duplicadas.
- **Dependências:** T-08, T-11.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data
- **Requisitos:** FR-02, FR-03, FR-04, FR-06, FR-07; AC-02.1,
  AC-03.3, AC-04.4, AC-06.1, AC-06.4–AC-06.8, AC-07.1–AC-07.3.

### T-13 — Testar estados de geocodificação do hook

- **Descrição:** Testar a fase de busca no hook, incluindo entrada inválida,
  carregamento, vazio e erro com retry.
- **Critérios de aceite:**
  - Testes confirmam que entrada vazia não chama o serviço.
  - Testes cobrem loading, lista vazia e erro de geocodificação.
  - Retry repete a mesma consulta e os testes usam serviço mockado.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-01, FR-06; AC-01.3, AC-02.3, AC-06.1–AC-06.3,
  AC-06.6.

### T-14 — Testar estados de previsão e novas buscas

- **Descrição:** Testar sucesso, falha e retry da previsão, concorrência e
  substituição dos resultados no hook.
- **Critérios de aceite:**
  - Testes cobrem sucesso, falha da previsão e retry sem repetir
    geocodificação.
  - Testes confirmam bloqueio de chamadas concorrentes e ausência de dados
    parciais.
  - Nova busca descarta os dados anteriores; testes usam serviço mockado.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`
- **Tipo:** Test
- **Requisitos:** FR-03, FR-04, FR-06, FR-07; AC-03.3, AC-04.4,
  AC-06.4–AC-06.8, AC-07.1–AC-07.3.

## Entrega 4 — Interface

### T-15 — Implementar a barra de busca

- **Descrição:** Criar o campo e a ação acessível para iniciar uma busca por
  localidade.
- **Critérios de aceite:**
  - O campo possui nome acessível e permite envio por teclado.
  - Entrada vazia ou em branco orienta o usuário e não inicia busca.
  - A ação de envio pode ser bloqueada enquanto a consulta estiver carregando.
  - Durante o bloqueio, manter o foco e remover o hover de ação disponível;
    clique e teclado não iniciam nova consulta.
- **Dependências:** T-11.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Tipo:** UI
- **Requisitos:** FR-01, FR-06; AC-01.1–AC-01.3, AC-06.8; NFR-02, NFR-05.

### T-16 — Implementar o estado de carregamento

- **Descrição:** Criar a apresentação acessível do estado de carregamento.
- **Critérios de aceite:**
  - A mensagem é exibida em pt-BR e exposta programaticamente a tecnologias
    assistivas.
  - A indicação funciona durante geocodificação e consulta meteorológica.
  - A região de resultados expõe `aria-busy`; o anúncio de carregamento fica
    fora dessa região para não ser adiado.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`
- **Tipo:** UI
- **Requisitos:** FR-06; AC-06.1; NFR-02, NFR-05.

### T-17 — Implementar o estado vazio

- **Descrição:** Criar a apresentação de busca sem localidades.
- **Critérios de aceite:**
  - A mensagem informa em pt-BR que nenhuma localidade foi encontrada.
  - A busca permanece disponível para iniciar outra consulta.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`
- **Tipo:** UI
- **Requisitos:** FR-02, FR-06, FR-07; AC-02.3, AC-06.2, AC-07.2;
  NFR-05.

### T-18 — Implementar o estado de erro e retry

- **Descrição:** Criar a mensagem de falha e a ação explícita de nova tentativa.
- **Critérios de aceite:**
  - A mensagem geral em pt-BR informa que não foi possível obter os dados;
    timeout e falha de conexão incluem orientação específica amigável quando
    a causa for conhecida.
  - A ação de retry chama o contexto recebido sem exigir redigitação.
  - O estado não apresenta dados parciais e permite iniciar uma nova busca.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`
- **Tipo:** UI
- **Requisitos:** FR-06, FR-07; AC-06.3–AC-06.6, AC-07.2; NFR-05.

### T-19 — Apresentar localidade e condições atuais

- **Descrição:** Implementar a identificação da cidade e a apresentação das
  condições meteorológicas atuais.
- **Critérios de aceite:**
  - A localidade é identificada pelo nome e inclui região e país quando
    disponíveis.
  - Temperatura atual e descrição da condição são exibidas com unidade
    selecionada.
  - Após busca ou retry bem-sucedido, focar o título da localidade sem adicioná-lo
    à ordem de tabulação. Alternar a unidade não move o foco.
- **Dependências:** T-01, T-03, T-04, T-12.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI
- **Requisitos:** FR-02, FR-03, FR-05; AC-02.2, AC-03.1–AC-03.2,
  AC-05.3; NFR-05–NFR-06, NFR-09.

### T-20 — Apresentar os cinco dias de previsão

- **Descrição:** Implementar um item e a lista da previsão meteorológica de
  cinco dias.
- **Critérios de aceite:**
  - São apresentados os cinco dias consecutivos com data, condição e
    temperaturas mínima e máxima.
  - Datas e temperaturas usam os formatadores existentes e a unidade
    selecionada.
- **Dependências:** T-02, T-03, T-04, T-12.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`,
  `src/components/ForecastList.tsx`
- **Tipo:** UI
- **Requisitos:** FR-04, FR-05; AC-04.1–AC-04.3, AC-05.3;
  NFR-05–NFR-06, NFR-09.

### T-21 — Implementar o controle de unidade

- **Descrição:** Criar o controle para alternar Celsius e Fahrenheit.
- **Critérios de aceite:**
  - O controle permite escolher ambas as unidades e identifica a opção ativa.
  - A escolha inicial recebida é Celsius e a interação não inicia consulta de
    dados.
  - O controle tem nome acessível e operação por teclado.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Tipo:** UI
- **Requisitos:** FR-05; AC-05.1–AC-05.5; NFR-02, NFR-06.

### T-22 — Compor os estados e resultados da aplicação

- **Descrição:** Integrar busca, resultados, controle de unidade e estados de
  consulta na tela principal.
- **Critérios de aceite:**
  - A aplicação apresenta o estado inicial e alterna corretamente entre
    loading, vazio, erro e sucesso.
  - Alternar unidade atualiza os valores sem alterar localidade ou demais
    dados.
  - Uma nova busca não exibe dados anteriores como resultado atual.
- **Dependências:** T-15–T-21.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Requisitos:** FR-01–FR-07; AC-01.1, AC-02.2–AC-02.3,
  AC-03.1–AC-03.2, AC-04.1–AC-04.3, AC-05.1–AC-05.5,
  AC-06.1–AC-06.6, AC-07.1–AC-07.3.

### T-23 — Estilizar a interface responsiva

- **Descrição:** Aplicar estilo global e layout responsivo à tela e aos
  componentes meteorológicos.
- **Critérios de aceite:**
  - Busca, resultados e unidade permanecem utilizáveis em telas móveis e
    desktop.
  - O layout não introduz rolagem horizontal a partir de 320 pixels CSS.
  - Foco de teclado permanece visível e o contraste não impede a leitura.
- **Dependências:** T-22.
- **Arquivos prováveis:** `src/styles/index.css`
- **Tipo:** UI
- **Requisitos:** FR-08; AC-08.1–AC-08.5; NFR-01–NFR-02.

### T-24 — Testar a barra de busca

- **Descrição:** Testar o comportamento observável e a acessibilidade da
  entrada de busca.
- **Critérios de aceite:**
  - Testes confirmam nome acessível, envio válido e submissão por teclado.
  - Entrada vazia não chama o callback e apresenta orientação.
  - Envio fica desabilitado durante carregamento.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`
- **Tipo:** Test
- **Requisitos:** FR-01, FR-06; AC-01.1–AC-01.3, AC-06.8; NFR-02.

### T-25 — Testar componentes de estado

- **Descrição:** Testar loading, vazio e erro com retry por meio de seus
  comportamentos acessíveis.
- **Critérios de aceite:**
  - Loading é anunciado; vazio comunica ausência de resultados.
  - Erro comunica a falha e executa a ação de retry recebida.
  - As mensagens estão em pt-BR e os testes não dependem de seletores visuais.
- **Dependências:** T-16–T-18.
- **Arquivos prováveis:** `tests/unit/WeatherStates.test.tsx`
- **Tipo:** Test
- **Requisitos:** FR-06, FR-07; AC-02.3, AC-06.1–AC-06.6;
  NFR-02, NFR-05.

### T-26 — Testar apresentação dos resultados

- **Descrição:** Testar identificação da cidade, condições atuais e previsão
  completa na aplicação.
- **Critérios de aceite:**
  - Testes verificam nome e metadados opcionais da cidade, temperatura atual
    e condição.
  - Testes verificam cinco datas com condições e temperaturas mínima e
    máxima.
  - Testes verificam unidade selecionada e ausência de dados antigos após
    nova busca.
- **Dependências:** T-19, T-20, T-22.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`
- **Tipo:** Test
- **Requisitos:** FR-02–FR-04, FR-07; AC-02.2, AC-03.1–AC-03.2,
  AC-04.1–AC-04.4, AC-07.3; NFR-09.

### T-27 — Testar alternância de unidade

- **Descrição:** Testar unidade inicial, estado ativo e interação do controle
  Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Testes confirmam Celsius inicial e seleção identificável das duas
    unidades.
  - Alternar não dispara uma nova consulta e não altera dados não
    relacionados à unidade.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`
- **Tipo:** Test
- **Requisitos:** FR-05; AC-05.1–AC-05.5; NFR-06.

## Entrega 5 — Fluxos de ponta a ponta e qualidade

### T-28 — Testar fluxo E2E de consulta bem-sucedida

- **Descrição:** Cobrir com Playwright o fluxo de busca e apresentação de
  condições atuais e previsão.
- **Critérios de aceite:**
  - A rede é interceptada e a consulta de teste não depende do Open-Meteo real.
  - O fluxo valida localidade, condições atuais e cinco dias na interface.
- **Dependências:** T-22.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-01–FR-04; AC-01.2, AC-02.1–AC-02.2,
  AC-03.1, AC-04.1–AC-04.2.

### T-29 — Testar fluxos E2E de vazio, erro e nova busca

- **Descrição:** Cobrir estados sem resultado e de falha, retry e consulta
  subsequente.
- **Critérios de aceite:**
  - Testes interceptam a rede para vazio e falhas nas etapas de busca e
    previsão.
  - Retry usa a consulta ou localidade original apropriada.
  - Uma nova busca funciona e não apresenta o resultado anterior como atual.
- **Dependências:** T-18, T-22.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-06, FR-07; AC-02.3, AC-06.2–AC-06.6,
  AC-07.1–AC-07.3.

### T-30 — Testar alternância de unidade em E2E

- **Descrição:** Validar no navegador que alternar unidade atualiza a
  apresentação sem nova consulta meteorológica.
- **Critérios de aceite:**
  - O teste verifica temperaturas e unidade ativa após alternar.
  - A contagem de chamadas meteorológicas permanece inalterada durante a
    alternância.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-05; AC-05.1–AC-05.5.

### T-31 — Validar layout nos viewports definidos

- **Descrição:** Verificar responsividade dos fluxos essenciais nos três
  tamanhos de viewport especificados.
- **Critérios de aceite:**
  - A busca, os resultados e o controle de unidade são utilizáveis em 320,
    768 e 1280 pixels CSS.
  - Nenhum viewport apresenta rolagem horizontal da página.
  - Pelo menos um fluxo essencial é executado em viewport móvel.
- **Dependências:** T-23, T-28.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-08; AC-08.1–AC-08.2, AC-08.5; NFR-01.

### T-32 — Adicionar ferramenta de auditoria de acessibilidade

- **Descrição:** Incluir a dependência e configuração mínima para auditar
  acessibilidade automatizada nos testes de navegador.
- **Critérios de aceite:**
  - A dependência escolhida é compatível com Playwright já configurado.
  - Instalação atualiza o manifesto e o lockfile, sem mudanças não relacionadas.
- **Dependências:** T-28.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`
- **Tipo:** Infra
- **Requisitos:** FR-08; AC-08.6; NFR-02.

### T-33 — Auditar acessibilidade e operação por teclado

- **Descrição:** Verificar os fluxos essenciais com auditoria automatizada e
  navegação manual por teclado automatizada no navegador.
- **Critérios de aceite:**
  - Os cenários principais não reportam violações automatizadas críticas ou
    graves.
  - Busca, retry e unidade são alcançáveis e operáveis por teclado, com foco
    visível e nomes acessíveis.
  - Loading, vazio e erro são expostos programaticamente.
- **Dependências:** T-25, T-31, T-32.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-08; AC-08.3–AC-08.6; NFR-02.

### T-34 — Validar compatibilidade entre navegadores

- **Descrição:** Executar os fluxos essenciais nos navegadores e plataformas
  definidos na especificação.
- **Critérios de aceite:**
  - Busca, consulta e unidade são verificadas nas versões estáveis atuais de
    Chrome, Firefox, Edge e Safari em desktop, Chrome em Android e Safari em
    iOS.
  - Resultados e bloqueios que impeçam o uso são registrados para correção.
- **Dependências:** T-28–T-30, T-33.
- **Arquivos prováveis:** `playwright.config.ts`
- **Tipo:** Test
- **Requisitos:** FR-08; AC-08.7; NFR-04.

### T-35 — Adicionar execução de auditoria Lighthouse

- **Descrição:** Preparar a ferramenta e o comando reproduzível para medir
  desempenho móvel do build de produção.
- **Critérios de aceite:**
  - O comando executa Lighthouse contra o build de produção servido
    localmente.
  - A configuração mede a interface inicial e não incorpora latência das
    APIs externas.
- **Dependências:** T-23.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`
- **Tipo:** Infra
- **Requisitos:** FR-08; NFR-03.

### T-36 — Verificar limites de desempenho

- **Descrição:** Executar a auditoria móvel e verificar os limites de LCP e
  CLS especificados.
- **Critérios de aceite:**
  - LCP da interface inicial é ≤ 2,5 s e CLS é ≤ 0,1 no build de produção.
  - Se algum limite falhar, o relatório identifica a métrica e o cenário,
    sem mascarar falha como sucesso.
- **Dependências:** T-35.
- **Arquivos prováveis:** `package.json`
- **Tipo:** Test
- **Requisitos:** FR-08; NFR-03.

## Entrega 6 — Publicação

### T-37 — Configurar base path do build

- **Descrição:** Garantir que o Vite gere assets para o caminho de publicação
  `/app/` no GitHub Pages sem quebrar o uso local.
- **Critérios de aceite:**
  - `VITE_BASE` define o `base` do build e o padrão local permanece `/`.
  - O build usa referências de assets compatíveis com
    `/<nome-do-repositório>/app/`.
- **Dependências:** T-22.
- **Arquivos prováveis:** `vite.config.ts`
- **Tipo:** Infra
- **Requisitos:** FR-09; AC-09.2.

### T-38 — Verificar workflow de publicação

- **Descrição:** Confirmar que o workflow de Pages monta e publica o build da
  aplicação no subcaminho `/app/`.
- **Critérios de aceite:**
  - O workflow define o `VITE_BASE` com o nome do repositório.
  - O artefato publicado contém o build em `_site/app/` junto ao conteúdo já
    publicado na raiz.
- **Dependências:** T-37.
- **Arquivos prováveis:** `.github/workflows/pages.yml`
- **Tipo:** Infra
- **Requisitos:** FR-09; AC-09.1–AC-09.2.

### T-39 — Verificar aplicação no caminho publicado

- **Descrição:** Validar que o site implantado carrega os recursos e permite
  executar o fluxo essencial sob o caminho do GitHub Pages.
- **Critérios de aceite:**
  - A aplicação carrega sob `/<nome-do-repositório>/app/` sem erros de assets.
  - Os fluxos de busca, consulta e alternância de unidade permanecem
    utilizáveis após a publicação.
- **Dependências:** T-28–T-30, T-38.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test
- **Requisitos:** FR-09; AC-09.1–AC-09.2; NFR-08.

## Checklist de validação da implementação

Para mudanças em `src/` ou `tests/`, executar:

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm test:e2e`
