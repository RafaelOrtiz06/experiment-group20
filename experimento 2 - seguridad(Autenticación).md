experimento 2 - seguridad(Autenticación)

Táctica de seguridad basada en control de accesos:
utilizaremos un gateway(ingress) el cuál hará la labor de punto de entrada con el mundo exterior, una vez un cliente haga una petición, el gateway
redireccionará la solicitud a un microservicio autorizador, el cuál, retornará un token de acceso(mediante JWT) indicando el rol y nivel de acceso del usuario