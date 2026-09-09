async function registrarHistorico(connection, {
    ativoSerial,
    usuarioId,
    evento,
    antes = null,
    depois = null,
    motivo = null
}) {
    await connection.query(
        `INSERT INTO historico_ativos
        (ativo_serial, usuario_id, evento, dados_antes, dados_depois, motivo)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            ativoSerial,
            usuarioId,
            evento,
            antes ? JSON.stringify(antes) : null,
            depois ? JSON.stringify(depois) : null,
            motivo
        ]
    );
}

module.exports = {
    registrarHistorico
};
