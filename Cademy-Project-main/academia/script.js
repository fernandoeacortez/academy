const form = document.getElementById("formAluno");
const tabela = document.querySelector("#tabelaAlunos tbody");
const btnToggleForm = document.getElementById("btnToggleForm");
const btnToggleTabela = document.getElementById("btnToggleTabela");
const secaoTabela = document.getElementById("secaoTabela");
const matriculaInput = document.getElementById("matricula");

let alunos = JSON.parse(localStorage.getItem("alunos")) || [];
let graficoPlanos;

// Gera número de matrícula automática
function gerarMatricula() {
  const maior = alunos.reduce((max, aluno) => {
    const num = parseInt(aluno.matricula);
    return isNaN(num) ? max : Math.max(max, num);
  }, 1000);
  return (maior + 1).toString();
}

function salvarAlunos() {
  localStorage.setItem("alunos", JSON.stringify(alunos));
}

function atualizarEstatisticas() {
  document.getElementById("totalAlunos").textContent = alunos.length;
  const planos = [...new Set(alunos.map(aluno => aluno.plano))];
  document.getElementById("planosUnicos").textContent = planos.length;
}

function atualizarGraficoPlanos() {
  const contagemPlanos = {};
  alunos.forEach(aluno => {
    contagemPlanos[aluno.plano] = (contagemPlanos[aluno.plano] || 0) + 1;
  });

  const labels = Object.keys(contagemPlanos);
  const dados = Object.values(contagemPlanos);
  const cores = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f'];

  const config = {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Distribuição de Planos',
        data: dados,
        backgroundColor: cores.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  if (graficoPlanos) graficoPlanos.destroy();

  const ctx = document.getElementById('graficoPlanos').getContext('2d');
  graficoPlanos = new Chart(ctx, config);
}

function renderizarTabela() {
  tabela.innerHTML = "";
  alunos.forEach((aluno, index) => {
    const row = tabela.insertRow();
    row.innerHTML = `
      <td>${aluno.nome}</td>
      <td>${aluno.idade}</td>
      <td>${aluno.endereco}</td>
      <td>${aluno.telefone}</td>
      <td>${aluno.cpf}</td>
      <td>${aluno.plano}</td>
      <td>${aluno.matricula}</td>
      <td>
        <button class="acao editar" onclick="editarAluno(${index})">Editar</button>
        <button class="acao excluir" onclick="removerAluno(${index})">Excluir</button>
      </td>
    `;
  });

  atualizarEstatisticas();
  atualizarGraficoPlanos();
  matriculaInput.value = gerarMatricula(); // Preenche nova matrícula automaticamente
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const idade = parseInt(document.getElementById("idade").value);
  const endereco = document.getElementById("endereco").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const plano = document.getElementById("plano").value;
  const matricula = matriculaInput.value;

  // Validação do nome
  if (nome.length < 3) {
    alert("O nome deve ter pelo menos 3 caracteres.");
    return;
  }

  // Validação da idade
  if (isNaN(idade) || idade < 10 || idade > 120) {
    alert("A idade deve estar entre 10 e 120 anos.");
    return;
  }

  // Validação do CPF
  if (!/^\d{11}$/.test(cpf)) {
    alert("O CPF deve ter 11 dígitos.");
    return;
  }

  // Validação do telefone
  if (!/^\([0-9]{2}\)[0-9]{4,5}-[0-9]{4}$/.test(telefone)) {
    alert("O telefone deve estar no formato (XX) 1234-5678 ou (XX) 98765-4321.");
    return;
  }

  // Validação do plano
  const planosValidos = ["Mensal", "Trimestral", "Anual"];
  if (!planosValidos.includes(plano)) {
    alert("Selecione um plano válido.");
    return;
  }

  alunos.push({ nome, idade, endereco, telefone, cpf, plano, matricula });
  salvarAlunos();
  renderizarTabela();
  form.reset();
});

function editarAluno(index) {
  const aluno = alunos[index];
  document.getElementById("nome").value = aluno.nome;
  document.getElementById("idade").value = aluno.idade;
  document.getElementById("endereco").value = aluno.endereco;
  document.getElementById("telefone").value = aluno.telefone;
  document.getElementById("cpf").value = aluno.cpf;
  document.getElementById("plano").value = aluno.plano;
  matriculaInput.value = aluno.matricula;

  alunos.splice(index, 1); // Remove temporariamente
  salvarAlunos();
  renderizarTabela();
}

function removerAluno(index) {
  if (confirm("Tem certeza que deseja excluir este aluno?")) {
    alunos.splice(index, 1);
    salvarAlunos();
    renderizarTabela();
  }
}

// Mostrar/Ocultar formulário
btnToggleForm.addEventListener("click", () => {
  form.classList.toggle("oculto");
  const visivel = !form.classList.contains("oculto");
  btnToggleForm.textContent = visivel ? "📋 Cadastro de Aluno" : "📋 Mostrar Cadastro";
});

// Mostrar/Ocultar tabela de alunos
btnToggleTabela.addEventListener("click", () => {
  secaoTabela.classList.toggle("oculto");
  const visivel = !secaoTabela.classList.contains("oculto");
  btnToggleTabela.textContent = visivel ? "👥 Alunos" : "👥 Mostrar Alunos";
});

// Inicializa a interface
renderizarTabela();