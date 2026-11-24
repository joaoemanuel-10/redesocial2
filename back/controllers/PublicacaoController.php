<?php

require_once __DIR__ . "/../models/PublicacaoModel.php";

function receberDadosPublicacao() {

    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados)) {

        http_response_code(400);

        echo json_encode([
            "erro" => "Envie os dados da publicação."
        ]);

        return null;
    }

    if (
        !isset($dados["conteudo"]) ||
        !is_string($dados["conteudo"]) ||
        trim($dados["conteudo"]) === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "erro" => "O conteúdo é obrigatório."
        ]);

        return null;
    }

    return $dados;
}

function receberIdPublicacao() {

    $id = filter_var(
        $_GET["id"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    if ($id === false) {

        http_response_code(400);

        echo json_encode([
            "erro" => "Informe um ID válido."
        ]);

        return null;
    }

    return $id;
}

function createPublicacao($con) {

    $dados = receberDadosPublicacao();

    if ($dados === null) {
        return;
    }

    $idUsuario = filter_var(
        $dados["idUsuario"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    if ($idUsuario === false) {

        http_response_code(400);

        echo json_encode([
            "erro" => "Informe um usuário válido."
        ]);

        return;
    }

    $dados["idUsuario"] = $idUsuario;

    $id = inserirPublicacao($con, $dados);

    http_response_code(201);

    echo json_encode([
        "mensagem" => "Publicação criada com sucesso!",
        "id" => $id
    ]);
}

function readPublicacao($con) {

    echo json_encode(listarPublicacoes($con));
}

function updatePublicacao($con) {

    $id = receberIdPublicacao();

    if ($id === null) {
        return;
    }

    $dados = receberDadosPublicacao();

    if ($dados === null) {
        return;
    }

    atualizarPublicacao($con, $id, $dados);

    echo json_encode([
        "mensagem" => "Publicação atualizada com sucesso!"
    ]);
}

function deletePublicacao($con) {

    $id = receberIdPublicacao();

    if ($id === null) {
        return;
    }

    removerPublicacao($con, $id);

    echo json_encode([
        "mensagem" => "Publicação removida com sucesso!"
    ]);
}