# Especificação do produto — Weather App

**Status:** validada
**Fonte:** briefing do projeto e [discovery](./discovery.md)

## Overview

O Weather App é um site responsivo, em português do Brasil, que permite consultar manualmente as condições meteorológicas de uma localidade e a previsão para cinco dias. O produto será acessado em navegadores de dispositivos móveis e desktops e publicado no GitHub Pages. Os dados de geocodificação e meteorologia serão fornecidos pelo Open-Meteo, sem exigir chave de API.

### Objetivos

- Permitir que uma pessoa encontre uma localidade e consulte o clima sem recorrer a outra fonte.
- Apresentar condições atuais e uma previsão que ajude no planejamento dos próximos dias.
- Permitir a leitura dos valores de temperatura em Celsius ou Fahrenheit sem refazer a consulta.
- Oferecer a mesma funcionalidade essencial em telas móveis e de desktop.

### Personas

- **Pessoa que decide a rotina do dia:** consulta rapidamente as condições antes de sair.
- **Viajante que planeja os próximos dias:** verifica o tempo no destino para organizar atividades e bagagem.
- **Pessoa que trabalha ou realiza atividades ao ar livre:** consulta as condições atuais e futuras para planejar atividades externas.

### Definições

- **Consulta de cinco dias:** dia atual e os quatro dias seguintes.
- **Localidade consultada:** primeiro resultado retornado para a busca, inclusive quando houver localidades homônimas.
- **Unidade padrão:** Celsius (°C).

## Functional Requirements

- **FR-01 — Busca manual:** o usuário deve poder informar uma localidade para iniciar uma consulta.
- **FR-02 — Seleção da localidade:** quando a busca retornar uma ou mais localidades correspondentes, o produto deve usar o primeiro resultado na ordem retornada e identificar a localidade consultada na tela.
- **FR-03 — Condições atuais:** após a seleção da localidade, o produto deve exibir a temperatura atual e uma descrição textual da condição meteorológica.
- **FR-04 — Previsão de cinco dias:** após a seleção da localidade, o produto deve exibir, para hoje e os quatro dias seguintes, a condição meteorológica e as temperaturas mínima e máxima de cada dia.
- **FR-05 — Alternância de unidade:** o usuário deve poder alternar a temperatura apresentada entre Celsius e Fahrenheit. A unidade inicial deve ser Celsius. A conversão deve ocorrer sem uma nova consulta meteorológica.
- **FR-06 — Estados da consulta:** durante uma consulta, o produto deve indicar que está carregando. Quando a geocodificação não retornar localidades, deve apresentar um estado vazio. Quando uma consulta falhar ou a resposta meteorológica não contiver todos os dados obrigatórios, deve comunicar que não foi possível obter os dados e oferecer uma forma de tentar novamente.
- **FR-07 — Novas consultas:** o usuário deve poder iniciar outra busca após uma consulta concluída ou com falha, sem precisar reiniciar a aplicação.
- **FR-08 — Acesso responsivo:** o usuário deve conseguir realizar a busca, consultar condições e previsão e alternar unidades em navegadores móveis e de desktop.
- **FR-09 — Publicação:** o site deve estar acessível por meio da publicação do projeto no GitHub Pages.

## User Stories

- **US-01:** Como pessoa que decide a rotina do dia, quero buscar uma localidade pelo nome para consultar o clima antes de sair.
- **US-02:** Como usuário que encontrou localidades com nomes iguais, quero saber qual localidade foi consultada para reconhecer o resultado apresentado.
- **US-03:** Como pessoa que decide a rotina do dia, quero ver as condições atuais da localidade para orientar minhas decisões imediatas.
- **US-04:** Como viajante, quero ver a previsão de cinco dias da localidade para planejar os próximos dias.
- **US-05:** Como usuário, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-06:** Como usuário, quero receber indicação durante a busca e quando ela não puder ser concluída para entender o estado da consulta e o que posso fazer.
- **US-07:** Como usuário, quero pesquisar outra localidade sem reiniciar o site para consultar diferentes destinos.
- **US-08:** Como usuário de dispositivo móvel ou desktop, quero usar as mesmas funções essenciais em minha tela para consultar o clima onde estiver.
- **US-09:** Como usuário, quero acessar o site publicado para consultar o serviço sem executar o projeto localmente.

## Acceptance Criteria

Cada requisito funcional (FR-01 a FR-09) está associado à história indicada no título e possui pelo menos um critério verificável no formato **Dado / Quando / Então**.

### US-01 — Busca manual (FR-01)

- **AC-01.1:** **Dado** que a interface foi carregada, **quando** o usuário visualizar a busca, **então** deve encontrar um campo identificável para informar uma localidade e uma ação para iniciar a busca.
- **AC-01.2:** **Dado** que o usuário informou uma localidade válida, **quando** enviar a busca, **então** o produto deve consultar o serviço de geocodificação do Open-Meteo.
- **AC-01.3:** **Dado** que o campo está vazio ou contém somente espaços, **quando** o usuário tentar iniciar a busca, **então** nenhuma consulta deve ser iniciada e a interface deve orientá-lo a informar uma localidade.

### US-02 — Seleção e identificação da localidade (FR-02)

- **AC-02.1:** **Dado** que a busca retornou uma ou mais localidades, **quando** o produto iniciar a consulta meteorológica, **então** deve usar o primeiro resultado na ordem retornada pela busca.
- **AC-02.2:** **Dado** que uma localidade foi selecionada, **quando** seus dados forem apresentados, **então** a tela deve exibir o nome da localidade e, quando disponíveis, sua região administrativa e país.
- **AC-02.3:** **Dado** que a busca não retornou localidades, **quando** o resultado for apresentado, **então** o produto deve exibir um estado vazio e permitir iniciar uma nova busca.

### US-03 — Condições atuais (FR-03)

- **AC-03.1:** **Dado** que a consulta meteorológica foi concluída com sucesso e a resposta contém os campos obrigatórios, **quando** a tela apresentar os resultados, **então** deve exibir a temperatura atual e a descrição textual da condição para a localidade identificada.
- **AC-03.2:** **Dado** que a temperatura atual está sendo apresentada, **quando** o usuário visualizar o valor, **então** ele deve estar identificado com a unidade selecionada.
- **AC-03.3:** **Dado** que falta a temperatura atual ou a descrição da condição na resposta, **quando** o produto validar os dados meteorológicos, **então** não deve apresentar o resultado como completo e deve comunicar que não foi possível obter os dados.

### US-04 — Previsão (FR-04)

- **AC-04.1:** **Dado** que a consulta meteorológica foi concluída com sucesso, **quando** a previsão for apresentada, **então** ela deve incluir cinco datas civis consecutivas na localidade consultada: hoje e os quatro dias seguintes, com a condição textual e as temperaturas mínima e máxima em cada data.
- **AC-04.2:** **Dado** que a previsão contém datas, **quando** cada item for apresentado, **então** deve identificar a data correspondente.
- **AC-04.3:** **Dado** que a previsão apresenta temperaturas, **quando** o usuário visualizar os valores, **então** eles devem usar a unidade selecionada.
- **AC-04.4:** **Dado** que falta uma data, uma condição textual ou uma temperatura mínima/máxima em qualquer um dos cinco dias, **quando** o produto validar os dados da previsão, **então** não deve apresentar a previsão de cinco dias como completa e deve comunicar que não foi possível obter os dados.

### US-05 — Alternância de unidade (FR-05)

- **AC-05.1:** **Dado** que a interface foi carregada, **quando** o usuário acessar o controle de unidade, **então** poderá escolher Celsius ou Fahrenheit e identificar qual unidade está ativa.
- **AC-05.2:** **Dado** que o usuário abriu o produto sem uma unidade previamente selecionada, **quando** a interface for apresentada, **então** Celsius deve ser a unidade inicial.
- **AC-05.3:** **Dado** que há temperaturas nas condições atuais ou na previsão, **quando** o usuário alternar a unidade, **então** todos os valores apresentados devem ser atualizados para a unidade escolhida.
- **AC-05.4:** **Dado** que há dados meteorológicos carregados, **quando** o usuário alternar a unidade, **então** nenhuma nova consulta meteorológica deve ser iniciada.
- **AC-05.5:** **Dado** que uma localidade e seus dados meteorológicos estão apresentados, **quando** o usuário alternar a unidade, **então** a localidade e as demais informações meteorológicas devem permanecer inalteradas.

### US-06 — Estados de consulta e falhas (FR-06)

- **AC-06.1:** **Dado** que a busca ou a consulta meteorológica está em andamento, **quando** o usuário visualizar a interface, **então** ela deve comunicar que está carregando.
- **AC-06.2:** **Dado** que a busca terminou sem resultados, **quando** o usuário visualizar o estado da consulta, **então** a interface deve informar que nenhuma localidade foi encontrada e permitir uma nova busca.
- **AC-06.3:** **Dado** que a geocodificação ou a consulta meteorológica falhou, **quando** o erro for apresentado, **então** a interface deve informar que não foi possível obter os dados, apresentar uma orientação amigável quando a causa for conhecida e oferecer uma ação para tentar novamente.
- **AC-06.4:** **Dado** que ocorreu uma falha ou que a resposta está incompleta, **quando** a interface apresentar o resultado, **então** não deve indicar que a consulta foi concluída com dados completos.
- **AC-06.5:** **Dado** que a resposta meteorológica não contém qualquer um dos campos obrigatórios de condições atuais ou previsão, **quando** a interface apresentar o estado da consulta, **então** deve informar que os dados não puderam ser apresentados adequadamente e oferecer nova tentativa sem exibir dados parciais.
- **AC-06.6:** **Dado** que uma tentativa falhou, **quando** o usuário acionar a opção de tentar novamente, **então** o produto deve repetir a operação que falhou usando a mesma entrada de busca ou, se a localidade já tiver sido selecionada, a mesma localidade, sem exigir que o usuário redigite a busca.
- **AC-06.7:** **Dado** que uma chamada ao serviço externo excedeu dez segundos, **quando** o limite de tempo for atingido, **então** a chamada deve ser interrompida e a interface deve apresentar o estado de erro com a opção de tentar novamente.
- **AC-06.8:** **Dado** que uma busca ou consulta está em andamento, **quando** o usuário tentar enviá-la novamente, **então** a ação de envio deve permanecer desabilitada e nenhuma chamada externa duplicada deve ser iniciada.

### US-07 — Nova busca (FR-07)

- **AC-07.1:** **Dado** que uma consulta foi concluída com sucesso, **quando** o usuário informar e enviar outra localidade, **então** o produto deve iniciar uma nova busca sem exigir que a aplicação seja reiniciada.
- **AC-07.2:** **Dado** que a consulta falhou ou não encontrou resultados, **quando** o usuário corrigir a entrada e enviar outra busca, **então** o produto deve iniciar uma nova consulta.
- **AC-07.3:** **Dado** que uma nova consulta foi iniciada para outra localidade, **quando** os dados da consulta anterior ainda estiverem na tela, **então** eles não devem ser apresentados como resultado da nova localidade.

### US-08 — Uso responsivo (FR-08)

- **AC-08.1:** **Dado** que o produto está sendo usado em uma tela móvel ou de desktop, **quando** o usuário acessar as funções essenciais, **então** o campo e a ação de busca, as condições atuais, a previsão e o controle de unidade devem permanecer acessíveis e utilizáveis.
- **AC-08.2:** **Dado** que a largura da tela mudou, **quando** o conteúdo for apresentado, **então** o layout deve se adaptar sem ocultar informações ou controles necessários às funções essenciais.
- **AC-08.3:** **Dado** que o usuário navega por teclado ou leitor de tela, **quando** acessar as funções essenciais, **então** poderá completar a busca e acessar os controles por teclado, e os controles terão nomes acessíveis.
- **AC-08.4:** **Dado** que a busca ou a consulta meteorológica está carregando, **quando** a interface apresentar esse estado, **então** ele deve ser exposto programaticamente e comunicado por tecnologia assistiva, sem exigir que o usuário localize visualmente uma mensagem.
- **AC-08.5:** **Dado** que a interface é exibida em uma largura de 320, 768 ou 1280 pixels CSS, **quando** o usuário acessar as funções essenciais, **então** elas devem permanecer disponíveis sem rolagem horizontal da página.
- **AC-08.6:** **Dado** que as telas dos fluxos essenciais estão prontas, **quando** forem verificadas com auditoria automatizada de acessibilidade e navegação manual por teclado, **então** não devem apresentar violações automatizadas críticas ou graves, e todos os controles devem ter foco visível e ser operáveis por teclado.
- **AC-08.7:** **Dado** que os fluxos essenciais foram implementados, **quando** forem verificados nas versões estáveis atuais dos navegadores definidos em **NFR-04**, **então** busca, consulta e alternância de unidade devem funcionar sem erros que impeçam o uso.

### US-09 — Publicação (FR-09)

- **AC-09.1:** **Dado** que a aplicação foi publicada no GitHub Pages, **quando** o usuário acessar a URL publicada, **então** a aplicação deve carregar e permitir executar os fluxos de busca, consulta e alternância de unidade.
- **AC-09.2:** **Dado** que a aplicação está no caminho de publicação configurado para o GitHub Pages, **quando** o usuário acessar e navegar pelo site, **então** os recursos e as rotas necessários devem funcionar nesse caminho.

## Non-Functional Requirements

- **NFR-01 — Responsividade:** as funções essenciais devem estar disponíveis em dispositivos móveis e desktops, sem rolagem horizontal da página a partir de 320 pixels CSS.
- **NFR-02 — Acessibilidade:** os fluxos essenciais devem atender ao nível AA da [WCAG 2.2](https://www.w3.org/TR/WCAG22/); controles devem ter nomes acessíveis, foco visível e operação por teclado, e os estados de carregamento, vazio e erro devem ser anunciados.
  A região de resultados deve indicar que está ocupada durante a consulta, sem
  suprimir o anúncio de carregamento. Após sucesso de busca ou retry, o foco vai
  para o título da localidade; alternar a unidade não deve mover o foco.
  A busca bloqueada mantém o foco e não apresenta hover de ação disponível.
- **NFR-03 — Desempenho:** no build de produção, a aplicação deve atingir LCP de até 2,5 segundos e CLS de até 0,1 em auditoria Lighthouse com perfil móvel. A medição cobre a interface inicial e exclui a latência dos serviços externos; cada chamada externa tem limite de dez segundos. Os limites de LCP e CLS adotam como referência os valores “Good” dos [Core Web Vitals](https://web.dev/articles/vitals).
- **NFR-04 — Compatibilidade:** os fluxos essenciais devem funcionar nas versões estáveis atuais de Chrome, Firefox, Edge e Safari em desktop, Chrome em Android e Safari em iOS.
- **NFR-05 — Idioma:** os textos da interface devem estar em português do Brasil.
- **NFR-06 — Unidade e precisão:** Celsius é a unidade inicial. Celsius e Fahrenheit devem representar a mesma medição, os valores devem ser identificados com a unidade correspondente e as temperaturas devem ser arredondadas para o inteiro mais próximo.
- **NFR-07 — Privacidade e persistência:** o produto não exige conta, não persiste buscas ou preferências e não utiliza localização do dispositivo.
- **NFR-08 — Dependência de dados:** geocodificação e dados meteorológicos são obtidos do Open-Meteo, sem chave de API, sujeitos à cobertura, disponibilidade e condições de uso do serviço.
- **NFR-09 — Consistência da localidade:** resultados meteorológicos, datas da previsão e identificação do local devem corresponder à mesma localidade selecionada pela busca.

## Edge Cases

- **Entrada vazia ou em branco:** não enviar a consulta; orientar o usuário a informar uma localidade.
- **Localidade inexistente ou sem correspondência:** apresentar estado vazio e permitir nova busca.
- **Localidades homônimas ou múltiplos resultados:** usar o primeiro resultado e apresentar a identificação disponível da localidade selecionada.
- **Falha de rede, timeout ou serviço indisponível:** interromper a chamada após dez segundos, comunicar que não foi possível obter os dados, orientar a verificar a conexão quando aplicável e informar claramente quando o limite de tempo for excedido. Disponibilizar nova tentativa manual e não fazer novas tentativas automáticas.
- **Resposta sem dados atuais ou com dados meteorológicos incompletos:** tratar como falha a ausência da temperatura atual ou da condição textual; não apresentar resultado incompleto como completo e permitir nova tentativa.
- **Previsão com dias ou valores ausentes:** tratar como falha a ausência de qualquer data, condição textual ou temperatura mínima/máxima entre os cinco dias; não apresentar previsão incompleta como completa e permitir nova tentativa.
- **Alternância de unidade durante uma consulta:** a unidade escolhida deve ser aplicada aos valores apresentados sem alterar a localidade nem provocar uma nova consulta meteorológica.
- **Consulta subsequente após erro ou resultado vazio:** uma nova busca deve usar a entrada atual e não apresentar dados de uma localidade anterior como se fossem o resultado novo. A ação explícita de tentar novamente repete a consulta que falhou para a mesma localidade.
- **Tela estreita ou uso por teclado:** os controles e as informações essenciais permanecem acessíveis, sem depender de interação exclusiva por ponteiro.
- **Submissões repetidas durante carregamento:** manter somente uma tentativa ativa por submissão para evitar chamadas duplicadas.

## Assumptions

- A busca manual é a única forma de iniciar uma consulta; o produto não solicita localização do dispositivo.
- O primeiro resultado de geocodificação é a localidade escolhida, sem uma etapa adicional de confirmação.
- A previsão de cinco dias inclui o dia atual e os quatro dias seguintes.
- As datas da previsão correspondem aos dias civis da localidade consultada, não ao fuso horário do dispositivo do usuário.
- Celsius é a unidade inicial e a preferência não é mantida entre acessos.
- Não há autenticação, persistência de preferências ou de localidades consultadas, cache de dados meteorológicos ou suporte offline.
- O Open-Meteo é a fonte de geocodificação e previsão para a primeira versão, sujeito a validação de cobertura, limites e condições de uso.
- A aplicação aceita localidades disponíveis no serviço de geocodificação, sem prometer cobertura para uma região específica.

## Risks

| Risco | Impacto | Mitigação |
|---|---|---|
| Indisponibilidade, limite de requisições ou mudança no Open-Meteo | Consultas podem falhar ou ficar indisponíveis. | Exibir falha com clareza, permitir nova tentativa e validar limites e condições de uso antes da publicação. |
| Cobertura insuficiente ou dados ausentes/desatualizados | Usuários podem não encontrar localidades ou receber informação incompleta. | Informar claramente quando não houver resultado ou os dados obrigatórios estiverem indisponíveis; a cobertura depende do Open-Meteo. |
| Seleção de localidade homônima não corresponde à intenção do usuário | O usuário pode interpretar a previsão de outra localidade como sendo a desejada. | Usar o primeiro resultado conforme o escopo e identificar visivelmente a localidade selecionada. |
| Conversão ou arredondamento incorreto de temperatura | Valores incorretos podem induzir decisões inadequadas. | Usar arredondamento para o inteiro mais próximo e validar a equivalência entre unidades. |
| Desempenho ruim em rede lenta ou dispositivo móvel | A busca e a leitura podem ser frustrantes ou inviáveis. | Limitar chamadas externas a dez segundos e verificar os limites Lighthouse definidos nos requisitos não funcionais. |
| Barreiras de acessibilidade ou incompatibilidade de navegador | Pessoas podem não conseguir usar as funções essenciais. | Validar WCAG 2.2 AA e os navegadores definidos nos requisitos não funcionais. |
| Previsão interpretada como garantia | Divergências entre previsão e condições reais podem reduzir a confiança. | Identificar os dados como previsão meteorológica, não como garantia; não prometer horário de atualização no escopo inicial. |

## Out of Scope

- Geolocalização automática ou uso da localização do dispositivo.
- Autenticação, contas de usuário ou sincronização entre dispositivos.
- Persistência de preferências ou de localidades consultadas.
- Cache meteorológico, funcionamento offline ou garantias de disponibilidade dos dados.
- Aplicativo nativo ou aplicativo instalável.
- Seleção manual entre resultados homônimos: a primeira localidade retornada é usada.
- Exibição de sensação térmica, umidade, vento, precipitação, alertas, radar, mapas, favoritos e histórico de consultas.
- Exibição de horário de atualização ou garantia de atualidade dos dados.

## Open Questions

Nenhuma pendência bloqueante. As decisões registradas para as antigas OQ-01 a OQ-04 são:

- **Decisão OQ-01 — Conteúdo meteorológico:** condições atuais exibem temperatura e descrição textual da condição em pt-BR. Cada um dos cinco dias exibe data local, condição textual e temperaturas mínima e máxima. Todos esses campos são obrigatórios para considerar a resposta completa; se faltar qualquer um, apresentar erro e oferecer nova tentativa, sem exibir dados parciais. Não exibir horário de atualização. Converter a partir da medição original e arredondar para o inteiro mais próximo.
- **Decisão OQ-02 — Falhas:** cada chamada externa tem timeout de dez segundos. Erros de rede, timeout, serviço indisponível e resposta inválida compartilham a mensagem geral de falha, podendo incluir uma orientação amigável específica quando conhecida (verificar conexão ou informar o limite excedido), e uma ação de nova tentativa manual. Não há retentativas automáticas. Bloquear submissões duplicadas enquanto a chamada estiver ativa.
- **Decisão OQ-03 — Cobertura e identificação:** aceitar localidades disponíveis no Open-Meteo sem garantia de cobertura regional. Identificar a seleção com nome da localidade e, quando disponíveis, região administrativa e país; selecionar automaticamente o primeiro resultado retornado, sem seletor de resultados.
- **Decisão OQ-04 — Qualidade:** validar o layout em 320, 768 e 1280 pixels CSS; adotar WCAG 2.2 nível AA; testar versões estáveis atuais de Chrome, Firefox, Edge e Safari em desktop, Chrome em Android e Safari em iOS. Em auditoria Lighthouse móvel do build de produção, buscar LCP de até 2,5 segundos e CLS de até 0,1 para a interface inicial, excluindo o tempo de resposta das APIs externas.
