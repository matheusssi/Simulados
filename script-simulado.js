const urlParams = new URLSearchParams(window.location.search);
// Pega o ID passado na URL (ex: ?id=simulado-02). Se não passar nada, padrão é 'simulado-01'
const simuladoId = urlParams.get('id') || 'simulado-01';

let questoes = [];
let respostasUsuario = {};
let simuladoFinalizado = false;

async function carregarSimuladoCompleto() {
  const listaContainer = document.getElementById('lista-questoes');

  // Reseta o estado local para garantir que dados de outros simulados não fiquem na memória
  respostasUsuario = {};
  simuladoFinalizado = false;

  try {
    // O '?v=...' impede o navegador de usar o cache do simulado anterior
    const response = await fetch(`dados/${simuladoId}.json?v=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Arquivo dados/${simuladoId}.json não encontrado.`);
    }

    const data = await response.json();
    
    // Suporta tanto array [{ titulo: ..., questoes: [...] }] quanto objeto { titulo: ..., questoes: [...] }
    const simulado = Array.isArray(data) ? data[0] : data;
    questoes = simulado.questoes || [];

    document.getElementById('simulado-titulo').innerText = simulado.titulo || "SIMULADO";
    document.getElementById('simulado-subtitulo').innerText = simulado.subtitulo || "";

    if (questoes.length === 0) {
      listaContainer.innerHTML = "<div class='loading'>Nenhuma questão encontrada neste simulado.</div>";
      return;
    }

    // LIMPA A TELA antes de montar as novas questões
    listaContainer.innerHTML = "";

    // Renderiza cada questão do JSON atual
    questoes.forEach((q, index) => {
      const card = document.createElement('div');
      card.className = 'questao-card';
      card.id = `questao-${index + 1}`;

      let htmlTextoApoio = '';
      if (q.texto && q.texto.trim() !== "") {
        htmlTextoApoio = `<div class="texto-apoio">${q.texto}</div>`;
      }

      card.innerHTML = `
        <span class="materia-tag">${q.materia || ''}</span>
        ${htmlTextoApoio}
        <div class="enunciado">${q.enunciado}</div>

        <div class="opcoes">
          <label id="lbl-${index}-C">
            <input type="radio" name="resposta_${index}" value="C" onchange="salvarResposta(${index}, 'C')"> CERTO
          </label>
          <label id="lbl-${index}-E">
            <input type="radio" name="resposta_${index}" value="E" onchange="salvarResposta(${index}, 'E')"> ERRADO
          </label>
          <label id="lbl-${index}-SR">
            <input type="radio" name="resposta_${index}" value="SR" onchange="salvarResposta(${index}, 'SR')"> EM BRANCO
          </label>
        </div>

        <div class="gabarito-info" id="gabarito-${index}"></div>
      `;

      listaContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    listaContainer.innerHTML = `
      <div class='loading' style='color: red;'>
        Erro ao carregar o simulado!<br>
        Verifique se o arquivo <strong>dados/${simuladoId}.json</strong> realmente existe dentro da pasta <strong>dados/</strong>.
      </div>`;
  }
}

function salvarResposta(questaoIndex, valor) {
  if (simuladoFinalizado) return;

  respostasUsuario[questaoIndex] = valor;

  const card = document.getElementById(`questao-${questaoIndex + 1}`);
  const labels = card.querySelectorAll('.opcoes label');
  
  labels.forEach(lbl => lbl.classList.remove('selected'));

  const radioSelecionado = card.querySelector(`input[value="${valor}"]`);
  if (radioSelecionado) {
    radioSelecionado.parentElement.classList.add('selected');
  }
}

function finalizarSimulado() {
  if (simuladoFinalizado) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!confirm("Deseja realmente finalizar o simulado e ver seu resultado?")) {
    return;
  }

  simuladoFinalizado = true;

  let acertos = 0;
  let erros = 0;
  let emBranco = 0;
  let listaTextoFormatada = [];

  questoes.forEach((q, index) => {
    const respUser = respostasUsuario[index] || 'SR';
    const gabaritoOficial = q.gabarito;
    const gabaritoDiv = document.getElementById(`gabarito-${index}`);
    
    let textoOpcao = "EM BRANCO";
    if (respUser === 'C') textoOpcao = "CERTO";
    if (respUser === 'E') textoOpcao = "ERRADO";

    listaTextoFormatada.push(`${index + 1} - ${textoOpcao}`);

    const inputs = document.querySelectorAll(`input[name="resposta_${index}"]`);
    inputs.forEach(i => i.disabled = true);

    if (respUser === 'SR') {
      emBranco++;
      gabaritoDiv.className = 'gabarito-info incorreto';
      gabaritoDiv.innerHTML = `⚠️ Deixada em Branco | Gabarito Oficial: <strong>${gabaritoOficial === 'C' ? 'CERTO' : 'ERRADO'}</strong>`;
    } else if (respUser === gabaritoOficial) {
      acertos++;
      gabaritoDiv.className = 'gabarito-info correto';
      gabaritoDiv.innerHTML = `✅ Você acertou! Gabarito: <strong>${gabaritoOficial === 'C' ? 'CERTO' : 'ERRADO'}</strong>`;
    } else {
      erros++;
      gabaritoDiv.className = 'gabarito-info incorreto';
      const respUserTexto = respUser === 'C' ? 'CERTO' : 'ERRADO';
      const gabTexto = gabaritoOficial === 'C' ? 'CERTO' : 'ERRADO';
      gabaritoDiv.innerHTML = `❌ Você marcou ${respUserTexto} | Gabarito Oficial: <strong>${gabTexto}</strong>`;
    }

    gabaritoDiv.style.display = 'block';
  });

  const notaLiquida = acertos - erros;

  document.getElementById('res-nota').innerText = `Nota Líquida: ${notaLiquida}`;
  document.getElementById('res-certas').innerText = `Acertos: ${acertos}`;
  document.getElementById('res-erradas').innerText = `Erros: ${erros}`;
  document.getElementById('res-brancas').innerText = `Em Branco: ${emBranco}`;

  const tituloSimulado = document.getElementById('simulado-titulo').innerText;
  const textoGabarito = `--- MEU GABARITO (${tituloSimulado}) ---\nNota Líquida: ${notaLiquida} (A: ${acertos} | E: ${erros} | B: ${emBranco})\n\n` + listaTextoFormatada.join("\n");
  document.getElementById('lista-respostas-txt').value = textoGabarito;

  document.getElementById('painel-resultado').style.display = 'block';

  const btn = document.getElementById('btn-finalizar');
  btn.innerText = "Ver Desempenho no Topo";
  btn.style.background = "var(--primary)";

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copiarRespostas() {
  const txtArea = document.getElementById('lista-respostas-txt');
  txtArea.select();
  txtArea.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(txtArea.value).then(() => {
    const btn = document.getElementById('btn-copiar');
    btn.innerText = "✓ Copiado para a área de transferência!";
    btn.style.background = "var(--success)";
    
    setTimeout(() => {
      btn.innerText = "Copiar Lista de Respostas";
      btn.style.background = "var(--secondary)";
    }, 3000);
  }).catch(err => {
    alert("Erro ao copiar o texto.");
  });
}

// Inicia o carregamento dinâmico
carregarSimuladoCompleto();