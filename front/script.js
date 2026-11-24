
const API = "http://localhost/redesocial/back/api.php?rota=";

let usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
);


// =====================================
// FUNÇÃO PARA CONVERSAR COM O BACKEND
// =====================================

async function requisicao(rota, metodo = "GET", dados = null) {

    const configuracao = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (dados !== null) {
        configuracao.body = JSON.stringify(dados);
    }

    const resposta = await fetch(
        API + encodeURIComponent(rota),
        configuracao
    );

    const texto = await resposta.text();

    let resultado;

    try {
        resultado = texto ? JSON.parse(texto) : {};
    } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
    }

    if (!resposta.ok) {
        throw new Error(
            resultado.erro ||
            resultado.mensagem ||
            "Erro ao realizar a operação."
        );
    }

    return resultado;
}


// =====================================
// NAVEGAÇÃO ENTRE AS TELAS
// =====================================

function mostrarLogin(event) {

    if (event) event.preventDefault();

    document.getElementById("telaLogin").hidden = false;
    document.getElementById("telaCadastro").hidden = true;
    document.getElementById("telaFeed").hidden = true;

    document.getElementById("btnSair").hidden = true;
}

function mostrarCadastro(event) {

    if (event) event.preventDefault();

    document.getElementById("telaLogin").hidden = true;
    document.getElementById("telaCadastro").hidden = false;
    document.getElementById("telaFeed").hidden = true;

    document.getElementById("btnSair").hidden = true;
}


// =====================================
// CADASTRO DE USUÁRIO
// =====================================

document.getElementById("formCadastro").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const botao = event.submitter;
        botao.disabled = true;
        botao.textContent = "Cadastrando...";

        const dados = {
            nome: document.getElementById("nome").value.trim(),
            username: document.getElementById("username").value.trim(),
            email: document.getElementById("email").value.trim(),
            senha: document.getElementById("senha").value
        };

        try {

            const resultado = await requisicao(
                "usuario",
                "POST",
                dados
            );

            alert(
                resultado.mensagem ||
                "Conta criada com sucesso! Agora faça seu login."
            );

            document.getElementById("formCadastro").reset();

            document.getElementById("loginUsuario").value = dados.username;

            mostrarLogin();

        } catch (erro) {

            alert(erro.message);

        } finally {

            botao.disabled = false;
            botao.textContent = "Criar minha conta";

        }
    }
);


// =====================================
// LOGIN
// =====================================

document.getElementById("formLogin").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const botao = event.submitter;
        botao.disabled = true;
        botao.textContent = "Entrando...";

        const dados = {
            username: document.getElementById("loginUsuario").value.trim(),
            senha: document.getElementById("loginSenha").value
        };

        try {

            const resultado = await requisicao(
                "login",
                "POST",
                dados
            );

            // Aceita o usuário dentro de resultado.usuario
            // ou diretamente na resposta do PHP.

            usuarioLogado = resultado.usuario || resultado;

            if (!usuarioLogado.id_usuario) {
                throw new Error(
                    "O login foi realizado, mas o servidor não retornou o ID do usuário."
                );
            }

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuarioLogado)
            );

            document.getElementById("formLogin").reset();

            abrirFeed();

        } catch (erro) {

            alert(erro.message);

        } finally {

            botao.disabled = false;
            botao.textContent = "Entrar na conta";

        }
    }
);


// =====================================
// ABRIR FEED
// =====================================

function abrirFeed() {

    document.getElementById("telaLogin").hidden = true;
    document.getElementById("telaCadastro").hidden = true;
    document.getElementById("telaFeed").hidden = false;

    document.getElementById("btnSair").hidden = false;

    const nome = usuarioLogado.nome || usuarioLogado.username;

    document.getElementById("nomeUsuario").textContent =
        "Olá, " + nome;

    carregarPublicacoes();
}


// =====================================
// CARREGAR PUBLICAÇÕES
// =====================================

async function carregarPublicacoes() {

    const feed = document.getElementById("feed");

    feed.innerHTML = '<p class="carregando">Carregando publicações...</p>';

    try {

        const resultado = await requisicao("publicacao");

        const publicacoes = Array.isArray(resultado)
            ? resultado
            : resultado.publicacoes || [];

        feed.innerHTML = "";

        if (publicacoes.length === 0) {

            feed.innerHTML = `
                <p class="mensagem-vazia">
                    Ainda não existem publicações.
                    Seja o primeiro a compartilhar algo!
                </p>
            `;

            return;
        }

        publicacoes.forEach(function(post) {

            const div = document.createElement("article");
            div.className = "publicacao";

            // AUTOR

            const autor = document.createElement("div");
            autor.className = "autor-post";

            const avatar = document.createElement("div");
            avatar.className = "avatar";

            const nomeAutor =
                post.username ||
                post.nome ||
                "Usuário";

            avatar.textContent = nomeAutor.charAt(0).toUpperCase();

            const autorInfo = document.createElement("div");
            autorInfo.className = "autor-info";

            const nome = document.createElement("strong");
            nome.textContent = nomeAutor;

            const data = document.createElement("small");
            data.textContent = post.data_publicacao || "";

            autorInfo.appendChild(nome);
            autorInfo.appendChild(data);

            autor.appendChild(avatar);
            autor.appendChild(autorInfo);

            div.appendChild(autor);

            // LEGENDA

            const legenda = document.createElement("p");
            legenda.textContent = post.legenda || "";

            div.appendChild(legenda);

            // IMAGEM

            if (post.imagem_url) {

                try {

                    const url = new URL(post.imagem_url);

                    if (url.protocol === "http:" || url.protocol === "https:") {

                        const imagem = document.createElement("img");

                        imagem.src = url.href;
                        imagem.alt = "Imagem da publicação";
                        imagem.loading = "lazy";

                        imagem.onerror = function() {
                            imagem.remove();
                        };

                        div.appendChild(imagem);
                    }

                } catch {

                    console.log("URL de imagem inválida.");

                }
            }

            // CURTIR

            const botaoCurtir = document.createElement("button");

            botaoCurtir.className = "btnCurtir";
            botaoCurtir.textContent = "♡ Curtir";

            botaoCurtir.addEventListener("click", function() {

                curtirPublicacao(
                    post.id_publicacao,
                    botaoCurtir
                );

            });

            div.appendChild(botaoCurtir);

            feed.appendChild(div);

        });

    } catch (erro) {

        feed.innerHTML = "";

        const mensagem = document.createElement("p");
        mensagem.className = "mensagem-vazia";
        mensagem.textContent = erro.message;

        feed.appendChild(mensagem);

    }
}


// =====================================
// CRIAR PUBLICAÇÃO
// =====================================

document.getElementById("formPublicacao").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        if (!usuarioLogado || !usuarioLogado.id_usuario) {

            alert("Faça login novamente para publicar.");

            sair();

            return;
        }

        const botao = event.submitter;

        botao.disabled = true;
        botao.textContent = "Publicando...";

        const dados = {

            idUsuario: usuarioLogado.id_usuario,

            legenda: document.getElementById("legenda").value.trim(),

            imagemUrl: document.getElementById("imagemUrl").value.trim()

        };

        try {

            const resultado = await requisicao(
                "publicacao",
                "POST",
                dados
            );

            alert(
                resultado.mensagem ||
                "Publicação criada com sucesso!"
            );

            document.getElementById("formPublicacao").reset();

            await carregarPublicacoes();

        } catch (erro) {

            alert(erro.message);

        } finally {

            botao.disabled = false;
            botao.textContent = "+ Compartilhar publicação";

        }
    }
);


// =====================================
// CURTIR PUBLICAÇÃO
// =====================================

async function curtirPublicacao(idPublicacao, botao) {

    if (!usuarioLogado || !usuarioLogado.id_usuario) {

        alert("Você precisa estar logado para curtir.");

        sair();

        return;
    }

    botao.disabled = true;
    botao.textContent = "Curtindo...";

    const dados = {

        idUsuario: usuarioLogado.id_usuario,

        idPublicacao: Number(idPublicacao)

    };

    try {

        const resultado = await requisicao(
            "curtida",
            "POST",
            dados
        );

        botao.textContent = "♥ Curtido";

        alert(
            resultado.mensagem ||
            "Você curtiu essa publicação!"
        );

    } catch (erro) {

        botao.disabled = false;
        botao.textContent = "♡ Curtir";

        alert(erro.message);

    }
}


// =====================================
// SAIR DA CONTA
// =====================================

function sair() {

    localStorage.removeItem("usuarioLogado");

    usuarioLogado = null;

    document.getElementById("nomeUsuario").textContent = "";

    document.getElementById("formLogin").reset();

    mostrarLogin();

}


// =====================================
// INICIALIZAÇÃO DO SISTEMA
// =====================================

if (usuarioLogado && usuarioLogado.id_usuario) {

    abrirFeed();

} else {

    usuarioLogado = null;

    localStorage.removeItem("usuarioLogado");

    mostrarLogin();

}

