// Defina aqui a lista de todos os simulados disponíveis e o nome do arquivo JSON correspondente dentro da pasta dados/
const simuladosDisponiveis = [
  {
    id: "simulado-01", // Corresponde ao arquivo dados/simulado-01.json
    titulo: "Simulado 01 - PM AL",
    descricao: "120 Questões - Estilo Cebraspe (Certo / Errado)"
  },
  {
    id: "simulado-02", // Corresponde ao arquivo dados/simulado-02.json
    titulo: "Simulado 02 - PM AL",
    descricao: "120 Questões - Estilo Cebraspe (Certo / Errado)"
  },
  {
    id: "simulado-03", // Corresponde ao arquivo dados/simulado-03.json
    titulo: "Simulado 03 - PM AL",
    descricao: "120 Questões - Estilo Cebraspe (Certo / Errado)"
  }
];

function renderizarListaSimulados() {
  const container = document.getElementById('lista-simulados');
  container.innerHTML = "";

  if (simuladosDisponiveis.length === 0) {
    container.innerHTML = "<p>Nenhum simulado disponível no momento.</p>";
    return;
  }

  simuladosDisponiveis.forEach(sim => {
    const card = document.createElement('div');
    card.className = 'card-simulado';

    card.innerHTML = `
      <div class="info-simulado">
        <h3>${sim.titulo}</h3>
        <p>${sim.descricao}</p>
      </div>
      <a href="simulado.html?id=${sim.id}" class="btn-iniciar">Iniciar Simulado</a>
    `;

    container.appendChild(card);
  });
}

// Renderiza a lista assim que a página carregar
document.addEventListener('DOMContentLoaded', renderizarListaSimulados);