<?php

// CREATE
function inserirCurtida($con, $dados) {

    $stmt = $con->prepare(
        "INSERT INTO curtidas (id_usuario, id_publicacao)
        VALUES (?, ?)"
    );

    $stmt->execute([
        $dados["idUsuario"],
        $dados["idPublicacao"]
    ]);

    return $con->lastInsertId();
}

// READ
function listarCurtidas($con) {

    $stmt = $con->query(
        "SELECT * FROM curtidas"
    );

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// DELETE
function removerCurtida($con, $idUsuario, $idPublicacao) {

    $stmt = $con->prepare(
        "DELETE FROM curtidas
        WHERE id_usuario = ? AND id_publicacao = ?"
    );

    $stmt->execute([
        $idUsuario,
        $idPublicacao
    ]);
}