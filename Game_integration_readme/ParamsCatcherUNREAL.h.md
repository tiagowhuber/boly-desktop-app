// Guarda este archivo como ValidationSubsystem.h
//
// Antes era un AActor colocado en la escena, pero un actor (y su timer del
// World) se DESTRUYE al hacer OpenLevel, deteniendo el heartbeat. Un
// UGameInstanceSubsystem vive en el GameInstance, que PERSISTE entre niveles,
// y el heartbeat usa FTSTicker (ticker global, no atado a un UWorld), por lo
// que sigue corriendo siempre. El subsystem se auto-crea: no hay que colocar
// nada en la escena ni configurar un GameInstance custom.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Containers/Ticker.h"
#include "Interfaces/IHttpRequest.h"
#include "ValidationSubsystem.generated.h"

UCLASS()
class YOURPROJECT_API UValidationSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

private:
    int32 GameId = 5;               // <-- set to THIS game's platform id
    FString Key = "";
    float HeartbeatSeconds = 60.0f;
    float TimeSinceLastBeat = 0.0f;
    bool bFirstValidation = true;
    int32 ConsecutiveFailures = 0;

    FTSTicker::FDelegateHandle TickerHandle;

    void ParseCommandLine();
    bool Tick(float DeltaTime);
    void SendValidationRequest();
    void OnResponseReceived(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);
    void QuitGame();
};
