<?php

function inserirUsuario($con, $dados) {
    $stmt = $con->prepare(
    "INSERT INTO USUARIO (nome, username, email, senha)
        VALUES (?,?,?,?)"
    );
    stmt->execute([$dados['nome'], $dados['username'], $dados['email'], $dados['senha'],]);
    return $con->lastInsertId();
}
//READ
function listarUsuarios($con) {
    $stmt = $con->query("SELECT * FROM usuarios");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
//UPDATE
function updateUsuario($con) {
    $stmt = $con-> prepare(
        "UPDATE usuarios SET senha = ? WHERE id_usuario = ?"
        );
    stmt->execute([$dados["senha"],
                             $id]);
}
//DELETE
function removerUsuario($con, $id) {
    $stmt = $con->prepare(
        "DELETE FROM usuarios WHERE id_usuario = ?"
    );
    $stmt->execute([$id]);
}