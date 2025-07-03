// js/price-alerts.js
const alarmes = [
  {
    moeda: 'solana',         // ID CoinGecko, ex: bitcoin, ethereum, solana
    vs: 'usd',                // moeda contra, ex: usd, eur
    precoAlvo: 180,
    direcao: 'acima',         // ou 'abaixo'
    ativo: true
  }
];

async function obterPrecoAtual(moeda, vs) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${moeda}&vs_currencies=${vs}`;
  const resposta = await fetch(url);
  const dados = await resposta.json();
  return dados[moeda][vs];
}

async function verificarAlarmes() {
  for (const alarme of alarmes) {
    if (!alarme.ativo) continue;

    const precoAtual = await obterPrecoAtual(alarme.moeda, alarme.vs);

    if (
      (alarme.direcao === 'acima' && precoAtual >= alarme.precoAlvo) ||
      (alarme.direcao === 'abaixo' && precoAtual <= alarme.precoAlvo)
    ) {
      alert(`🔔 Alerta: ${alarme.moeda.toUpperCase()} ${alarme.direcao} de ${alarme.precoAlvo} ${alarme.vs.toUpperCase()}`);
      alarme.ativo = false;
    }
  }
}

setInterval(verificarAlarmes, 60000); // verifica a cada minuto
