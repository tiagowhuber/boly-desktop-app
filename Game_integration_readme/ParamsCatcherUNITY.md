using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;
using UnityEngine.SceneManagement;

public class ParamsCatcher : MonoBehaviour
{
    // ID del juego (configurar manualmente por build; el launcher tambien lo
    // envia por -game_id).
    int gameId = 5;

    // Clave de sesion recibida por argumentos (-key). Es la UNICA credencial.
    // El JWT del usuario ya NO se recibe ni se usa (-token fue eliminado).
    string key = "";

    // Intervalo del heartbeat. Debe ser menor al TTL del servidor (~3 min).
    const float HEARTBEAT_SECONDS = 60f;

    const string VALIDATE_URL = "https://ffstudios-shop-api.vercel.app/v1/validate/validate";

    bool firstValidation = true;
    int consecutiveFailures = 0;

    void Start()
    {
        // Mantener vivo este objeto para poder hacer heartbeat tras cargar la escena.
        DontDestroyOnLoad(this.gameObject);

        // Obtener argumentos de linea de comandos
        string[] args = System.Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "-key":
                    if (i + 1 < args.Length) key = args[i + 1];
                    break;

                case "-game_id":
                    if (i + 1 < args.Length) int.TryParse(args[i + 1], out gameId);
                    break;
            }
        }

        // La key es obligatoria; sin ella no hay sesion.
        if (string.IsNullOrEmpty(key) || gameId < 0)
        {
            Debug.LogError("Validation error: missing -key.");
            Application.Quit();
            return;
        }

        StartCoroutine(ValidationLoop());
    }

    IEnumerator ValidationLoop()
    {
        // Validacion inicial antes de entrar al juego.
        yield return SendValidationRequest();

        // Heartbeat periodico mientras el juego corre. Si la sesion fue
        // superada por otra maquina, expiro, o se perdio el acceso, el servidor
        // responde 403 y cerramos el juego.
        while (true)
        {
            yield return new WaitForSeconds(HEARTBEAT_SECONDS);
            yield return SendValidationRequest();
        }
    }

    IEnumerator SendValidationRequest()
    {
        // Body en JSON: solo game_id + key (sin token).
        string jsonBody = JsonUtility.ToJson(new ValidationData(gameId, key));

        UnityWebRequest request = new UnityWebRequest(VALIDATE_URL, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        // Sin header Authorization: la key es la credencial.

        yield return request.SendWebRequest();

        bool success = request.result == UnityWebRequest.Result.Success; // HTTP 2xx
        bool httpError = request.result == UnityWebRequest.Result.ProtocolError; // 4xx/5xx (ej. 403)

        if (success)
        {
            consecutiveFailures = 0;
            if (firstValidation)
            {
                firstValidation = false;
                SceneManager.LoadScene(1); // cargar escena principal
            }
            yield break;
        }

        // 403 = sesion invalida / superada / expirada / acceso perdido -> cerrar.
        // Tambien cerramos si falla la validacion inicial.
        if (httpError || firstValidation)
        {
            Debug.LogError("Validation failed: " + request.error);
            Application.Quit();
            yield break;
        }

        // Error de red transitorio en un heartbeat: tolerar un par de fallos.
        consecutiveFailures++;
        if (consecutiveFailures >= 2)
        {
            Debug.LogError("Validation failed (network): " + request.error);
            Application.Quit();
        }
    }

    // Clase para serializar los datos enviados a la API
    [System.Serializable]
    public class ValidationData
    {
        public int game_id;
        public string key;

        public ValidationData(int gameId, string key)
        {
            this.game_id = gameId;
            this.key = key;
        }
    }
}

