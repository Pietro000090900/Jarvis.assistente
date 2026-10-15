# J.A.R.V.I.S. Android — versão 1.0

Protótipo de assistente web responsivo com interface futurista, conversa com IA via servidor, reconhecimento de fala compatível com o navegador, síntese de voz e histórico local.

## O que esta versão faz
- Interface adaptada a celular.
- Conversa com um provedor compatível com a API Chat Completions.
- Microfone via Web Speech API (depende do navegador).
- Leitura das respostas por síntese de voz.
- Histórico local no navegador.
- Chave da IA mantida no servidor, nunca no HTML.

## O que ainda NÃO faz
- Não tem palavra de ativação permanente ("Ei, Jarvis").
- Não controla todo o Android nem aplicativos arbitrários.
- Não possui memória semântica permanente; salva apenas histórico local.
- Não faz pesquisa web própria, automações agendadas nem visão computacional.
- Não é um APK nativo. É um aplicativo web que pode ser adicionado à tela inicial.
- O uso da API pode gerar custos conforme o provedor e o modelo.

## Requisitos
Node.js 18 ou superior num computador ou hospedagem que aceite Node. Para usar apenas o celular, é possível editar e hospedar o projeto por uma plataforma online que aceite aplicações Node. O navegador Android deve permitir microfone e, para alguns recursos, HTTPS.

## Executar localmente
1. Instale Node.js 18+.
2. Extraia o ZIP.
3. Copie `.env.example` para `.env`.
4. Edite `.env` e preencha `AI_API_KEY`, `AI_BASE_URL` e `AI_MODEL`.
5. No terminal, dentro da pasta do projeto, execute `npm start`.
6. Abra `http://localhost:3000` no navegador do dispositivo/ambiente.

Não publique o arquivo `.env`, não envie sua chave no chat e não faça commit dele em repositórios.

## Hospedar
Publique a pasta como serviço Node numa hospedagem compatível:
- Build command: `npm install` (não há dependências externas)
- Start command: `npm start`
- Configure as variáveis de ambiente `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`.
- Use HTTPS para o microfone funcionar de forma mais confiável.
- Restrinja o acesso antes de tornar o serviço público: esta versão não inclui autenticação nem limite de uso por usuário.

## Provedores
Padrão: endpoint OpenAI `https://api.openai.com/v1`, modelo `gpt-4.1-mini`. O acesso e a disponibilidade dependem da conta e do provedor. Para um endpoint compatível, altere `AI_BASE_URL` e `AI_MODEL`.

## Segurança antes de publicar
Esta é uma versão inicial para uso pessoal/teste. Antes de abrir para outras pessoas, adicione autenticação, rate limiting, proteção contra abuso, limites de gastos e política de privacidade. O servidor não implementa controle de acesso nesta versão.
