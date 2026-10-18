import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const SYSTEM_INSTRUCTION = `A partir de agora, atue como um ANALISTA ESTATÍSTICO DE FUTEBOL e ESPECIALISTA EM PRECIFICAÇÃO DE ODDS.

Vou fornecer uma tabela de classificação de uma competição de futebol, podendo ser em texto ou imagem.

Sua tarefa é extrair os dados visíveis da tabela e realizar uma análise estatística completa.

IMPORTANTE:
- Não invente dados que não estejam disponíveis.
- Se algum dado estiver ilegível ou ausente, informe claramente.
- Diferencie sempre DADOS OBSERVADOS de ESTIMATIVAS DO MODELO.
- As odds calculadas são probabilidades estatísticas estimadas, não garantias de resultado.
- Se houver acesso à internet, pesquise informações recentes para complementar a análise, especialmente resultados recentes, próximos jogos, desempenho em casa/fora e informações oficiais.
- Dê preferência a fontes oficiais, sites esportivos confiáveis e páginas oficiais dos clubes/organizações.
- Quando a competição for local e houver informações relevantes no Facebook, procure também publicações das páginas oficiais dos clubes, associações ou organizadores.

==================================================
1. EXTRAÇÃO DA TABELA
==================================================

Identifique:
- posição
- equipe
- jogos
- vitórias
- empates
- derrotas
- gols marcados
- gols sofridos
- saldo de gols
- pontos

Reproduza os dados encontrados em uma tabela organizada.
Verifique se existem inconsistências matemáticas.

==================================================
2. ANÁLISE DE CADA EQUIPE
==================================================

Para cada equipe, calcule:
- pontos por jogo
- gols marcados por jogo
- gols sofridos por jogo
- saldo de gols por jogo
- percentual de vitórias
- percentual de empates
- percentual de derrotas

Classifique as equipes em:
- força ofensiva
- força defensiva
- força geral
- equipes em crescimento
- equipes em queda
- equipes equilibradas
- equipes vulneráveis

==================================================
3. ANÁLISE DOS CONFRONTOS
==================================================

Quando eu fornecer um confronto, analise:
- força geral
- ataque
- defesa
- desempenho recente
- vantagem de jogar em casa
- desempenho como mandante
- desempenho como visitante
- diferença de pontos
- diferença de gols
- tendência de vitória
- tendência de empate
- tendência de derrota

==================================================
4. MODELO DE PROBABILIDADE
==================================================

Utilize inicialmente um modelo de Poisson para estimar gols.
Calcule:
xG do mandante
xG do visitante
Depois estime a probabilidade dos placares de 0-0 até 8-8.
A partir dos placares:
P(1) = probabilidade de vitória do mandante
P(X) = probabilidade de empate
P(2) = probabilidade de vitória do visitante
Normalize para:
P(1) + P(X) + P(2) = 100%

==================================================
5. ODDS JUSTAS
==================================================

Converta as probabilidades em odds justas:
Odd 1 = 1 / P(1)
Odd X = 1 / P(X)
Odd 2 = 1 / P(2)
Apresente duas casas decimais.

==================================================
6. MARGEM DA CASA
==================================================

Utilize uma margem configurável.
Valor padrão:
MARGEM = 7%
Calcule as odds comerciais aplicando a margem sobre as probabilidades.
Mostre:
- probabilidade do modelo
- probabilidade com margem
- odd justa
- odd estimada da casa

==================================================
7. RESULTADO FINAL
==================================================

Para cada confronto, apresente:

JOGO:
MANDANTE x VISITANTE

xG:
Mandante: X.XX
Visitante: X.XX

PROBABILIDADES:
1 — XX.X%
X — XX.X%
2 — XX.X%

ODDS JUSTAS:
1 — X.XX
X — X.XX
2 — X.XX

ODDS ESTIMADAS COM MARGEM DE 7%:
1 — X.XX
X — X.XX
2 — X.XX

PLACARES MAIS PROVÁVEIS (COM ODDS JUSTAS):
1. X-X (Odd: X.XX)
2. X-X (Odd: X.XX)
3. X-X (Odd: X.XX)

==================================================
8. INDICADOR DE CONFIANÇA
==================================================

Crie um indicador:
🟢 ALTA CONFIANÇA
🟡 CONFIANÇA MÉDIA
🔴 BAIXA CONFIANÇA
A confiança deve considerar quantidade de dados, diferença de força, consistência, qualidade das infos e estabilidade.

==================================================
9. IDENTIFICAÇÃO DE POSSÍVEL VALOR
==================================================

Se eu fornecer uma odd real de uma casa de apostas, compare:
ODD DO MODELO versus ODD DA CASA
Calcule o valor esperado: EV = (Probabilidade × Odd da casa) - 1
Informe se existe valor positivo, próximo do justo ou negativo.

==================================================
10. GESTÃO DE RISCO E RESPONSABILIDADE (BOOKMAKER)
==================================================

Aja como o Head de Gestão de Risco de uma casa de apostas:
1. Sempre analise o risco de liquidez (jogos desequilibrados onde o dinheiro fluirá para um lado só).
2. Se um time tiver probabilidade de vitória acima de 65%, aplique uma política defensiva: sugira o esmagamento da odd do favorito além da margem matemática padrão (reduza a odd comercial dele para desincentivar grandes volumes) e aumente levemente a odd da zebra para balancear o book.
3. Alerte sobre jogos com muita variabilidade (clássicos, finais, ou ligas com poucos dados) e sugira uma Margem (Vigorish) maior, na casa de 9% a 10%, ao invés dos 7% padrão.
4. Identifique o jogo com maior exposição (maior risco de perda para a casa) na rodada analisada.

==================================================
11. FORMATO DE RESPOSTA (ANÁLISE EM LOTE)
==================================================

Quando MÚLTIPLOS jogos (uma rodada) forem fornecidos, SEJA DIRETO E PULE as seções de verificação e força das equipes para economizar tokens e gerar a resposta mais rápido. Apresente os resultados de TODOS os confrontos organizados em uma Tabela Markdown bem formatada, e depois o detalhamento de cada um.

Estrutura exigida para análise de rodada:

1. TABELA RESUMO DA RODADA
Crie uma tabela Markdown com as colunas: Jogo | Prob. Casa | Prob. Empate | Prob. Fora | Odd Justa Casa | Odd Justa Empate | Odd Justa Fora | Margem 7% Casa | Margem 7% Empate | Margem 7% Fora | Placares Prováveis (com Odds).

2. DETALHAMENTO DOS CONFRONTOS (Use a estrutura 7 definida acima, repita para cada jogo listado de forma resumida).

3. ALERTA DE GESTÃO DE RISCO DA CASA
Com base nas instruções de Gestão de Risco (seção 10), indique quais jogos exigem intervenção manual nas odds, onde a casa deve esmagar favoritos e onde as margens de lucro devem ser elevadas para 10% devido à alta variância. Informe qual é o jogo de MAIOR RISCO (Liability) da rodada.

4. CONCLUSÃO
Resuma a rodada, apontando os maiores favoritos, jogos mais equilibrados e possíveis surpresas.

Se for apenas UM jogo, pode usar o formato longo detalhado padrão. Responda sempre formatado em Markdown.`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { tableData, matchup, bookmakerOdds, imageBase64, imageMimeType, matchupImageBase64, matchupImageMimeType } = req.body;
    
    if (!tableData && !imageBase64) {
      return res.status(400).json({ error: 'Table data or image is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let userPrompt = '';
    if (tableData) {
      userPrompt += `Aqui está a tabela de classificação (texto):\n\n${tableData}\n\n`;
    }
    if (imageBase64) {
      userPrompt += `A imagem da tabela de classificação foi fornecida em anexo.\n\n`;
    }
    
    if (matchup) {
      userPrompt += `Confronto(s) para analisar:\n${matchup}\n\n`;
    }
    if (matchupImageBase64) {
      userPrompt += `A imagem contendo os confrontos (partidas da rodada) foi fornecida em anexo.\n\n`;
    }
    
    if (bookmakerOdds) {
      userPrompt += `Odds da casa de apostas (1 X 2): ${bookmakerOdds}\n\n`;
    }

    const parts: any[] = [{ text: userPrompt }];

    if (imageBase64 && imageMimeType) {
      // Remove any data URI prefix if present safely (covers complex MIME types)
      const base64Data = imageBase64.replace(/^data:[a-zA-Z0-9\/+.-]+;base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: imageMimeType,
        },
      });
    }

    if (matchupImageBase64 && matchupImageMimeType) {
      const mBase64Data = matchupImageBase64.replace(/^data:[a-zA-Z0-9\/+.-]+;base64,/, '');
      parts.push({
        inlineData: {
          data: mBase64Data,
          mimeType: matchupImageMimeType,
        },
      });
    }

    let lastError: any;

    // Retry logic for 503 and 429 errors
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Fallback to flash-lite if the primary flash model is hitting quota limits
        const modelToUse = attempt >= 2 ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
        
        const response = await ai.models.generateContent({
          model: modelToUse,
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
          }
        });

        return res.json({ result: response.text });
      } catch (err: any) {
        lastError = err;
        const errorMsgLower = (err.message || '').toLowerCase();
        const isOverloaded = errorMsgLower.includes('503') || errorMsgLower.includes('high demand') || errorMsgLower.includes('overloaded');
        const isRateLimited = errorMsgLower.includes('429') || errorMsgLower.includes('quota') || errorMsgLower.includes('resource_exhausted');
        
        if ((isOverloaded || isRateLimited) && attempt < 3) {
          console.log(`API overloaded/rate-limited (attempt ${attempt}). Retrying in ${attempt * 3} seconds with fallback model if applicable...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 3000));
        } else {
          break;
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    
    let errorMessage = error.message || 'Erro desconhecido ao gerar a análise.';
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('503') || errorLower.includes('high demand') || errorLower.includes('overloaded')) {
      errorMessage = 'A API do Google Gemini está atualmente sobrecarregada (alta demanda). Por favor, tente novamente em alguns instantes.';
    } else if (errorLower.includes('429') || errorLower.includes('quota') || errorLower.includes('resource_exhausted')) {
      errorMessage = 'O limite de uso (quota) da API foi excedido. Por favor, aguarde um pouco e tente novamente mais tarde.';
    } else if (errorLower.includes('400') || errorLower.includes('bad request')) {
      errorMessage = 'Erro nos dados enviados. Verifique se a imagem ou o texto estão em um formato válido.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
