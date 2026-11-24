<?php

require_once __DIR__ . "/../models/UsuarioModel.php";

function teste () {
    echo json_encode([
        "mensagem" => "Back-end respondendo com sucesso!"
    ]);
    exit;
}
//Recebe e valida os dados ante de chamar o model
function receberDadosUsuario(){
    $dados = json_decode(file_get_contents("php://input"), true);

    if(!is_array($dados)) {
        http_response_code(400);
        echo json_encode([
            "erro" => "Envia um objeto JSON com os dados do usuário."
        ]);
       return null; 
    }
    foreach (["nome", "username", "email", "senha"] as $campo) {
        if (!isset($dados[$campo])) {
            !is_string($dados[$campo]) || 
            trim($dados[$campo]) === "") {
            http_response_code(400);
            echo json_encode([
                "erro" => 
                "o campo $campo é obrigatório e deve ser uma string não vazio."
            ]);
            return null;
        }
    }
    return $dados;
}

function receberIdUsuario() {
    $id = filter_var($_GET["id"] ?? null, FILTER_VALIDATE_INT,
    ["options"=> ["min_range" => 1]]);
    if ($id === false) {
        http_response_code(400);
        echo json_encode([
            "erro" => "Informe um id de usuario válido"
        ]);
        return null;
    }
    return $id;
}
function createUsuario($con) {
    $dados = receberDadosUsuario();
    if ($dados === null) {
        return;
    }
    $id = inserirUsuario($con, $dados);
    http_response_code(201);
    echo json_encode([
        "mensagem" => "Usuario criado com sucesso",
        "id" => $id
    ]);
}
function readUsuario($con) {
    echo json_encode(listarUsuarios($con));
}
function updateUsuario($con) {
    $id = receberIdUsuario();
    if ($id === null) {
        return;
    }
    $dados = receberDadosUsuario();
    if ($id === null) {
        return;
    }
    atualizarUsuario($con, $id, $dados);
    echo json_encode([
        "mensagem" => "Senha alterada com sucesso!"
    ]);
}
function deleteUsuario($con) {
    $id = receberIdUsuario();
    if ($id === null) {
        return;
    }
    removerUsuario($con, $id);
    echo json_encode([
        "mensagem" => "Usuario removido com sucesso!"
    ]);
}