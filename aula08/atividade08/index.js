const formulario = document.getElementById("formCadastro");
const campos = formulario.querySelectorAll("input:not([type='checkbox']), select");
const status = document.getElementById("status");
const botao = document.getElementById("botaoEnviar");

// Máscaras de CPF, telefone e CEP.
function apenasNumeros(valor) {
  return valor.replace(/\\D/g, "");
}

document.getElementById("cpf").addEventListener("input", (evento) => {
  let valor = apenasNumeros(evento.target.value).slice(0, 11);
  valor = valor.replace(/(\\d{3})(\\d)/, "$1.$2");
  valor = valor.replace(/(\\d{3})(\\d)/, "$1.$2");
  valor = valor.replace(/(\\d{3})(\\d{1,2})$/, "$1-$2");
  evento.target.value = valor;
});

document.getElementById("telefone").addEventListener("input", (evento) => {
  let valor = apenasNumeros(evento.target.value).slice(0, 11);
  valor = valor.replace(/^(\\d{2})(\\d)/, "($1) $2");
  valor = valor.replace(/(\\d{5})(\\d{1,4})$/, "$1-$2");
  evento.target.value = valor;
});

document.getElementById("cep").addEventListener("input", (evento) => {
  let valor = apenasNumeros(evento.target.value).slice(0, 8);
  valor = valor.replace(/(\\d{5})(\\d)/, "$1-$2");
  evento.target.value = valor;
});

function validarCPF(cpf) {
  const numeros = apenasNumeros(cpf);
  if (numeros.length !== 11 || /^([0-9])\\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(numeros[i]) * (10 - i);
  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  if (digito !== Number(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(numeros[i]) * (11 - i);
  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  return digito === Number(numeros[10]);
}

function mostrarErro(campo, mensagem) {
  campo.classList.add("invalido");
  const areaErro = campo.closest(".campo")?.querySelector(".erro");
  if (areaErro) areaErro.textContent = mensagem;
}

function limparErro(campo) {
  campo.classList.remove("invalido");
  const areaErro = campo.closest(".campo")?.querySelector(".erro");
  if (areaErro) areaErro.textContent = "";
}

function validarFormulario() {
  let valido = true;

  campos.forEach((campo) => {
    limparErro(campo);

    if (!campo.value.trim()) {
      mostrarErro(campo, "Este campo é obrigatório.");
      valido = false;
      return;
    }

    if (campo.type === "email" && !campo.validity.valid) {
      mostrarErro(campo, "Digite um e-mail válido.");
      valido = false;
    } else if (campo.id === "nome" && campo.value.trim().length < 3) {
      mostrarErro(campo, "Informe seu nome completo.");
      valido = false;
    } else if (campo.id === "cpf" && !validarCPF(campo.value)) {
      mostrarErro(campo, "Digite um CPF válido.");
      valido = false;
    } else if (campo.id === "telefone" && apenasNumeros(campo.value).length < 10) {
      mostrarErro(campo, "Digite um telefone válido com DDD.");
      valido = false;
    } else if (campo.id === "cep" && apenasNumeros(campo.value).length !== 8) {
      mostrarErro(campo, "O CEP deve conter 8 números.");
      valido = false;
    } else if (campo.id === "senha" && campo.value.length < 8) {
      mostrarErro(campo, "A senha deve ter pelo menos 8 caracteres.");
      valido = false;
    }
  });

  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  limparErro(confirmarSenha);
  if (senha.value !== confirmarSenha.value) {
    mostrarErro(confirmarSenha, "As senhas não coincidem.");
    valido = false;
  }

  const termos = document.getElementById("termos");
  const erroTermos = document.querySelector(".erro-termos");
  erroTermos.textContent = "";
  if (!termos.checked) {
    erroTermos.textContent = "É necessário aceitar os termos.";
    valido = false;
  }

  return valido;
}

campos.forEach((campo) => {
  campo.addEventListener("input", () => limparErro(campo));
  campo.addEventListener("change", () => limparErro(campo));
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  status.textContent = "";

  if (!validarFormulario()) {
    status.textContent = "Verifique os campos destacados antes de enviar.";
    status.style.color = "#dc2626";
    return;
  }

  const dados = Object.fromEntries(new FormData(formulario).entries());
  delete dados.termos; // O aceite é usado na validação, não precisa ser enviado como campo.

  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    const resposta = await fetch("https://postman-echo.com/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const retorno = await resposta.json();
    alert("Cadastro enviado com sucesso!\n\nRetorno da API:\n" +
      JSON.stringify(retorno, null, 2));

    status.textContent = "Dados enviados com sucesso para a API.";
    status.style.color = "#15803d";
    formulario.reset();
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível enviar os dados. Verifique sua conexão e tente novamente.");
    status.textContent = "Falha ao enviar os dados para a API.";
    status.style.color = "#dc2626";
  } finally {
    botao.disabled = false;
    botao.textContent = "Finalizar cadastro";
  }
});
