#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Http.h"
#include "ValidationManager.generated.h"

UCLASS()
class YOURPROJECT_API AValidationManager : public AActor
{
    GENERATED_BODY()

public:
    AValidationManager();

protected:
    virtual void BeginPlay() override;

private:

    // ID del juego (configurar manualmente; el launcher tambien lo envia por -game_id)
    int32 GameId = 5;

    // Clave de sesion recibida por -key. Es la UNICA credencial.
    // El JWT del usuario ya NO se recibe ni se usa (-token fue eliminado).
    FString Key = "";

    // Heartbeat: debe ser menor al TTL del servidor (~3 min).
    float HeartbeatSeconds = 60.0f;
    FTimerHandle HeartbeatTimer;

    bool bFirstValidation = true;
    int32 ConsecutiveFailures = 0;

    void ParseCommandLine();
    void SendValidationRequest();
    void OnResponseReceived(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);
};

