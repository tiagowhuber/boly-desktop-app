#include "ValidationManager.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetSystemLibrary.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"

AValidationManager::AValidationManager()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AValidationManager::BeginPlay()
{
    Super::BeginPlay();

    ParseCommandLine();

    // La key es obligatoria; sin ella no hay sesion.
    if (!Key.IsEmpty() && GameId >= 0)
    {
        // Validacion inicial
        SendValidationRequest();

        // Heartbeat periodico mientras el juego corre
        GetWorldTimerManager().SetTimer(
            HeartbeatTimer, this, &AValidationManager::SendValidationRequest,
            HeartbeatSeconds, true);
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("Validation error: missing -key"));
        UKismetSystemLibrary::QuitGame(GetWorld(), nullptr, EQuitPreference::Quit, false);
    }
}

void AValidationManager::ParseCommandLine()
{
    FString CmdLine = FCommandLine::Get();

    // Nota: FParse::Value espera el formato -key=valor. El launcher de Boly
    // envia -key <valor> (separado por espacio); ajusta el parseo segun como
    // empaquetes el ejecutable. El JWT (-token) ya no se envia.
    FParse::Value(*CmdLine, TEXT("-key="), Key);
    FParse::Value(*CmdLine, TEXT("-game_id="), GameId);

    UE_LOG(LogTemp, Warning, TEXT("GameId: %d"), GameId);
}

void AValidationManager::SendValidationRequest()
{
    FString Url = TEXT("https://ffstudios-shop-api.vercel.app/v1/validate/validate");

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();

    Request->SetURL(Url);
    Request->SetVerb("POST");
    Request->SetHeader("Content-Type", "application/json");
    // Sin header Authorization: la key es la credencial.

    // Body en JSON: solo game_id + key (sin token).
    FString JsonBody = FString::Printf(
        TEXT("{\"game_id\": %d, \"key\": \"%s\"}"),
        GameId,
        *Key
    );

    Request->SetContentAsString(JsonBody);
    Request->OnProcessRequestComplete().BindUObject(this, &AValidationManager::OnResponseReceived);
    Request->ProcessRequest();
}

void AValidationManager::OnResponseReceived(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
    const int32 Code = (bWasSuccessful && Response.IsValid()) ? Response->GetResponseCode() : 0;

    if (Code == 200)
    {
        ConsecutiveFailures = 0;
        if (bFirstValidation)
        {
            bFirstValidation = false;
            UGameplayStatics::OpenLevel(GetWorld(), TEXT("MainLevel"));
        }
        return;
    }

    // 403 = sesion invalida / superada / expirada / acceso perdido -> cerrar.
    // Tambien cerramos si falla la validacion inicial.
    if (Code == 403 || bFirstValidation)
    {
        UE_LOG(LogTemp, Error, TEXT("Validation failed: %d"), Code);
        UKismetSystemLibrary::QuitGame(GetWorld(), nullptr, EQuitPreference::Quit, false);
        return;
    }

    // Error de red transitorio en un heartbeat: tolerar un par de fallos.
    if (++ConsecutiveFailures >= 2)
    {
        UE_LOG(LogTemp, Error, TEXT("Validation failed (network): %d"), Code);
        UKismetSystemLibrary::QuitGame(GetWorld(), nullptr, EQuitPreference::Quit, false);
    }
}

