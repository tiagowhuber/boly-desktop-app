extends Node

# ID del juego (configurar manualmente; el launcher tambien lo envia por -game_id)
var game_id: int = 5

# Clave de sesion recibida por -key. Es la UNICA credencial.
# El JWT del usuario ya NO se recibe ni se usa (-token fue eliminado).
var key: String = ""

# Intervalo del heartbeat. Debe ser menor al TTL del servidor (~3 min).
const HEARTBEAT_SECONDS := 60.0
const VALIDATE_URL := "https://ffstudios-shop-api.vercel.app/v1/validate/validate"

var http_request: HTTPRequest
var first_validation: bool = true
var consecutive_failures: int = 0

func _ready():
    # Crear nodo HTTPRequest dinamicamente
    http_request = HTTPRequest.new()
    add_child(http_request)
    http_request.request_completed.connect(_on_request_completed)

    # Obtener argumentos de linea de comandos
    var args = OS.get_cmdline_args()
    for i in range(args.size()):
        if args[i] == "-key" and i + 1 < args.size():
            key = args[i + 1]
        if args[i] == "-game_id" and i + 1 < args.size():
            game_id = int(args[i + 1])

    # La key es obligatoria; sin ella no hay sesion.
    if key == "" or game_id < 0:
        push_error("Validation error: missing -key.")
        get_tree().quit()
        return

    # Validacion inicial
    _send_validation_request()

    # Heartbeat periodico
    var timer = Timer.new()
    timer.wait_time = HEARTBEAT_SECONDS
    timer.autostart = true
    timer.timeout.connect(_send_validation_request)
    add_child(timer)

func _send_validation_request():
    # Body en JSON: solo game_id + key (sin token).
    var body = {
        "game_id": game_id,
        "key": key
    }
    var headers = ["Content-Type: application/json"] # sin Authorization

    var error = http_request.request(
        VALIDATE_URL,
        headers,
        HTTPClient.METHOD_POST,
        JSON.stringify(body)
    )

    if error != OK:
        push_error("Failed to send request")

func _on_request_completed(result, response_code, headers, body):
    var ok = result == HTTPRequest.RESULT_SUCCESS and response_code == 200

    if ok:
        consecutive_failures = 0
        if first_validation:
            first_validation = false
            get_tree().change_scene_to_file("res://MainGame.tscn")
        return

    # 403 = sesion invalida / superada / expirada / acceso perdido -> cerrar.
    # Tambien cerramos si falla la validacion inicial.
    if response_code == 403 or first_validation:
        push_error("Validation failed: " + str(response_code))
        get_tree().quit()
        return

    # Error de red transitorio en un heartbeat: tolerar un par de fallos.
    consecutive_failures += 1
    if consecutive_failures >= 2:
        push_error("Validation failed (network): " + str(response_code))
        get_tree().quit()

