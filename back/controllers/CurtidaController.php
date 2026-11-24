<?php

require_once __DIR__ . "/../models/CurtidaModel.php";

// RECEBER DADOS
function receberDadosCurtida() {

    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados)) {

        http_response_code(400);

        echo json_encode([
            "erro" => "Envie os dados da curtida."
        ]);

        return null;
    }

    foreach (["idUsuario", "idPublicacao"] as $campo) {

        $valor = filter_var(
            $dados[$campo] ?? null,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]]
        );

        if ($valor === false) {

            http_response_code(400);

            echo json_encode([
                "erro" => "Informe um ID válido para $campo."
            ]);

            return null;
        }

        $dados[$campo] = $valor;
    }

    return $dados;
}

// CREATE
function createCurtida($con) {

    $dados = receberDadosCurtida();

    if ($dados === null) {
        return;
    }

    $id = inserirCurtida($con, $dados);

    http_response_code(201);

    echo json_encode([
        "mensagem" => "Curtida registrada com sucesso!",
        "id" => $id
    ]);
}

// READ
function readCurtida($con) {

    echo json_encode(listarCurtidas($con));
}

// DELETE
function deleteCurtida($con) {

    $dados = receberDadosCurtida();

    if ($dados === null) {
        return;
    }

    removerCurtida(
        $con,
        $dados["idUsuario"],
        $dados["idPublicacao"]
    );

    echo json_encode([
        "mensagem" => "Curtida removida com sucesso!"
    ]);
}